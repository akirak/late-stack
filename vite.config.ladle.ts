import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// This configuration is for Ladle, a tool for building and testing UI
// components. It should be the same as vite.config.ts, but without the TanStack
// Start plugin and collections plugin.

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
      // Suppress errors related to missing tsconfig files in dependencies
      //
      // TSConfckParseError: parsing /git/work/personal/output/tanstack-blog/node_modules/.pnpm/@ladle+react@5.0.3_@swc+helpers@0.5.17_@types+node@22.15.32_@types+react@19.1.8_acorn@8_c33f6f83b7ea17b30694639bf6bf592d/node_modules/@ladle/react/typings-for-build/app/tsconfig.json failed: Error: ENOENT: no such file or directory, open '/git/work/personal/output/tanstack-blog/node_modules/.pnpm/@ladle+react@5.0.3_@swc+helpers@0.5.17_@types+node@22.15.32_@types+react@19.1.8_acorn@8_c33f6f83b7ea17b30694639bf6bf592d/node_modules/@ladle/react/typings-for-build/app/tsconfig.json'
      ignoreConfigErrors: true,
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
