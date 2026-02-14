/**
 * Sitemap generator for the TanStack Router application.
 *
 * Initially based on the idea of
 * <https://github.com/Ryanjso/tanstack-router-sitemap>
 * but implemented to generate a response stream instead of a static file.
 */

import type { FileRoutesByFullPath } from "@/routeTree.gen"
import { Schema } from "effect"

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

function escapeXmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function streamFromString(value: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const chunk = encoder.encode(value)

  return new ReadableStream({
    start(controller) {
      controller.enqueue(chunk)
      controller.close()
    },
  })
}

function renderSitemapEntry(loc: string, value: SitemapEntryOpts): string {
  const parts = [`<url><loc>${escapeXmlText(loc)}</loc>`]

  Object.entries(value).forEach(([name, content]) => {
    if (content === undefined) {
      return
    }

    const normalized = content instanceof Date
      ? content.toISOString()
      : String(content)

    parts.push(`<${name}>${escapeXmlText(normalized)}</${name}>`)
  })

  parts.push("</url>")
  return parts.join("")
}

function buildSitemapXml(config: SitemapConfig<FileRoutesByFullPath>, { siteUrl }: SitemapOptions): string {
  const entries: string[] = []

  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      return
    }

    if (typeof value === "function") {
      value().forEach(({ path, ...entry }) => {
        entries.push(renderSitemapEntry(siteUrl + path, entry))
      })
      return
    }

    entries.push(renderSitemapEntry(siteUrl + key, value))
  })

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    entries.join(""),
    "</urlset>",
  ].join("")
}

export function buildSitemapStream(config: SitemapConfig<FileRoutesByFullPath>) {
  const xml = buildSitemapXml(config, {
    siteUrl: "https://jingsi.space",
  })

  return streamFromString(xml)
}
