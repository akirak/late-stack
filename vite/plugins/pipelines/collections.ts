import type { PostMetadata } from "@/collections/posts"
import fs from "node:fs/promises"
import path from "node:path"
import { Array, Context, Effect, Layer, pipe, Schema, String } from "effect"
import matter from "gray-matter"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { PostMetadataSchema } from "../../../src/schemas/post"

// The Effect runtime is used, but @effect/platform is not used here.

function getSlug(filename: string): string {
  const ext = path.extname(filename)
  return path.basename(filename, ext)
}

export class Config extends Context.Tag("Config")<
  Config,
  {
    readonly contentDir: string
    readonly outDir: string
    readonly production: boolean
  }
>() { }

export class Pipeline extends Context.Tag("Pipeline")<Pipeline, {
  readonly handleAddFile: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleModifyFile: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleDeleteFile: (filePath: string) => Effect.Effect<void, Error, never>
  readonly buildAll: Effect.Effect<void, never, never>
}>() { }

type Handler = (filePath: string) => Effect.Effect<void, Error, never>

export const PipelineLive: Layer.Layer<Pipeline, Error, Config> = Layer.effect(
  Pipeline,
  Effect.gen(function* (_) {
    const config = yield* Config
    const matchFilePath
      = (handlers: { [dir: string]: Handler }) =>
        (filePath: string) =>
          Effect.gen(function* () {
            const arr = pipe(
              path.relative(config.contentDir, filePath),
              String.split(path.sep),
            )
            if (arr.length == 2) {
              const type_ = arr[0]
              const handler = handlers[type_]
              if (!handler) {
                yield* Effect.fail(
                  new Error(`missing handler for ${type_}`),
                )
              }
              return yield* handler.call(null, filePath)
            }
          })
    { }

    let postIndex: PostMetadata[]

    const postProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)

    const updatePostIndex = Effect.promise(
      () =>
        fs.writeFile(path.join(config.outDir, "posts.index.json"), JSON.stringify(postIndex),
        ),
    )

    /**
     * The file must reside inside "posts" subdirectory under contentDir.
     */
    const processPost = (filePath: string) => Effect.promise(async () => {
      const doc = matter.read(filePath)

      const mdast = postProcessor.parse(doc.content)
      const hast = await postProcessor.run(mdast)

      try {
        const metadata = Schema.decodeUnknownSync(PostMetadataSchema)({
          fileName: path.basename(filePath),
          slug: getSlug(filePath),
          ...doc.data,
        })
        if (config.production && metadata.draft) {
          return null
        }
        const dir = path.join(config.outDir, "posts")
        await fs.mkdir(dir, { recursive: true })
        const outPath = path.resolve(dir, `${metadata.slug}.json`)
        const fullData = JSON.stringify({
          ...metadata,
          hastBody: hast,
        })
        await fs.writeFile(outPath, fullData)
        return metadata
      }
      catch (e) {
        throw new Error(`Validation failed for file: ${filePath}\n${JSON.stringify(e, null, 2)}`)
      }
    })

    const clean = Effect.promise(() => fs.rm(path.join(config.outDir, "*.*"), {
      force: true,
      recursive: true,
    }))

    return {
      handleAddFile: matchFilePath({
        posts: filePath => Effect.gen(function* () {
          const metadata = yield* processPost(filePath)
          // In development, the returned value is never null, but this is only
          // for type checking.
          if (metadata) {
            postIndex.push(metadata)
            yield* updatePostIndex
          }
        }),
      }),
      handleModifyFile: matchFilePath({
        posts: filePath => Effect.gen(function* () {
          const fileName = path.basename(filePath)
          const metadata = yield* processPost(filePath)
          // In development, the returned value is never null, but this is only
          // for type checking.
          if (metadata) {
            postIndex[postIndex.findIndex(metadata => metadata.fileName === fileName)] = metadata
          }
        }),
      }),
      handleDeleteFile: matchFilePath({
        posts: filePath => Effect.gen(function* () {
          const fileName = path.basename(filePath)
          delete postIndex[postIndex.findIndex(metadata => metadata.fileName === fileName)]
          yield* updatePostIndex
        }),
      }),
      buildAll: Effect.gen(function* () {
        if (config.production) {
          console.log("Cleaning ...")
          yield* clean
        }
        yield* Effect.promise(() => fs.mkdir(config.outDir, { recursive: true }))
        const dir = path.join(config.contentDir, "posts")
        const files = yield* Effect.promise(() => fs.readdir(dir))
        postIndex = yield* Effect.all(
          files.map(fileName => processPost(path.join(dir, fileName))),
        ).pipe(
          // In production, the metadata of draft posts will be null.
          Effect.map(Array.filter(metadata => !!metadata)),
        )
        yield* updatePostIndex
      }),
    } as const
  }),
)
