import type { PlatformError } from "@effect/platform/Error"
import type { Plugin } from "vite"
import { Effect, ManagedRuntime, pipe, String } from "effect"
import { makeCollectionsLayer, Pipeline } from "../../src/dev/collections"

export interface Options {
  contentDir: string
  outDir: string
}

/**
 * A Vite plugin that generates data for the Astro-like Collections API.
 */
export function collections({ contentDir, outDir }: Options): Plugin {
  let mode: string
  let runtime: ManagedRuntime.ManagedRuntime<Pipeline, Error | PlatformError>

  const isContentFile = String.startsWith(contentDir)

  const withPipeline
    = (f: (p: typeof Pipeline.Service) => Effect.Effect<void, Error, Pipeline>) =>
      runtime.runPromise(Pipeline.pipe(Effect.andThen(f)))

  return {
    name: "vite-plugin-collections",

    config(_, env) {
      mode = env.command

      const production = mode === "build"

      runtime = pipe(
        makeCollectionsLayer({
          contentDir,
          outDir,
          production,
        }),
        ManagedRuntime.make,
      )
    },

    async configureServer(server) {
      return () => {
        server.watcher.on("add", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await withPipeline(pipeline => pipeline.handleFileAddition(filePath))
            }
            catch (e) {
              console.error(e)
            }
          }
        })
        server.watcher.on("change", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await withPipeline(pipeline => pipeline.handleFileModification(filePath))
            }
            catch (e) {
              console.error(e)
            }
          }
        })
        server.watcher.on("unlink", async (filePath: string) => {
          if (isContentFile(filePath)) {
            try {
              await withPipeline(pipeline => pipeline.handleFileDeletion(filePath))
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
      await withPipeline(pipeline => pipeline.buildAll)
      this.info("✅ Generated blog collection")
    },
  }
}
