/**
 * Sitemap generator for the TanStack Router application.
 *
 * Initially based on the idea of
 * <https://github.com/Ryanjso/tanstack-router-sitemap>
 * but implemented to generate a response stream instead of a static file.
 */

import type { XMLBuilderCB } from "xmlbuilder2/lib/interfaces"
import type { FileRoutesByFullPath } from "@/routeTree.gen"
import { Schema } from "effect"
import { createCB } from "xmlbuilder2"

export const ChangeFreq = Schema.Union(
  Schema.Literal("hourly"),
  Schema.Literal("daily"),
  Schema.Literal("weekly"),
  Schema.Literal("monthly"),
  Schema.Literal("yearly"),
  Schema.Literal("always"),
  Schema.Literal("never"),
)

export const Priority = Schema.NumberFromString.pipe(
  Schema.filter(p => p >= 0 && p <= 1 ? undefined : "Priority must be between 0 and 1"),
)

export const SitemapEntry = Schema.Struct({
  loc: Schema.String,
  lastmod: Schema.optional(
    Schema.DateFromString,
  ),
  changefreq: Schema.optional(
    ChangeFreq,
  ),
  priority: Schema.optional(
    Priority,
  ),
})

type SitemapEntryOpts = Omit<typeof SitemapEntry.Type, "loc">

type SitemapGen = () => (SitemapEntryOpts & { path: string })[]

export type SitemapConfig<T> = {
  readonly [K in keyof T]: SitemapEntryOpts | SitemapGen | null
}

interface SitemapOptions { siteUrl: string }

/**
 * Add a sitemap entry to the urlset element.
 */
function addSitemapEntry(urlset: XMLBuilderCB, loc: string, value: SitemapEntryOpts) {
  const url = urlset.ele("url")
  url.ele("loc").txt(loc).up()

  Object.entries(value).forEach(([name, content]) => {
    if (content instanceof Date) {
      url.ele(name).txt(content.toISOString()).up()
    }
    else {
      url.ele(name).txt(String(content)).up()
    }
  })

  url.up()
}

export function feedAll(config: SitemapConfig<FileRoutesByFullPath>, dest: XMLBuilderCB, { siteUrl }: SitemapOptions) {
  Object.entries(config).forEach(async ([key, value]) => {
    if (!value) {
      return
    }
    if (typeof value === "function") {
      // OPTIMIZE: Tweak to read from a Node stream
      value().forEach(({ path, ...value }) => {
        addSitemapEntry(dest, siteUrl + path, value)
      })
    }
    else if (typeof value === "object") {
      addSitemapEntry(dest, siteUrl + key, value)
    }
  })
}

export function buildSitemapStream(config: SitemapConfig<FileRoutesByFullPath>) {
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      const stream = createCB({
        data: (chunk: string) => {
          controller.enqueue(encoder.encode(chunk))
        },
        end: () => {
          controller.close()
        },
        error: (error: Error) => {
          controller.error(error)
        },
      })

      const urlset = stream.ele("urlset", {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
        // Currently unused name spaces
        // "xmlns:news": "http://www.google.com/schemas/sitemap-news/0.9",
        // "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        // "xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1",
        // "xmlns:video": "http://www.google.com/schemas/sitemap-video/1.1",
      })

      feedAll(config, urlset, {
        siteUrl: "https://jingsi.space",
      })

      urlset.end()
    },
  })
}
