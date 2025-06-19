import type { NonEmptyReadonlyArray } from "effect/Array"
import xml from "xml"

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

type Value = string | { _attr: Record<string, string>, _cdata?: string } | { _text: string } | Value[]

export function generateAtomFeed<T>({
  title,
  subtitle,
  self,
  baseUrl,
  toEntry,
  toUpdated,
}: AtomOptions<T>, posts: NonEmptyReadonlyArray<T>) {
  const feedUpdated = toUpdated(posts[0]).toISOString()

  const root = xml.element({
    _attr: {
      xmlns: "http://www.w3.org/2005/Atom",
    },
  })

  const stream = xml({ feed: root }, { stream: true, declaration: true })

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

      // Add feed metadata
      root.push({ title })
      root.push({ link: { _attr: { href: baseUrl } } })
      root.push({ link: { _attr: { href: self, rel: "self" } } })
      root.push({ id: baseUrl })
      root.push({ updated: feedUpdated })
      root.push({ subtitle })

      posts.forEach((post) => {
        const {
          title,
          href,
          id,
          published,
          updated,
          summary,
          _cdata,
        } = toEntry(post)
        const entry: Record<string, Value>[] = [
          { title },
          { link: { _attr: { href } } },
          { id },
        ]
        if (published) {
          entry.push({ published: published.toISOString() })
        }
        if (updated) {
          entry.push({ updated: updated.toISOString() })
        }
        if (summary) {
          entry.push({ summary })
        }
        if (_cdata) {
          entry.push({ content: { _attr: { type: "html" }, _cdata } })
        }

        root.push({ entry })
      })

      root.close()
    },
  })
}
