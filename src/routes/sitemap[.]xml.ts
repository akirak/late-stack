import type { FileRoutesByFullPath } from "@/routeTree.gen"
import type { SitemapConfig } from "@/utils/sitemap"
import * as fs from "node:fs"
import * as path from "node:path"
import { createFileRoute } from "@tanstack/react-router"
import { getDataDir } from "@/utils/data"
import { buildSitemapStream } from "@/utils/sitemap"

const sitemapConfig: SitemapConfig<FileRoutesByFullPath> = {
  "/": {
    priority: 1.0,
    changefreq: "monthly",
  },
  "/about": null,
  "/about/$lang": () => ["en", "ja"].map(lang => ({
    path: `/about/${lang}`,
    priority: 0.5,
  })),
  "/posts": null,
  "/posts/$lang": null,
  "/posts/$lang/$slug": () => {
    const dataPath = path.resolve(getDataDir(), "posts.index.jsonl")

    if (!fs.existsSync(dataPath)) {
      console.warn("posts.index.jsonl not found. Running build first to generate post data.")
      return []
    }

    const fileContent = fs.readFileSync(dataPath, "utf-8")
    const posts = fileContent
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line))

    return posts.map((post: any) => ({
      path: `/posts/${post.language}/${post.slug}`,
      priority: 0.8,
      changeFrequency: "never" as const,
      lastModified: post.publicationDate ? new Date(post.publicationDate) : undefined,
    }))
  },
  "/feeds/default.xml": null,
  "/oembed/$embedId": null,
  "/sitemap.xml": null,
}

/**
 * A route for generating sitemap XML.
 *
 * For performance, this route should be pre-rendered during the build process.
   See the documentation for Nitro, for example.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildSitemapStream(sitemapConfig), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=86400",
          },
        })
      },
    },
  },
})
