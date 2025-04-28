import { defineConfig } from "@tanstack/react-start/config"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import tsConfigPaths from "vite-tsconfig-paths"
import { collections } from "./vite/plugins/collections"
import path from "node:path"

const root = new URL(".", import.meta.url).pathname

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      collections({
        contentDir: path.resolve(root, "src/contents"),
        outDir: path.resolve(root, "data"),
      }),
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
  },
})
