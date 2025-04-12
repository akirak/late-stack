import { Command, FileSystem, Path } from "@effect/platform"
import { CommandExecutor } from "@effect/platform/CommandExecutor" // Still needed for injection
import { Context, Effect, Layer, Stream } from "effect"
import { Config } from "./config"

export class DuckDBWriter extends Context.Tag("DuckDBWriter")<DuckDBWriter, {
  createNewTableFromStream: (args: { tableName: string }) => (stream: Stream.Stream<any>) =>
  Effect.Effect<void, Error, never>
  insertObjectIntoTable: ({ tableName }: { tableName: string }) =>
  (record: any) => Effect.Effect<void, Error, never>
  deleteFromTableByFileName: ({ tableName, fileName }: {
    tableName: string
    fileName: string
  }) => Effect.Effect<void, Error, never>
}>() { }

export const DuckDBWriterLive: Layer.Layer<
  DuckDBWriter,
  Error,
  Config | FileSystem.FileSystem | CommandExecutor | Path.Path
> = Layer.effect(
  DuckDBWriter,
  Effect.gen(function* (_) {
    const config = yield* Config
    // Inject CommandExecutor from the context
    const commandExecutor = yield* CommandExecutor
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const databaseFile = path.join(config.outDir, "contents.duckdb")

    const spawnDuckDB = (args: string[] = []) =>
      Command.make("duckdb", "-batch", "-bail", databaseFile, ...args)

    const writeStreamToScopedTempJsonl
      = <T>(stream: Stream.Stream<T>) =>
        Effect.gen(function* () {
          const tempFilePath = yield* fs.makeTempFileScoped({
            prefix: "table-json",
          })

          const tempFileSink = fs.sink(tempFilePath, {
            flag: "w",
          })

          const encoder = new TextEncoder()
          yield* stream.pipe(
            Stream.map(record => encoder.encode(`${JSON.stringify(record)}\n`)),
            Stream.run(tempFileSink),
          )

          return tempFilePath
        }).pipe(
          Effect.tapErrorCause(Effect.logError),
          Effect.catchIf(
            error => error._tag === "BadArgument" || error._tag === "SystemError",
            () => Effect.fail(new Error("Error while writing a stream to a temporary file: PlatformError")),
          ),
        )

    const createNewTableFromStream
      = ({ tableName }: { tableName: string }) =>
        <T>(stream: Stream.Stream<T>) =>
          Effect.gen(function* () {
            const tempFilePath = yield* writeStreamToScopedTempJsonl(stream)
            const exit = yield* spawnDuckDB([
              "-c",
              `CREATE OR REPLACE TABLE "${tableName}" AS
             SELECT
               *
             FROM
               read_json_auto('${tempFilePath}');`,
            ]).pipe(
              Command.exitCode,
              Effect.tapErrorCause(Effect.logError),
              Effect.catchIf(
                error => error._tag === "BadArgument" || error._tag === "SystemError",
                () => Effect.fail(new Error(`Error while creating a table ${tableName}: PlatformError`)),
              ),
            )

            if (exit !== 0) {
              yield* Effect.fail(new Error(
                `DuckDB returned a non-zero exit code while updating the database.`,
              ))
            }
          }).pipe(
            Effect.scoped,
            Effect.provideService(CommandExecutor, commandExecutor),
          )

    const insertObjectIntoTable
      = ({ tableName }: { tableName: string }) => (record: any) =>
        Effect.gen(function* () {
          const exit = yield* spawnDuckDB([
            "-cmd",
            `COPY '/dev/stdin' TO "${tableName}" (format JSON)`,
          ]).pipe(
            Command.feed(JSON.stringify(record)),
            Command.exitCode,
            Effect.tapErrorCause(Effect.logError),
            Effect.catchIf(
              error => error._tag === "BadArgument" || error._tag === "SystemError",
              () => Effect.fail(new Error(`Error while inserting a record into a table ${tableName}: PlatformError`)),
            ),
          )
          if (exit !== 0) {
            yield* Effect.fail(new Error(
              `DuckDB returned a non-zero exit code while updating the database.`,
            ))
          }
        }).pipe(
          Effect.provideService(CommandExecutor, commandExecutor),
        )

    const deleteFromTableByFileName
      = ({ tableName, fileName }: { tableName: string, fileName: string }) =>
        Effect.gen(function* () {
          const exit = yield* spawnDuckDB([
            "-cmd",
            `delete from "${tableName}" where fileName = '${fileName}'`,
          ]).pipe(
            Command.exitCode,
            Effect.tapErrorCause(Effect.logError),
            Effect.catchIf(
              error => error._tag === "BadArgument" || error._tag === "SystemError",
              () => Effect.fail(new Error(`Error while deleting from a table ${tableName}: PlatformError`)),
            ),
          )
          if (exit !== 0) {
            yield* Effect.fail(new Error(
              `DuckDB returned a non-zero exit code while updating the database.`,
            ))
          }
        }).pipe(
          Effect.provideService(CommandExecutor, commandExecutor),
        )

    return {
      createNewTableFromStream,
      insertObjectIntoTable,
      deleteFromTableByFileName,
    } as const
  }),
)
