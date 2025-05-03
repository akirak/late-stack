import * as path from "node:path"
import * as url from "node:url"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    globalSetup: path.join(__dirname, "setup.ts"),
    testTimeout: 30000,
    hookTimeout: 30000,
    workspace: [
      {
        test: {
          name: "e2e",
          include: [
            "tests/e2e/specs/**.test.ts",
          ],
        },
      },
    ],
  },
})
