import type { FileRoutesByFullPath } from "@/routeTree.gen"
import type { SitemapConfig } from "@/utils/sitemap"
import * as fs from "node:fs"
import * as path from "node:path"
import { createServerFileRoute } from "@tanstack/react-start/server"
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
  "/post": null,
  "/post/$lang": null,
  "/post/$lang/$slug": () => {
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
      path: `/post/${post.language}/${post.slug}`,
      priority: 0.8,
      changeFrequency: "never" as const,
      lastModified: post.publicationDate ? new Date(post.publicationDate) : undefined,
    }))
  },
}

/**
 * A route for generating sitemap XML.
 *
 * For performance, this route should be pre-rendered during the build process.
   See the documentation for Nitro, for example.
 */
export const ServerRoute = createServerFileRoute("/sitemap.xml").methods({
  GET: async () => {
    return new Response(buildSitemapStream(sitemapConfig), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400",
      },
    })
  },
})
