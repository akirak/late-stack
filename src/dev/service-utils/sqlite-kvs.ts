import type { SqlError } from "@effect/sql/SqlError"
import type { Kvs } from "./kvs"
import { SqlClient, Statement } from "@effect/sql"
import { Effect, Option } from "effect"
import { KvsError } from "./kvs"

function sqlErrorToKvsError(key: string, error: SqlError): KvsError {
  return new KvsError({
    key,
    message: `SQL error: ${error.message}`,
  })
}

export function initSqliteKvs(tableName: string) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const table = Statement.unsafeFragment(tableName)

    // Initialize table
    yield* sql`
    CREATE TABLE IF NOT EXISTS ${table} (
        key TEXT PRIMARY KEY,
        value JSON NOT NULL,
        created_at TEXT NOT NULL
      )
    `.pipe(
        Effect.catchAll(
          _E => Effect.dieMessage("Failed to create KVS table"),
        ),
      )

    yield* sql`
    CREATE INDEX IF NOT EXISTS idx_created_at ON ${table}(created_at)
    `.pipe(
        Effect.catchAll(
          _E => Effect.dieMessage("Failed to create KVS table"),
        ),
      )

    const get = (key: string) =>
      Effect.gen(function* () {
        const result = yield* sql<{
          value: string
          created_at: string
        }>`
          SELECT value, created_at FROM ${table} WHERE key = ${key}
        `

        if (result.length > 0) {
          const item = result[0]
          const data = yield* Effect.try({
            // The SQLite driver actually returns strings
            try: () => JSON.parse(item.value),
            catch: error => new KvsError({
              key,
              message: `Failed to parse the JSON value: ${error}`,
            }),
          })
          return Option.some({
            data,
            createdAt: new Date(item.created_at),
          })
        }
        else {
          return Option.none()
        }
      }).pipe(
        Effect.catchTags({
          SqlError: error => Effect.fail(sqlErrorToKvsError(key, error),
          ),
        }),
      )

    const set = (key: string, value: unknown) =>
      sql`
          INSERT OR REPLACE INTO ${table} (key, value, created_at)
          VALUES (${key}, ${JSON.stringify(value)}, ${new Date().toISOString()})
        `.pipe(Effect.asVoid).pipe(
              Effect.catchTag(
                "SqlError",
                error => Effect.fail(sqlErrorToKvsError(key, error),
                ),
              ),
            )

    const delete_ = (key: string) =>
      sql`DELETE FROM ${table} WHERE key = ${key}`.pipe(
        Effect.catchTag(
          "SqlError",
          error => Effect.fail(sqlErrorToKvsError(key, error),
          ),
        ),
        Effect.asVoid,
      )

    return {
      get,
      set,
      delete_,
    } satisfies Kvs
  }).pipe(
    Effect.catchAll(
      error => Effect.dieMessage(`Fatal error while initializing KVS: ${error}`),
    ),
  )
}
