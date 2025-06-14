import type { LinkMetadata } from "../../schemas/link-metadata"
import type { KvsError } from "../service-utils/kvs"
import type { MetadataSchemaError } from "./cache"
import { Context, Effect, Either, Layer, Option } from "effect"
import { MetadataCache, MetadataCacheLive } from "./cache"
import { MetadataFetcher, MetadataFetcherLive } from "./fetcher"

export class LinkMetadataService extends Context.Tag("app/LinkMetadataService")<
  LinkMetadataService,
  {
    readonly get: (url: string) =>
    Effect.Effect<Option.Option<LinkMetadata>, KvsError | MetadataSchemaError>
  }
>() { }

export const LinkMetadataServiceLive = Layer.effect(
  LinkMetadataService,
  Effect.gen(function* () {
    const cache = yield* MetadataCache
    const fetcher = yield* MetadataFetcher

    const ttlMs = 60 * 24 * 60 * 60 * 1000 // 60 days

    return {
      get: (url: string) =>
        Effect.gen(function* () {
          // Check cache
          const cached = yield* cache.get(url)

          if (Option.isSome(cached)) {
            const metadata = cached.value
            const age = Date.now() - metadata.createdAt.getTime()

            // Return if still fresh
            if (age < ttlMs) {
              return Option.some(metadata.data)
            }
          }

          // Fetch fresh data
          const freshResult = yield* fetcher.fetch(url).pipe(
            Effect.either,
          )

          if (Either.isRight(freshResult)) {
            // Save to cache
            yield* cache.set(url, freshResult.right)
            return Option.some(freshResult.right)
          }

          // If fetch failed but we have stale data, return it
          if (Option.isSome(cached)) {
            return Option.some(cached.value.data)
          }

          // No data available
          return Option.none()
        }),
    } as const
  }),
).pipe(
  Layer.provide(MetadataCacheLive),
  Layer.provide(MetadataFetcherLive),
)
