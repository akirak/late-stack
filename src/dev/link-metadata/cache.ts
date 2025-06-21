import type { LinkMetadata } from "../../schemas/link-metadata"
import type { Envelope, Kvs, KvsError } from "../service-utils/kvs"
import { Context, Data, Effect, Layer, Option, Schema } from "effect"
import { LinkMetadataSchema } from "../../schemas/link-metadata"
import { initSqliteKvs } from "../service-utils/sqlite-kvs"

export class MetadataKvs extends Context.Tag("MetadataKvs")<
  MetadataKvs,
  Kvs
>() { }

export const MetadataKvsLive = Layer.effect(
  MetadataKvs,
  initSqliteKvs("metadata"),
)

export class MetadataSchemaError extends Data.TaggedError("MetadataSchemaError")<{
  url: string
  message: string
}> { }

export class MetadataCache extends Context.Tag("MetadataCache")<
  MetadataCache,
  {
    readonly get: (url: string) => Effect.Effect<Option.Option<Envelope<LinkMetadata>>, KvsError | MetadataSchemaError>
    readonly set: (url: string, metadata: LinkMetadata) => Effect.Effect<void, KvsError | MetadataSchemaError>
  }
>() { }

export const MetadataCacheLive = Layer.effect(
  MetadataCache,
  Effect.gen(function* () {
    const kvs = yield* MetadataKvs

    const get = (url: string) => Effect.gen(function* () {
      const result = Option.getOrNull(yield* kvs.get(url))
      if (!result)
        return Option.none()

      const data = yield* Schema.decodeUnknown(LinkMetadataSchema)(result.data).pipe(
        Effect.catchTag(
          "ParseError",
          error => Effect.fail(new MetadataSchemaError({
            url,
            message: `Failed to decode OGP metadata: ${error.message}`,
          })),
        ),
      )

      return Option.some({
        data,
        createdAt: result.createdAt,
      })
    })

    const set = (url: string, metadata: LinkMetadata) =>
      Schema.encodeUnknown(LinkMetadataSchema)(metadata).pipe(
        Effect.andThen(encoded => kvs.set(url, encoded)),
        Effect.catchTag(
          "ParseError",
          error => Effect.fail(new MetadataSchemaError({
            url,
            message: `Failed to encode OGP metadata: ${error.message}`,
          })),
        ),
      )

    return {
      get,
      set,
    }
  }),
).pipe(
  Layer.provide(MetadataKvsLive),
)
