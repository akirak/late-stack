import type { Plugin } from "vite"
import { Effect, Layer, ManagedRuntime, String } from "effect"
import { Config, Pipeline, PipelineLive } from "./pipelines/collections"

export interface Options {
  contentDir: string
  outDir: string
}

/**
 * A Vite plugin that generates data for the Astro-like Collections API.
 */
export function collections({ contentDir, outDir }: Options): Plugin {
  let mode: string
  let runtime: ManagedRuntime.ManagedRuntime<Pipeline, Error>

  const isContentFile = String.startsWith(contentDir)

  return {
    name: "vite-plugin-collections",

    config(_, env) {
      mode = env.command

      const configLayer = Layer.succeed(
        Config,
        Config.of({
          contentDir,
          outDir,
          production: mode === "build",
        }),
      )

      runtime = PipelineLive.pipe(
        Layer.provide(configLayer),
        ManagedRuntime.make,
      )
    },

    async configureServer(server) {
      return () => {
        server.watcher.on("add", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await runtime.runPromise(
                Pipeline.pipe(
                  Effect.andThen(pipeline => pipeline.handleAddFile(filePath)),
                ),
              )
            }
            catch (e) {
              console.error(e)
            }
          }
        })
        server.watcher.on("change", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await runtime.runPromise(
                Pipeline.pipe(
                  Effect.andThen(pipeline => pipeline.handleModifyFile(filePath)),
                ),
              )
            }
            catch (e) {
              console.error(e)
            }
          }
        })
        server.watcher.on("unlink", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await runtime.runPromise(
                Pipeline.pipe(
                  Effect.andThen(pipeline => pipeline.handleDeleteFile(filePath)),
                ),
              )
            }
            catch (e) {
              console.error(e)
            }
          }
        })

        server.middlewares.use((_request, _response, next) => {
          next()
        })
      }
    },

    /**
     * Called on server start.
     */
    async buildStart() {
      await runtime.runPromise(
        Pipeline.pipe(
          Effect.andThen(pipeline => pipeline.buildAll),
        ),
      )
      this.info("✅ Generated blog collection")
    },
  }
}
