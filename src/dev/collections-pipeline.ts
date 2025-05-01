import type { Scope } from "effect"
import { FileSystem, Path } from "@effect/platform"
import { NodeCommandExecutor, NodeFileSystem, NodePath } from "@effect/platform-node"
import { Console, Context, Effect, Layer, Match, pipe, Queue, Ref, Stream, String } from "effect"
import { Config } from "./pipeline-config"
import { PostBuilder, PostBuilderLive } from "./post-pipeline"

export class Pipeline extends Context.Tag("Pipeline")<Pipeline, {
  readonly handleFileAddition: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleFileModification: (filePath: string) => Effect.Effect<void, Error, never>
  readonly handleFileDeletion: (filePath: string) => Effect.Effect<void, Error, never>
  readonly buildAll: Effect.Effect<void, Error, never>
}>() { }

type Handler = (filePath: string) => Effect.Effect<void, Error, never>

type FileEventType = "add" | "remove" | "change"

interface FileEvent {
  type_: FileEventType
  filePath: string
}

export const PipelineLive: Layer.Layer<
  Pipeline,
  Error,
  Config | FileSystem.FileSystem | Path.Path | PostBuilder | Scope.Scope
> = Layer.effect(
  Pipeline,
  Effect.gen(function* (_) {
    yield* Console.log("Instantiating the build pipeline")

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

    // Use Ref to track the status of buildAll to prevent multiple runs
    const allBuildingOrBuilt = yield* Ref.make(false)

    const buildAll = Effect.gen(function* () {
      yield* Console.log("Building all")
      if (config.production) {
        yield* Console.log("Cleaning up the directory (if any) for the production build ...")
        yield* clean
      }
      yield* ensureOutDirectory
      yield* posts.buildAllPosts
    })

    const queue = yield* Queue.unbounded<FileEvent>()

    const matchFileEvent = Match.type<FileEvent>().pipe(
      Match.when(
        { type_: "add" },
        ({ filePath }) => matchFilePath({
          posts: posts.buildNewPost,
        })(filePath),
      ),
      Match.when(
        { type_: "change" },
        ({ filePath }) => matchFilePath({
          posts: posts.rebuildPost,
        })(filePath),
      ),
      Match.when(
        { type_: "remove" },
        ({ filePath }) => matchFilePath({
          posts: posts.deletePost,
        })(filePath),
      ),
      Match.exhaustive,
    )

    yield* Stream.fromQueue(queue).pipe(
      Stream.debounce("10 millis"),
      Stream.tap(ev => Console.log(JSON.stringify(ev))),
      Stream.runForEach(matchFileEvent),
      Effect.forkScoped,
    )

    return {
      handleFileModification: filePath => Queue.offer(queue, {
        type_: "change",
        filePath,
      }),
      handleFileAddition: filePath => Queue.offer(queue, {
        type_: "add",
        filePath,
      }),
      handleFileDeletion: filePath => Queue.offer(queue, {
        type_: "remove",
        filePath,
      }),
      buildAll: Effect.gen(function* () {
        yield* Ref.set(allBuildingOrBuilt, true)
        yield* buildAll
      }).pipe(
        Effect.tapError(_ => Ref.set(allBuildingOrBuilt, false)),
        Effect.unlessEffect(
          Ref.get(allBuildingOrBuilt),
        ),
      ),
    } as const
  }),
)

export function makePipelineLayer(config: {
  readonly contentDir: string
  readonly outDir: string
  readonly production: boolean
}) {
  const configLayer = Layer.succeed(
    Config,
    Config.of(config),
  )

  const postBuilderLayer = PostBuilderLive

  return PipelineLive.pipe(
    Layer.provide(postBuilderLayer),
    Layer.provide(configLayer),
    Layer.provide(NodeCommandExecutor.layer),
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(NodePath.layer),
    Layer.provide(Layer.scope),
  )
}
