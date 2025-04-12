import { defineConfig } from "@tanstack/react-start/config"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import tsConfigPaths from "vite-tsconfig-paths"
import { collections } from "./vite/plugins/collections"

export default defineConfig({
  server: {
    preset: 'vercel',
  },
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      collections(),
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
