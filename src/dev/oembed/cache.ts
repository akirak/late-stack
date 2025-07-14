import type { SqlError } from "@effect/sql/SqlError"
import type { Oembed } from "../../schemas/link-metadata"
import { SqlClient } from "@effect/sql"
import { Context, Effect, Layer, Option, Schema } from "effect"
import { OembedSchema } from "../../schemas/link-metadata"

export class OembedSchemaError extends Schema.TaggedError<OembedSchemaError>()("app/OembedSchemaError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

export class OembedCache extends Context.Tag("app/OembedCache")<
  OembedCache,
  {
    readonly get: (url: string) => Effect.Effect<Option.Option<{ data: Oembed, createdAt: Date }>, SqlError | OembedSchemaError>
    readonly set: (url: string, data: Oembed) => Effect.Effect<void, SqlError>
  }
>() {}

export const OembedCacheLive = Layer.effect(
  OembedCache,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    // Create the oembed table if it doesn't exist
    yield* sql`
      CREATE TABLE IF NOT EXISTS oembed (
        oembed_url TEXT PRIMARY KEY,
        url TEXT,
        author_name TEXT,
        author_url TEXT,
        html TEXT,
        width INTEGER,
        height INTEGER,
        type TEXT NOT NULL,
        cache_age TEXT,
        provider_name TEXT NOT NULL,
        provider_url TEXT NOT NULL,
        version TEXT NOT NULL,
        title TEXT,
        thumbnail_url TEXT,
        thumbnail_width INTEGER,
        thumbnail_height INTEGER,
        created_at TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_oembed_created_at ON oembed(created_at)
    `

    return {
      get: (oembedUrl: string) =>
        sql<Oembed & {
          oembed_url: string
          created_at: string
        }>`SELECT * FROM oembed WHERE oembed_url = ${oembedUrl}`.pipe(
          Effect.andThen(rows => Effect.gen(function* () {
            if (rows.length === 0) {
              return Option.none()
            }

            const { created_at, oembed_url, ...row } = rows[0]

            const data = yield* Schema.decodeUnknown(OembedSchema)({
              ...row,
              _tag: "app/Oembed",
            }).pipe(
              Effect.catchTag(
                "ParseError",
                error => Effect.fail(new OembedSchemaError({
                  message: `Failed to decode Oembed data for URL ${oembedUrl}:\n${error instanceof Error ? error.message : String(error)}`,
                  cause: error,
                }),
                ),
              ),
            )

            return Option.some({ data, createdAt: new Date(created_at) })
          })),
        ),

      set: (url: string, data: Oembed) => sql`
        INSERT OR REPLACE INTO oembed (
          oembed_url,
          url,
          author_name,
          author_url,
          html,
          width,
          height,
          type,
          cache_age,
          provider_name,
          provider_url,
          version,
          title,
          thumbnail_url,
          thumbnail_width,
          thumbnail_height,
          created_at
        ) VALUES (
          ${url},
          ${data.url},
          ${data.author_name ?? null},
          ${data.author_url ?? null},
          ${data.html ?? null},
          ${data.width ?? null},
          ${data.height ?? null},
          ${data.type},
          ${data.cache_age ?? null},
          ${data.provider_name},
          ${data.provider_url},
          ${data.version},
          ${data.title ?? null},
          ${data.thumbnail_url ?? null},
          ${data.thumbnail_width ?? null},
          ${data.thumbnail_height ?? null},
          ${new Date().toISOString()}
        )`.pipe(Effect.asVoid),
    } as const
  }),
)
