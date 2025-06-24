import type { Scope } from "effect/Scope"
import { Command, CommandExecutor } from "@effect/platform"
import { Context, Data, Effect, Layer, pipe, Stream, String } from "effect"

export interface D2RenderOptions {
  readonly noXMLTag?: boolean
}

export class D2Service extends Context.Tag("app/D2Service")<
  D2Service,
  {
    readonly render: (
      source: string,
      options?: D2RenderOptions,
    ) => Effect.Effect<string, D2Error, Scope>
  }
>() {}

export class D2Error extends Data.TaggedError("app/D2Error")<{
  readonly message: string
}> {}

function runString<E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> {
  return stream.pipe(
    Stream.decodeText(),
    Stream.runFold(String.empty, String.concat),
  )
}

export const D2ServiceLive = Layer.effect(
  D2Service,
  Effect.gen(function* () {
    const command = yield* CommandExecutor.CommandExecutor

    return {
      render: (source: string, options: D2RenderOptions = {}) =>
        Effect.gen(function* () {
          // Create a command to run d2 CLI
          // d2 accepts input from stdin and outputs SVG to stdout
          const args = ["-", "--stdout-format", "svg"]
          if (options.noXMLTag) {
            args.push("--no-xml-tag")
          }
          args.push("-")

          const [exitCode, stdout, stderr] = yield* pipe(
            Command.make("d2", ...args),
            Command.feed(source),
            command.start,
            Effect.flatMap(process =>
              Effect.all(
                [
                  process.exitCode,
                  runString(process.stdout),
                  runString(process.stderr),
                ],
                { concurrency: 3 },
              ),
            ),
          )

          if (exitCode !== 0) {
            yield* new D2Error({
              message: `D2 command failed with exit code ${exitCode}: ${stderr}`,
            })
          }

          return stdout
        }).pipe(
          Effect.catchAll(error =>
            Effect.fail(
              new D2Error({
                message: `Failed to render D2 diagram: ${error instanceof Error ? error.message : `${error}`}`,
              }),
            ),
          ),
        ),
    } as const
  }),
)
