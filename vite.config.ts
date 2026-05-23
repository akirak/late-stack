import type { Plugin } from "vite"
import path from "node:path"
import deno from "@deno/vite-plugin"
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { defineConfig } from "vite"
import { collections } from "./vite/plugins/collections"

const root = new URL(".", import.meta.url).pathname

function denoPlugins(): Plugin[] {
  return deno().map((plugin) => {
    const resolveId = plugin.resolveId

    if (!resolveId) {
      return plugin
    }

    return {
      ...plugin,
      resolveId(source, importer, options) {
        if (source.startsWith("\0")) {
          return null
        }

        if (typeof resolveId === "function") {
          return resolveId.call(this, source, importer, options)
        }

        return resolveId.handler.call(this, source, importer, options)
      },
    }
  })
}

export default defineConfig({
  plugins: [
    collections({
      contentDir: path.resolve(root, "src/contents"),
      outDir: path.resolve(root, "data"),
    }),
    tanstackStart(),
    viteReact(),
    nitroV2Plugin({
      preset: "deno_server",
    }),
    denoPlugins(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "react/jsx-runtime": path.resolve(root, "vite/shims/react-jsx-runtime.ts"),
      "react/jsx-dev-runtime": path.resolve(root, "vite/shims/react-jsx-runtime.ts"),
    },
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist(">= 0.25%")),
      cssModules: true,
    },
  },
  build: {
    cssMinify: "lightningcss",
    sourcemap: true,
    rollupOptions: {
      external: [
        "node:*",
      ],
    },
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/data/**"],
    },
  },
})
