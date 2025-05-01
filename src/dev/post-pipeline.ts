import type { PostMetadata } from "../collections/posts"
import { TextEncoder } from "node:util"
import { FileSystem, Path } from "@effect/platform"
import { Array, Console, Context, Effect, Layer, Option, Order, pipe, Schema, Stream } from "effect"
import matter from "gray-matter"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { PostMetadataSchema } from "../schemas/post"
import { Config } from "./pipeline-config"

type FileHandler = (filePath: string) => Effect.Effect<void, Error, never>

export class PostBuilder extends Context.Tag("PostBuilder")<PostBuilder, {
  readonly buildNewPost: FileHandler
  readonly rebuildPost: FileHandler
  readonly deletePost: FileHandler
  readonly buildAllPosts: Effect.Effect<void, Error, never>
}>() { }

const byOptionalDateDescending = Option.getOrder(
  Order.reverse(
    Order.Date,
  ),
)

export const PostBuilderLive: Layer.Layer<
  PostBuilder,
  Error,
  Config | Path.Path | FileSystem.FileSystem
> = Layer.effect(
  PostBuilder,
  Effect.gen(function* (_) {
    const config = yield* Config
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    // const db = yield* DuckDBWriter

    const postContentDir = path.join(config.contentDir, "posts")
    const postOutDir = path.join(config.outDir, "posts")
    const postIndexFile = path.join(config.outDir, "posts.index.jsonl")

    let postList: PostMetadata[]

    /**
     * posts.index.jsonl will be a JSON Lines file that contains an ordered list
     * of items. Consumers of the file can read only first N lines of the file
     * to get latest entries.
     */
    const writePostList = Effect.gen(function* () {
      postList = pipe(
        postList,
        Array.sortWith((x: PostMetadata) => x.publicationDate, byOptionalDateDescending),
      )
      const sink = fs.sink(postIndexFile, {
        flag: "w",
      })
      const encoder = new TextEncoder()
      yield* pipe(
        postList,
        Stream.fromIterable,
        // Convert Option to null, etc.
        Stream.mapEffect(Schema.encode(PostMetadataSchema)),
        Stream.map(encodedMeta => encoder.encode(`${JSON.stringify(encodedMeta)}\n`)),
        Stream.run(sink),
      )
    }).pipe(
      Effect.tapErrorCause(Effect.logError),
      Effect.catchTags({
        BadArgument: _E => Effect.fail(new Error(`Error while writing the post list: BadArgument`)),
        SystemError: _E => Effect.fail(new Error(`Error while writing the post list: SystemError`)),
      }),
    )

    const getSlug = (filename: string) =>
      path.basename(filename, path.extname(filename))

    const postProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)

    /**
     * The file must reside inside "posts" subdirectory under postContentDir.
     */
    const processPost = (filePath: string) => Effect.gen(function* () {
      const doc = matter.read(filePath)

      const mdast = postProcessor.parse(doc.content)
      const hast = yield* Effect.promise(() => postProcessor.run(mdast))

      try {
        const metadata = yield* Schema.decodeUnknown(PostMetadataSchema)({
          fileName: path.basename(filePath),
          slug: getSlug(filePath),
          ...doc.data,
        })
        if (config.production && metadata.draft) {
          return Option.none() as Option.Option<PostMetadata>
        }
        yield* fs.makeDirectory(postOutDir, { recursive: true })
        const outPath = path.resolve(postOutDir, `${metadata.slug}.json`)
        const fullData = JSON.stringify({
          ...metadata,
          hastBody: hast,
        })
        yield* fs.writeFileString(outPath, fullData)
        return Option.some(metadata) as Option.Option<PostMetadata>
      }
      catch (e) {
        throw new Error(`Validation failed for file: ${filePath}\n${JSON.stringify(e, null, 2)}`)
      }
    }).pipe(
      Effect.tapErrorCause(Effect.logError),
      Effect.catchTags({
        BadArgument: _E => Effect.fail(new Error(`Error while processing a post: BadArgument`)),
        SystemError: _E => Effect.fail(new Error(`Error while processing a post: SystemError`)),
        ParseError: _E => Effect.fail(new Error(`Error while processing a post: ParseError`)),
      }),
    )

    const buildAllPosts = Effect.gen(function* () {
      postList = []
      yield* fs.makeDirectory(postOutDir, { recursive: true }).pipe(
        Effect.tapErrorCause(Effect.logError),
        Effect.catchTags({
          BadArgument: _E => Effect.fail(new Error(`Error while making a directory: BadArgument`)),
          SystemError: _E => Effect.fail(new Error(`Error while making a directory: SystemError`)),
        }),
      )
      yield* fs.readDirectory(postContentDir).pipe(
        Effect.tapErrorCause(Effect.logError),
        Effect.catchIf(
          error => error._tag === "BadArgument" || error._tag === "SystemError",
          () => Effect.fail(new Error(`Error while reading a directory: PlatformError`)),
        ),
        Effect.tap(files => Console.log(`Processing ${files.length} posts...`)),
        Effect.map(files =>
          files.map(fileName => processPost(path.join(postContentDir, fileName))),
        ),
        Effect.andThen(Effect.all),
        Effect.map(Array.filterMap(x => x)),
        Effect.tap(posts =>
          Effect.fail(new Error("Build fails if there is no post to publish.")).pipe(
            Effect.when(() => posts.length === 0),
          ),
        ),
        Effect.tap(posts => Effect.gen(function* () {
          postList = posts
          yield* writePostList
        })),
        // Effect.map(Stream.fromIterable),
        // Effect.andThen(db.createNewTableFromStream({ tableName: "posts" })),
      )
    }).pipe(
      Effect.scoped,
    )

    return {
      buildNewPost: filePath => Effect.gen(function* () {
        const postMetadata = Option.getOrNull(yield* processPost(filePath))!
        const index = postList.findIndex(post => post.fileName === postMetadata.fileName)
        // This method can be run multiple times because of how filesystem
        // events work, so check if the operation has not been done yet.
        if (!index) {
          postList.push(postMetadata)
          yield* writePostList
        }
      }),

      rebuildPost: filePath => Effect.gen(function* () {
        const postMetadata = Option.getOrNull(yield* processPost(filePath))!
        const index = postList.findIndex(post => post.fileName === postMetadata.fileName)
        postList[index] = postMetadata
        yield* writePostList
      }),

      deletePost: filePath => Effect.gen(function* () {
        const fileName = path.basename(filePath)
        const index = postList.findIndex(post => post.fileName === fileName)
        // This method can be run multiple times because of how filesystem
        // events work, so check if the operation has not been done yet.
        if (index) {
          delete postList[index]
          yield* writePostList
        }
      }),

      buildAllPosts,
    } as const
  }),
)
