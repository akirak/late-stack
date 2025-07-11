import type { LinkMetadataSchema } from "../../schemas/link-metadata"
import { HttpClient } from "@effect/platform"
import { Context, Data, Effect, Layer, Schema } from "effect"
import { HTMLRewriter } from "html-rewriter-wasm"
import { OgpMetadataFromHtml } from "../../schemas/link-metadata"

export class FetchError extends Data.TaggedError("FetchError")<{
  readonly url: string
  readonly reason: "network" | "timeout" | "invalid-url" | "too-large"
  readonly message: string
}> { }

export class ParseError extends Data.TaggedError("ParseError")<{
  readonly url: string
  readonly message: string
}> { }

export class MetadataFetcher extends Context.Tag("MetadataFetcher")<
  MetadataFetcher,
  {
    readonly fetch: (url: string) => Effect.Effect<typeof LinkMetadataSchema.Type, FetchError | ParseError>
  }
>() { }

const MAX_REDIRECTS = 5
const MAX_RETRY = 5
const TIMEOUT_MS = 10000
const MAX_BODY_SIZE = 1024 * 1024 // 1 MiB

export const MetadataFetcherLive = Layer.effect(
  MetadataFetcher,
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient.pipe(
      Effect.andThen(HttpClient.followRedirects(MAX_REDIRECTS)),
      Effect.andThen(HttpClient.retry({
        times: MAX_RETRY,
      })),
    )

    const parseHtml = async (html: string, baseUrl: string): Promise<typeof LinkMetadataSchema.Type> => {
      const rawMetadata: Record<string, string> = {}

      let fallbackTitle: string | undefined

      const resolveUrl = (url: string): string => {
        try {
          return new URL(url, baseUrl).href
        }
        catch {
          return url
        }
      }

      const rewriter = new HTMLRewriter((_output) => { })

      rewriter.on("meta", {
        element(element: any) {
          const property = element.getAttribute("property")
          const name = element.getAttribute("name")
          const content = element.getAttribute("content")

          if (!content)
            return

          // Open Graph tags
          if (property?.startsWith("og:")) {
            if (property === "og:url" || property === "og:image") {
              rawMetadata[property] = resolveUrl(content)
            }
            else {
              rawMetadata[property] = content
            }
          }
          // Twitter tags as fallback
          else if (name?.startsWith("twitter:")) {
            if (name === "twitter:url" || name === "twitter:image") {
              rawMetadata[name] = resolveUrl(content)
            }
            else {
              rawMetadata[name] = content
            }
          }
        },
      })

      rewriter.on("link", {
        element(element: any) {
          if (element.getAttribute("rel") === "canonical") {
            const href = element.getAttribute("href")
            rawMetadata.canonical = href
          }
        },
      })

      rewriter.on("title", {
        text(text: any) {
          if (!fallbackTitle) {
            fallbackTitle = text.text.trim()
          }
        },
      })

      const encoder = new TextEncoder()
      try {
        await rewriter.write(encoder.encode(html))
        await rewriter.end()
      }
      finally {
        rewriter.free()
      }

      const metadata = Schema.decodeSync(OgpMetadataFromHtml)(rawMetadata)

      const title = metadata.title || fallbackTitle

      return {
        ...metadata,
        title,
      }
    }

    return {
      fetch: (url: string) =>
        Effect.gen(function* () {
          // Validate URL
          let parsedUrl: URL
          try {
            parsedUrl = new URL(url)
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
              return yield* new FetchError({
                url,
                reason: "invalid-url",
                message: "Only HTTP(S) URLs are supported",
              })
            }
          }
          catch {
            return yield* new FetchError({
              url,
              reason: "invalid-url",
              message: "Invalid URL format",
            })
          }

          // Fetch with timeout and size limit
          const response = yield* httpClient.get(url, {
            headers: {
              // Some web sites such as theguardian.com require Accept header.
              Accept: "*/*",
              // TODO: Support compression in this client
              // "Accept-Encoding": "gzip, deflate, br, zstd",
            },
          }).pipe(
            Effect.timeout(TIMEOUT_MS),
            Effect.mapError((error) => {
              if (error._tag === "TimeoutException") {
                return new FetchError({
                  url,
                  reason: "timeout",
                  message: `Request timed out after ${TIMEOUT_MS}ms`,
                })
              }
              return new FetchError({
                url,
                reason: "network",
                message: `Network error: ${error}`,
              })
            }),
          )

          // Check content length
          const contentLength = response.headers["content-length"]?.toString()
          if (contentLength && Number.parseInt(contentLength) > MAX_BODY_SIZE) {
            return yield* new FetchError({
              url,
              reason: "too-large",
              message: `Response too large: ${contentLength} bytes`,
            })
          }

          // Read body with size limit
          const text = yield* response.text.pipe(
            Effect.mapError(() => new FetchError({
              url,
              reason: "network",
              message: "Failed to read response body",
            })),
          )

          if (text.length > MAX_BODY_SIZE) {
            return yield* new FetchError({
              url,
              reason: "too-large",
              message: `Response exceeded ${MAX_BODY_SIZE} bytes`,
            })
          }

          // Parse HTML
          try {
            const metadata = yield* Effect.promise(() => parseHtml(text, url))
            return metadata
          }
          catch (error) {
            return yield* new ParseError({
              url,
              message: `Failed to parse HTML: ${error}`,
            })
          }
        }),
    }
  }),
)
