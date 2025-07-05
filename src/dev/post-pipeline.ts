import type { ConfigError } from "effect/ConfigError"
import type { D2 } from "./commands/d2"
import type { LinkMetadataService } from "./link-metadata/layer"
import type { PostMetadata } from "@/collections/posts/list/types"
import { TextEncoder } from "node:util"
import { FileSystem, Path } from "@effect/platform"
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"
import { Array, Console, Context, Effect, Layer, Option, Order, pipe, Schema, Stream } from "effect"
import GithubSlugger from "github-slugger"
import matter from "gray-matter"
import rehypeAutoLinkHeadings from "rehype-autolink-headings"
import rehypeExpressiveCode from "rehype-expressive-code"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import remarkCaptions from "remark-captions"
import remarkCustomHeaderId from "remark-custom-header-id"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { PostMetadataSchema, PostSchema } from "../schemas/post"
import * as EC from "../styles/expressive-code"
import { PostError, RemarkPluginDataError } from "./error"
import { Config } from "./pipeline-config"
import remarkAdmonitions from "./unified/remarkAdmonitions"
import remarkDiagram from "./unified/remarkDiagram"
import remarkLink from "./unified/remarkLink"

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
  Error | ConfigError,
  Config | Path.Path | FileSystem.FileSystem | LinkMetadataService | D2
> = Layer.effect(
  PostBuilder,
  Effect.gen(function* (_) {
    const config = yield* Config
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    // Create OGP runtime
    const ogpRuntime = yield* Effect.runtime<LinkMetadataService>()

    // Create D2 runtime
    const d2Runtime = yield* Effect.runtime<D2>()

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

    const ecConfig = yield* Effect.promise(() => EC.loadConfig())

    const admonitionSlugger = new GithubSlugger()

    const postProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkCustomHeaderId)
      .use(remarkAdmonitions, { slugger: admonitionSlugger })
      .use(remarkDiagram, { runtime: d2Runtime })
      .use(remarkLink, { runtime: ogpRuntime })
      .use(remarkCaptions, {
        external: {
          table: "Table:",
        },
      })
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeSanitize, {
        ...defaultSchema,
        // Don't prepend "user-content-" to every fragment ID
        clobberPrefix: "",
        tagNames: [
          ...(defaultSchema.tagNames ?? []),
          "video",
          "iframe",
          "diagram",
          "link-card",
          "svg",
          "span",
          "figure",
          "figcaption",
        ],
        attributes: {
          ...defaultSchema.attributes,
          "div": [
            ["className", /^admonition/],
            ["className", "youtube-embed"],
            ["style"],
            ["aria-labelledby"],
          ],
          "span": [
            ["className"],
            ["aria-hidden"],
          ],
          "figure": [
            ["className"],
          ],
          "figcaption": [
            ["className"],
          ],
          "diagram": ["codeLanguage", "code", "__html"],
          "link-card": [
            ["url", /^https?:\/\//],
            ["headingLevel"],
            ["title"],
            ["image", /^https?:\/\//],
            ["imageAlt"],
            ["description"],
          ],
          "iframe": [
            "src",
            "width",
            "height",
            "frameborder",
            "allow",
            "allowfullscreen",
            "style",
          ],
        },
      })
      .use(rehypeAutoLinkHeadings, {
        behavior: "prepend",
        headingProperties: {
          className: ["linked-heading"],
        },
        properties(element) {
          return {
            "className": "heading-anchor",
            "data-heading-id": element.properties?.id,
          }
        },
      })
      .use(rehypeExpressiveCode, {
        ...ecConfig,
        plugins: [
          pluginCollapsibleSections(),
        ],
      })

    /**
     * The file must reside inside "posts" subdirectory under postContentDir.
     */
    const processPost = (filePath: string) => Effect.gen(function* () {
      const doc = matter.read(filePath)

      // Reset the slugger for each post
      admonitionSlugger.reset()

      const mdast = postProcessor.parse(doc.content)
      const hast = yield* Effect.tryPromise({
        try: () => postProcessor.run(mdast),
        catch: e => e instanceof RemarkPluginDataError
          ? new PostError({
            filePath,
            loc: e.loc,
            message: `In remark plugin ${e.plugin}: ${e.message}`,
          })
          : new PostError({
            filePath,
            message: (e instanceof Error ? e.message : String(e)),
          }),
      })

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
        const outPath = path.resolve(postOutDir, `${metadata.slug}.${metadata.language}.json`)
        const fullData = JSON.stringify(
          Schema.encodeUnknownSync(PostSchema)({
            ...metadata,
            hastBody: hast,
          }),
        )
        yield* fs.writeFileString(outPath, fullData)
        return Option.some(metadata) as Option.Option<PostMetadata>
      }
      catch (e) {
        throw new Error(`Validation failed for file: ${filePath}\n${JSON.stringify(e, null, 2)}`)
      }
    }).pipe(
      Effect.catchTags({
        BadArgument: _E => Effect.fail(new Error(`Error while processing a post: BadArgument`)),
        SystemError: _E => Effect.fail(new Error(`Error while processing a post: SystemError`)),
        ParseError: error => Effect.fail(new PostError({
          filePath,
          message: `${error._tag}\n${error.message}`,
        })),
      }),
      Effect.catchTag(
        "PostError",
        error => config.production
          ? Effect.fail(new Error(
              `Failed to process a post: ${error.filePath}: ${error.message}`,
            ))
          : Console.warn(
              `Error: Failed to process a post: ${error.filePath}${
                error.loc ? `:${error.loc.line}:${error.loc.column}` : ""
              }: ${error.message}\n`
              + `Errors on posts are ignored in development, but will fail the build in production.`,
            ).pipe(
              Effect.as(Option.none() as Option.Option<PostMetadata>),
            ),
      ),
      Effect.tapErrorCause(Effect.logError),
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
      )
    }).pipe(
      Effect.scoped,
    )

    return {
      buildNewPost: filePath => Effect.gen(function* () {
        const postMetadata = Option.getOrNull(yield* processPost(filePath))!
        if (postMetadata) {
          const index = postList.findIndex(post => post.fileName === postMetadata.fileName)
          // This method can be run multiple times because of how filesystem
          // events work, so check if the operation has not been done yet.
          if (!index) {
            postList.push(postMetadata)
            yield* writePostList
          }
        }
      }),

      rebuildPost: filePath => Effect.gen(function* () {
        const postMetadata = Option.getOrNull(yield* processPost(filePath))!
        if (postMetadata) {
          const index = postList.findIndex(post => post.fileName === postMetadata.fileName)
          postList[index] = postMetadata
          yield* writePostList
        }
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
