import type { OgType } from "@/schemas/link-metadata"

const TitleSuffix = ` — jingsi.space`

const FallbackImageUrl = "/ogp/fallback-hotpot.png"

const fallbackImageProps = [
  { name: "twitter:image", content: FallbackImageUrl },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "og:image", content: FallbackImageUrl },
  { name: "og:image:width", content: "1200" },
  { name: "og:image:height", content: "630" },
  { name: "og:image:alt", content: "jingsi.space" },
]

interface Seo {
  ogType: typeof OgType.Type
  title: string
  description?: string
  image?: string
  keywords?: string
}

function internalMeta({
  description,
  keywords,
  image,
  ogType,
}: Omit<Seo, "title">) {
  return [
    ...(description
      ? [
          { name: "description", content: description },
          { name: "twitter:description", content: description },
          { name: "og:description", content: description },
        ]
      : []),
    ...(keywords
      ? [
          { name: "keywords", content: keywords },
        ]
      : []),
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: image },
        ]
      : fallbackImageProps),
    ...(ogType
      ? [
          { name: "og:type", content: "website" },
        ]
      : []),
    // { name: "twitter:creator", content: "@tannerlinsley" },
    // { name: "twitter:site", content: "@tannerlinsley" },
  ]
}

function ogTitle(title: string) {
  return [
    { name: "twitter:title", content: title },
    { name: "og:title", content: title },
  ]
}

export function pageMeta({
  title,
  ...args
}: Seo) {
  return [
    { title: `${title}${TitleSuffix}` },
    ...ogTitle(title),
    ...internalMeta(args),
  ]
}
export function siteMeta({
  title,
  ...args
}: Seo) {
  return [
    { title },
    ...ogTitle(title),
    ...internalMeta(args),
  ]
}
