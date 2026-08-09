import type { PlatformError } from "@effect/platform/Error"
import type { ConfigError } from "effect/ConfigError"
import type { Plugin } from "vite"
import type { RouteUpdate } from "../../src/dev/types"
import * as fs from "node:fs"
import * as path from "node:path"
import { Effect, ManagedRuntime, pipe, String } from "effect"
import { makePipelineLayer, Pipeline } from "../../src/dev/collections-pipeline"

export interface Options {
  contentDir: string
  outDir: string
}

const VirtualCollectionsData = "virtual:collections-data"
const ResolvedVirtualCollectionsData = `\0${VirtualCollectionsData}`

function readDataFiles(dir: string, root = dir): Record<string, string> {
  if (!fs.existsSync(dir)) {
    return {}
  }

  return Object.fromEntries(
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        return Object.entries(readDataFiles(entryPath, root))
      }

      if (!entry.isFile() || ![".html", ".json", ".jsonl"].includes(path.extname(entry.name))) {
        return []
      }

      return [[path.relative(root, entryPath).split(path.sep).join("/"), fs.readFileSync(entryPath, "utf8")]]
    }),
  )
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

    resolveId(id) {
      if (id === VirtualCollectionsData) {
        return ResolvedVirtualCollectionsData
      }
    },

    load(id) {
      if (id === ResolvedVirtualCollectionsData) {
        return `export const dataFiles = ${JSON.stringify(readDataFiles(outDir))}`
      }
    },

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

        const dataModule = ctx.server.moduleGraph.getModuleById(ResolvedVirtualCollectionsData)
        if (dataModule) {
          ctx.server.moduleGraph.invalidateModule(dataModule)
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
