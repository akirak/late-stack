/**
 * Sitemap generator for the TanStack Router application.
 *
 * Initially based on the idea of
 * <https://github.com/Ryanjso/tanstack-router-sitemap>
 * but implemented to generate a response stream instead of a static file.
 */

import type { ElementObject } from "xml"
import type { FileRoutesByFullPath } from "@/routeTree.gen"
import { Schema } from "effect"
import xml from "xml"

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
 * Make a sitemap entry for xml package.
 */
function makeSitemapEntry(loc: string, value: SitemapEntryOpts) {
  const fields = []
  fields.push({ loc })
  Object.entries(value).forEach(([name, content]) => {
    fields.push(Object.fromEntries([[name, content]]))
  })
  return {
    url: fields,
  }
}

export function feedAll(config: SitemapConfig<FileRoutesByFullPath>, dest: ElementObject, { siteUrl }: SitemapOptions) {
  Object.entries(config).forEach(async ([key, value]) => {
    if (!value) {
      return
    }
    if (typeof value === "function") {
      // OPTIMIZE: Tweak to read from a Node stream
      value().forEach(({ path, ...value }) => {
        dest.push(makeSitemapEntry(siteUrl + path, value))
      })
    }
    else if (typeof value === "object") {
      dest.push(makeSitemapEntry(siteUrl + key, value))
    }
  })
}

export function buildSitemapStream(config: SitemapConfig<FileRoutesByFullPath>) {
  const root = xml.element({
    _attr: {
      xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
      // Currently unused name spaces
      // "xmlns:news": "http://www.google.com/schemas/sitemap-news/0.9",
      // "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
      // "xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1",
      // "xmlns:video": "http://www.google.com/schemas/sitemap-video/1.1",
    },
  })

  const stream = xml({ urlset: root }, { stream: true, declaration: true })

  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(encoder.encode(chunk))
      })

      stream.on("end", () => {
        controller.close()
      })

      stream.on("error", (error) => {
        controller.error(error)
      })

      feedAll(config, root, {
        siteUrl: "https://jingsi.space",
      })
      root.close()
    },
  })
}
