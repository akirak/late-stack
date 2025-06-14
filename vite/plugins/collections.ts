import type { PlatformError } from "@effect/platform/Error"
import type { ConfigError } from "effect/ConfigError"
import type { Plugin } from "vite"
import * as fs from "node:fs"
import { Effect, ManagedRuntime, pipe, String } from "effect"
import { makePipelineLayer, Pipeline } from "../../src/dev/collections-pipeline"

export interface Options {
  contentDir: string
  outDir: string
}

/**
 * A Vite plugin that generates data for the Astro-like Collections API.
 */
export function collections({ contentDir, outDir }: Options): Plugin {
  let mode: string
  let runtime: ManagedRuntime.ManagedRuntime<Pipeline, Error | ConfigError | PlatformError>

  const isContentFile = String.startsWith(contentDir)

  const withPipeline
    = (f: (p: typeof Pipeline.Service) => Effect.Effect<void, Error, Pipeline>) =>
      runtime.runPromise(Pipeline.pipe(Effect.andThen(f)))

  return {
    name: "vite-plugin-collections",

    config(_, env) {
      mode = env.command

      const production = mode === "build"

      fs.mkdirSync(outDir, { recursive: true })

      runtime = pipe(
        makePipelineLayer({
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
