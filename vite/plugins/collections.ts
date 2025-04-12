import { Plugin } from "vite"
import fs from "fs/promises"
import path from "node:path"
import matter from 'gray-matter';
import { Schema } from "effect"
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import { unified } from 'unified'
import { PostMetadata, PostMetadataSchema } from "../../src/schemas/post";

const cwd = new URL('.', import.meta.url).pathname

export function collections(): Plugin {
  return {
    name: "vite-plugin-collections",
    apply: "build",

    async buildStart() {
      const contentDir = path.resolve(cwd, "src/contents/posts")
      const files = await fs.readdir(contentDir)
      const index: PostMetadata[] = []

      for (const file of files) {
        const fullPath = path.join(contentDir, file)
        const doc = matter.read(fullPath)

        const basename = path.basename(file, ".md")

        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeSanitize)

        const mdast = processor.parse(doc.content)
        const hast = await processor.run(mdast)

        try {
          const metadata = Schema.decodeUnknownSync(PostMetadataSchema)({
            slug: basename,
            ...doc.data,
          })
          index.push(metadata)
          const outPath = path.resolve(cwd, "data", "posts", `${basename}.json`)
          const fullData = JSON.stringify({
            ...metadata,
            hastBody: hast,
          })
          await fs.writeFile(outPath, fullData)
        } catch (e) {
          this.error(
            `Validation failed for file: ${file}\n${JSON.stringify(e, null, 2)}`
          )
        }
      }

      /*
      const outputPath = path.resolve(cwd, "src/collections/posts.generated.ts")
      const tsContent = `// GENERATED FILE - DO NOT EDIT
import { Post } from "../schemas/post"

export const posts: Post[] = ${JSON.stringify(posts, null, 2)};
`
      await fs.writeFile(outputPath, tsContent)
      */
      this.info("✅ Generated blog collection")
    },
  }
}
