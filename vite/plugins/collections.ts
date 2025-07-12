import type { PlatformError } from "@effect/platform/Error"
import type { ConfigError } from "effect/ConfigError"
import type { Plugin } from "vite"
import type { RouteUpdate } from "../../src/dev/types"
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

    async handleHotUpdate(ctx) {
      const { file } = ctx

      const reload = (entries: RouteUpdate[]) => {
        ctx.server.hot.send({
          type: "custom",
          event: "routes-reload",
          data: {
            entries,
          },
        })
      }

      if (!isContentFile(file)) {
        return
      }

      try {
        // Check if file exists to determine if it was added/modified or deleted
        const fileExists = fs.existsSync(file)

        if (fileExists) {
          // File was added or modified
          await withPipeline(pipeline => pipeline.handleFileChange(file, reload))
        }
        else {
          // File was deleted
          await withPipeline(pipeline => pipeline.handleFileDeletion(file, reload))
        }
      }
      catch (e) {
        console.error(e)
      }

      // Return empty array to prevent default HMR handling for content files
      return []
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
