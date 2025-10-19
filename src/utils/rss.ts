import type { NonEmptyReadonlyArray } from "effect/Array"
import { createCB } from "xmlbuilder2"

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

export function generateAtomFeed<T>({
  title,
  subtitle,
  self,
  baseUrl,
  toEntry,
  toUpdated,
}: AtomOptions<T>, posts: NonEmptyReadonlyArray<T>) {
  const feedUpdated = toUpdated(posts[0]).toISOString()

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

      const feed = stream.ele("feed", { xmlns: "http://www.w3.org/2005/Atom" })
      feed.ele("title").txt(title).up()
      feed.ele("link", { href: baseUrl }).up()
      feed.ele("link", { href: self, rel: "self" }).up()
      feed.ele("id").txt(baseUrl).up()
      feed.ele("updated").txt(feedUpdated).up()
      feed.ele("subtitle").txt(subtitle).up()

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

        const entry = feed.ele("entry")
        entry.ele("title").txt(title).up()
        entry.ele("link", { href }).up()
        entry.ele("id").txt(id).up()

        if (published) {
          entry.ele("published").txt(published.toISOString()).up()
        }
        if (updated) {
          entry.ele("updated").txt(updated.toISOString()).up()
        }
        if (summary) {
          entry.ele("summary").txt(summary).up()
        }
        if (_cdata) {
          entry.ele("content", { type: "html" }).dat(_cdata).up()
        }

        entry.up()
      })

      feed.end()
    },
  })
}
