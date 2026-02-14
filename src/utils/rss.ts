import type { NonEmptyReadonlyArray } from "effect/Array"

export interface AtomEntry {
  title: string
  href: string
  id: string
  published?: Date
  updated?: Date
  summary?: string
  _cdata?: string
}

export interface AtomOptions<T> {
  title: string
  subtitle: string
  baseUrl: string
  self: string
  toEntry: (item: T) => AtomEntry
  toUpdated: (item: T) => Date
}

function escapeXmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function escapeXmlAttribute(value: string): string {
  return escapeXmlText(value)
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;")
}

function asCData(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>")
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

export function generateAtomFeed<T>({
  title,
  subtitle,
  self,
  baseUrl,
  toEntry,
  toUpdated,
}: AtomOptions<T>, posts: NonEmptyReadonlyArray<T>) {
  const feedUpdated = toUpdated(posts[0]).toISOString()

  const entries = posts.map((post) => {
    const {
      title,
      href,
      id,
      published,
      updated,
      summary,
      _cdata,
    } = toEntry(post)

    return [
      "<entry>",
      `<title>${escapeXmlText(title)}</title>`,
      `<link href=\"${escapeXmlAttribute(href)}\" />`,
      `<id>${escapeXmlText(id)}</id>`,
      published ? `<published>${published.toISOString()}</published>` : "",
      updated ? `<updated>${updated.toISOString()}</updated>` : "",
      summary ? `<summary>${escapeXmlText(summary)}</summary>` : "",
      _cdata
        ? `<content type=\"html\"><![CDATA[${asCData(_cdata)}]]></content>`
        : "",
      "</entry>",
    ].join("")
  }).join("")

  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<feed xmlns=\"http://www.w3.org/2005/Atom\">",
    `<title>${escapeXmlText(title)}</title>`,
    `<link href=\"${escapeXmlAttribute(baseUrl)}\" />`,
    `<link href=\"${escapeXmlAttribute(self)}\" rel=\"self\" />`,
    `<id>${escapeXmlText(baseUrl)}</id>`,
    `<updated>${feedUpdated}</updated>`,
    `<subtitle>${escapeXmlText(subtitle)}</subtitle>`,
    entries,
    "</feed>",
  ].join("")

  return streamFromString(xml)
}
