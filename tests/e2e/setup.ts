import type { Process } from "@effect/platform/CommandExecutor"
import type { TestProject } from "vitest/node"
import { Command, CommandExecutor, FetchHttpClient, HttpClient } from "@effect/platform"
import { NodeCommandExecutor, NodeFileSystem } from "@effect/platform-node"
import { Console, Effect, Layer, ManagedRuntime, Scope } from "effect"
import { APP_PORT, BASE_URL, production } from "./stagehand.config"

class AppManager extends Effect.Service<AppManager>()("AppManager", {
  effect: Effect.gen(function* () {
    let appProcess: Process | null

    const executor = yield* CommandExecutor.CommandExecutor

    const scope = yield* Scope.Scope

    const start = Effect.gen(function* () {
      const command = production
        ? Command.make(
            "deno",
            "run",
            "start",
          )
        : Command.make(
            "pnpm",
            "run",
            "dev",
          )

      appProcess = yield* command.pipe(
        Command.stdin("inherit"),
        Command.stdout("inherit"),
        Command.stderr("inherit"),
        Command.env({
          PORT: String(APP_PORT),
        }),
        Command.start,
      )
    }).pipe(
      Effect.provideService(CommandExecutor.CommandExecutor, executor),
      Effect.provideService(Scope.Scope, scope),
    )

    const kill = Effect.gen(function* () {
      yield* appProcess!.kill("SIGTERM")
      const exit = yield* appProcess!.exitCode
      yield* Console.log(`App exited with code ${exit}`)
    })

    const client = yield* HttpClient.HttpClient

    const wait = Effect.iterate(false, {
      while: up => !up,
      body: _ => Effect.gen(function* () {
        yield* client.get(BASE_URL)
        return true
      }).pipe(
        Effect.catchTag(
          "RequestError",
          e => (e.reason === "Transport") ? Effect.succeed(false) : Effect.fail(e),
        ),
      ),
    }).pipe(
      Effect.timeout("30 seconds"),
    )

    return {
      start,
      wait,
      kill,
    } as const
  }),
  dependencies: [
    NodeCommandExecutor.layer,
    FetchHttpClient.layer,
    Layer.scope,
  ],
}) { }

export default async function setup(_project: TestProject) {
  // eslint-disable-next-line no-console
  console.log("[Global Setup] Starting application server...")
  const runtime = AppManager.Default.pipe(
    Layer.provide(NodeFileSystem.layer),
    ManagedRuntime.make,
  )

  await runtime.runPromise(AppManager.pipe(Effect.andThen(app => app.start)))

  /* eslint-disable no-console */
  console.log(`[Global Setup] Waiting for application to be available at ${BASE_URL}/`)
  await runtime.runPromise(AppManager.pipe(Effect.andThen(app => app.wait)))
  console.log("[Global Setup] Application server is ready.")
  /* eslint-enable no-console */

  // Return a teardown function
  return async () => {
    /* eslint-disable no-console */
    console.log("\n[Global Teardown] Stopping application server...")
    await runtime.runPromise(AppManager.pipe(Effect.andThen(app => app.kill)))
    console.log(`[Global Teardown] App process exited`)
    console.log("[Global Teardown] Cleanup complete.")
    /* eslint-enable no-console */
  }
}
