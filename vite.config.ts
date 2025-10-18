import path from "node:path"
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { collections } from "./vite/plugins/collections"

const root = new URL(".", import.meta.url).pathname

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    collections({
      contentDir: path.resolve(root, "src/contents"),
      outDir: path.resolve(root, "data"),
    }),
    tanstackStart(),
    nitroV2Plugin(),
    viteReact(),
  ],
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
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/data/**"],
    },
  },
})
