import path from "node:path"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import { collections } from "./vite/plugins/collections"

const root = new URL(".", import.meta.url).pathname

export default defineConfig({
  plugins: [
    collections({
      contentDir: path.resolve(root, "src/contents"),
      outDir: path.resolve(root, "data"),
    }),
    tanstackStart(),
    viteReact(),
    nitro({
      compatibilityDate: "2026-08-09",
      preset: "cloudflare_module",
      cloudflare: {
        deployConfig: true,
        wrangler: {
          name: "jingsi-space",
        },
      },
    }),
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
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/data/**"],
    },
  },
})
