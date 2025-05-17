import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { collections } from "./vite/plugins/collections"

const root = new URL(".", import.meta.url).pathname

export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    collections({
      contentDir: path.resolve(root, "src/contents"),
      outDir: path.resolve(root, "data"),
    }),
  ],
  build: {
    sourcemap: true,
  },
})
