import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
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
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/data/**"],
    },
  },
})
