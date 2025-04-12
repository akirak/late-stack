import { FileSystem, Path } from "@effect/platform"
import { NodeCommandExecutor, NodeFileSystem, NodePath } from "@effect/platform-node"
import { Console, Context, Effect, Layer, pipe, String } from "effect"
import { Config } from "./config"
import { DuckDBWriterLive } from "./duckdb-writer"
import { PostBuilder, PostBuilderLive } from "./post-builder"

export class Pipeline extends Context.Tag("Pipeline")<Pipeline, {
  readonly handleFileAddition: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleFileModification: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleFileDeletion: (filePath: string) => Effect.Effect<void, Error, never>
  readonly buildAll: Effect.Effect<void, Error, never>
}>() { }

type Handler = (filePath: string) => Effect.Effect<void, Error, never>

export const PipelineLive: Layer.Layer<
  Pipeline,
  Error,
  Config | FileSystem.FileSystem | Path.Path | PostBuilder
> = Layer.effect(
  Pipeline,
  Effect.gen(function* (_) {
    const config = yield* Config
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const posts = yield* PostBuilder

    const matchFilePath
      = (handlers: { [dir: string]: Handler }) =>
        (filePath: string) =>
          Effect.gen(function* () {
            const arr = pipe(
              path.relative(config.contentDir, filePath),
              String.split(path.sep),
            )
            if (arr.length === 2) {
              const type_ = arr[0]
              const handler = handlers[type_]
              if (!handler) {
                yield* Effect.fail(
                  new Error(`missing handler for ${type_}`),
                )
              }
              return yield* handler(filePath)
            }
          })
    { }

    const clean = fs.remove(path.join(config.outDir, "*.*"), {
      force: true,
      recursive: true,
    }).pipe(
      Effect.tapErrorCause(Effect.logError),
      Effect.catchIf(
        error => error._tag === "BadArgument" || error._tag === "SystemError",
        () => Effect.fail(new Error(`Error during cleanup: PlatformError`)),
      ),
    )

    const ensureOutDirectory = fs.makeDirectory(config.outDir, { recursive: true })
      .pipe(
        Effect.tapErrorCause(Effect.logError),
        Effect.catchIf(
          error => error._tag === "BadArgument" || error._tag === "SystemError",
          () => Effect.fail(new Error(`Error creating a directory: PlatformError`)),
        ),
      )

    return {
      handleFileAddition: matchFilePath({
        posts: posts.buildNewPost,
      }),
      handleFileModification: matchFilePath({
        posts: posts.rebuildPost,
      }),
      handleFileDeletion: matchFilePath({
        posts: posts.deletePost,
      }),
      buildAll: Effect.gen(function* () {
        if (config.production) {
          yield* Console.log("Cleaning up the directory (if any) for the production build ...")
          yield* clean
        }
        yield* ensureOutDirectory
        yield* posts.buildAllPosts
      }),
    } as const
  }),
)

export function makeCollectionsLayer(config: {
  readonly contentDir: string
  readonly outDir: string
  readonly production: boolean
}) {
  const configLayer = Layer.succeed(
    Config,
    Config.of(config),
  )

  const duckdbLayer = DuckDBWriterLive.pipe(
    Layer.provide(configLayer),
  )

  const postBuilderLayer = PostBuilderLive.pipe(
    Layer.provide(duckdbLayer),
  )

  return PipelineLive.pipe(
    Layer.provide(postBuilderLayer),
    Layer.provide(configLayer),
    Layer.provide(NodeCommandExecutor.layer),
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(NodePath.layer),
  )
}
