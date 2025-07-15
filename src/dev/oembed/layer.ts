import type { SqlError } from "@effect/sql/SqlError"
import type { OembedSchemaError } from "./cache"
import * as fs from "node:fs"
import * as path from "node:path"
import { HttpClient } from "@effect/platform"
import { Context, Effect, Either, Layer, Option, Schema } from "effect"
import { Oembed } from "../../schemas/link-metadata"
import { Config } from "../pipeline-config"
import { OembedCache, OembedCacheLive } from "./cache"

export class OembedFetchError extends Schema.TaggedError<OembedFetchError>()("app/OembedFetchError", {
  url: Schema.String,
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

export class OembedService extends Context.Tag("app/OembedService")<
  OembedService,
  {
    readonly get: (url: string) => Effect.Effect<Option.Option<Oembed>, SqlError | OembedSchemaError | OembedFetchError>
  }
>() {}

function saveHtmlFile(html: string, baseDir: string): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const oembedDir = path.join(baseDir, "oembed")

    // Ensure the oembed directory exists
    yield* Effect.tryPromise({
      try: () => fs.promises.mkdir(oembedDir, { recursive: true }),
      catch: error => new Error(`Failed to create oembed directory: ${error}`),
    })

    // Calculate embed ID
    const embedId = new Oembed({ html, url: "", type: "", provider_name: "", provider_url: "", version: "" }).calculateEmbedId()

    if (embedId) {
      // Save the HTML file
      const filePath = path.join(oembedDir, `${embedId}.html`)
      yield* Effect.tryPromise({
        try: () => fs.promises.writeFile(filePath, html, "utf8"),
        catch: error => new Error(`Failed to save HTML file: ${error}`),
      })
    }
  })
}

function fetchOembed(httpClient: HttpClient.HttpClient, url: string) {
  return Effect.gen(function* () {
    yield* Effect.log("Fetching oembed data", url)

    const parsedUrl: URL = yield* Effect.try({
      try: () => new URL(url),
      catch: _E => new OembedFetchError({
        url,
        message: "Invalid URL format",
        cause: _E,
      }),
    })

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return yield* new OembedFetchError({
        url,
        message: "Only HTTP(S) URLs are supported",
      })
    }

    // Fetch with timeout
    const response = yield* httpClient.get(url, {
      headers: {
        Accept: "application/json",
      },
    }).pipe(
      Effect.mapError(error => new OembedFetchError({
        url,
        message: `Failed to fetch oembed data from ${url}`,
        cause: error,
      })),
    )

    const contentType = response.headers["content-type"]
    if (!/^application\/json(?:;|$)/.test(contentType)) {
      return yield* Effect.fail(new OembedFetchError({
        url,
        message: `Expected JSON response, got ${contentType}`,
      }))
    }

    const json = yield* response.json.pipe(
      Effect.mapError(error => new OembedFetchError({
        url,
        message: "Failed to parse JSON response",
        cause: error,
      })),
    )
    return yield* Schema.decodeUnknown(Oembed)({
      _tag: "app/Oembed",
      ...(json as Record<string, unknown>),
    })
  })
}

export const OembedServiceLive = Layer.effect(
  OembedService,
  Effect.gen(function* () {
    const cache = yield* OembedCache
    const httpClient = yield* HttpClient.HttpClient
    const config = yield* Config

    const ttlMs = 60 * 24 * 60 * 60 * 1000 // 60 days

    const get = (url: string) => Effect.gen(function* () {
      // Check cache
      const cached = yield* cache.get(url)

      if (Option.isSome(cached)) {
        const oembed = cached.value
        const age = Date.now() - oembed.createdAt.getTime()

        // Return if still fresh
        if (age < ttlMs) {
          // Save HTML file as side effect for cached data too
          if (oembed.data.html) {
            yield* saveHtmlFile(oembed.data.html, config.outDir).pipe(
              Effect.catchAll(error => Effect.logError("Failed to save HTML file for cached data", error)),
            )
          }
          return Option.some(oembed.data)
        }
      }

      // Fetch fresh data
      const freshResult = yield* fetchOembed(httpClient, url).pipe(
        Effect.either,
      )

      if (Either.isRight(freshResult)) {
        // Save to cache
        yield* cache.set(url, freshResult.right)
        yield* Effect.log("Saved fresh oembed data to cache", url)

        // Save HTML file as side effect
        if (freshResult.right.html) {
          yield* saveHtmlFile(freshResult.right.html, config.outDir).pipe(
            Effect.catchAll(error => Effect.logError("Failed to save HTML file", error)),
          )
        }

        return Option.some(freshResult.right)
      }

      // If fetch failed but we have stale data, return it
      if (Option.isSome(cached)) {
        return Option.some(cached.value.data)
      }

      yield* Effect.logError("Missing oembed data", freshResult.left)

      return Option.none()
    })

    return {
      get,
    } as const
  }),
).pipe(
  Layer.provide(OembedCacheLive),
)
