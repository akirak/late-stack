import type { FileRoutesByFullPath } from "@/routeTree.gen"
import type { SitemapConfig } from "@/utils/sitemap"
import { createFileRoute } from "@tanstack/react-router"
import { Option, Schema } from "effect"
import { PostsIndexFile } from "@/collections/posts/list/types"
import { PostMetadataSchema } from "@/schemas/post"
import { readDataFile } from "@/utils/data"
import { buildSitemapStream } from "@/utils/sitemap"

const sitemapConfig: SitemapConfig<FileRoutesByFullPath> = {
  "/": {
    priority: 1.0,
    changefreq: "monthly",
  },
  "/about/": null,
  "/about/$lang": () => ["en", "ja"].map(lang => ({
    path: `/about/${lang}`,
    priority: 0.5,
  })),
  "/posts/": null,
  "/posts/$lang/": null,
  "/posts/$lang/$slug": () => {
    const fileContent = Option.getOrUndefined(readDataFile(PostsIndexFile))

    if (!fileContent) {
      console.warn("posts.index.jsonl not found. Running build first to generate post data.")
      return []
    }

    const posts = fileContent
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(line => Schema.decodeUnknownSync(PostMetadataSchema)(JSON.parse(line)))

    return posts.map(post => ({
      path: `/posts/${post.language}/${post.slug}`,
      priority: 0.8,
      changefreq: "never" as const,
      lastmod: post.publicationDate,
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
