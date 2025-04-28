import type { Plugin } from "vite"
import fs from "node:fs/promises"
import path from "node:path"
import { Schema } from "effect"
import matter from "gray-matter"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { PostMetadataSchema } from "../../src/schemas/post"
import { PostMetadata } from "@/collections/posts"

export interface Options {
  contentDir: string,
  outDir: string,
}

function getSlug(filename: string): string {
  const ext = path.extname(filename)
  return path.basename(filename, ext)
}

/**
 * A Vite plugin that generates data for the Astro-like Collections API.
 */
export function collections({ contentDir, outDir }: Options): Plugin {
  let mode: string

  async function buildAll() {
    const files = await fs.readdir(path.join(contentDir, "posts"))
    const index: PostMetadata[] = []

    for (const file of files) {
      const fullPath = path.join(contentDir, file)
      const doc = matter.read(fullPath)

      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)

      const mdast = processor.parse(doc.content)
      const hast = await processor.run(mdast)

      try {
        const metadata = Schema.decodeUnknownSync(PostMetadataSchema)({
          slug: getSlug(file),
          ...doc.data,
        })
        index.push(metadata)
        const dir = path.join(outDir, "posts")
        await fs.mkdir(dir, { recursive: true })
        const outPath = path.resolve(dir, `${metadata.slug}.json`)
        const fullData = JSON.stringify({
          ...metadata,
          hastBody: hast,
        })
        await fs.writeFile(outPath, fullData)
      }
      catch (e) {
        throw new Error(`Validation failed for file: ${file}\n${JSON.stringify(e, null, 2)}`,)
      }
    }

    await fs.writeFile(path.join(outDir, "posts.index.json"),
      JSON.stringify(index)
    )
  }

  return {
    name: "vite-plugin-collections",

    config(_, env) {
      mode = env.command
    },

    async configureServer(server) {
      const handleChange = async (_filePath: string) => {
        // update the data file
      }
      const handleAdd = async (_filePath: string) => {
        // update the data
        // rebuild the index
      }
      const handleUnlink = async (_filePath: string) => {
        // delete the data file
        // rebuild the index
      }

      return () => {
        server.watcher.on("add", handleAdd)
        server.watcher.on("change", handleChange)
        server.watcher.on("unlink", handleUnlink)

        server.middlewares.use((_request, _response, next) => {
          next()
        })
      }
    },

    /**
     * Called on server start.
     */
    async buildStart() {
      await buildAll()
      try {
        this.info("✅ Generated blog collection")
      } catch (e) {
        this.error(`Error during building: ${e}`)
      }
    },

    // async buildEnd(e?: Error) { }
  }
}
