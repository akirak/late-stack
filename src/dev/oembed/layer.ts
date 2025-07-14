import type { SqlError } from "@effect/sql/SqlError"
import type { OembedSchemaError } from "./cache"
import { HttpClient } from "@effect/platform"
import { Context, Effect, Either, Layer, Option, Schema } from "effect"
import { Oembed } from "../../schemas/link-metadata"
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

    const ttlMs = 60 * 24 * 60 * 60 * 1000 // 60 days

    const get = (url: string) => Effect.gen(function* () {
      // Check cache
      const cached = yield* cache.get(url)

      if (Option.isSome(cached)) {
        const oembed = cached.value
        const age = Date.now() - oembed.createdAt.getTime()

        // Return if still fresh
        if (age < ttlMs) {
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
