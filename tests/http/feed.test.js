import { spawn } from "node:child_process"
import process from "node:process"
import { Effect } from "effect"
import { XMLParser, XMLValidator } from "fast-xml-parser"

const APP_PORT = Number(process.env.HTTP_TEST_PORT || "3100")
const BASE_URL = `http://127.0.0.1:${APP_PORT}`
const FEED_URL = `${BASE_URL}/feeds/default.xml`
const SERVER_TIMEOUT_MS = 120_000
const SERVER_POLL_INTERVAL = "1 second"

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

function assert(condition, message) {
  return condition ? Effect.void : Effect.fail(new Error(message))
}

function assertHasProperty(value, property) {
  return Effect.gen(function* () {
    yield* assert(typeof value === "object" && value !== null, `Expected object with property ${property}`)
    yield* assert(property in value, `Expected property ${property}`)
  })
}

function waitForServer(url, startedAt = Date.now()) {
  return Effect.tryPromise(() => fetch(url)).pipe(
    Effect.filterOrFail(response => response.ok, response => new Error(`Server returned status ${response.status} while waiting for ${url}`)),
    Effect.asVoid,
    Effect.catchAll(() => {
      if (Date.now() - startedAt >= SERVER_TIMEOUT_MS)
        return Effect.fail(new Error(`Timed out waiting for server at ${url}`))

      return Effect.sleep(SERVER_POLL_INTERVAL).pipe(
        Effect.zipRight(waitForServer(url, startedAt)),
      )
    }),
  )
}

const server = Effect.acquireRelease(
  Effect.gen(function* () {
    const serverProcess = yield* Effect.try(() =>
      spawn("./node_modules/.bin/vite", ["dev", "--host", "127.0.0.1", "--port", String(APP_PORT)], {
        cwd: process.cwd(),
        detached: true,
        stdio: "ignore",
      }),
    )

    serverProcess.unref()

    yield* waitForServer(BASE_URL)

    return serverProcess
  }),
  serverProcess =>
    Effect.sync(() => {
      if (!serverProcess.pid)
        return

      try {
        process.kill(-serverProcess.pid, "SIGTERM")
      }
      catch {
        // Best-effort cleanup. The process may have already exited.
      }
    }),
)

const tests = [
  {
    name: "returns valid Atom 1.0 XML",
    run: Effect.gen(function* () {
      const response = yield* Effect.tryPromise(() => fetch(FEED_URL))

      yield* assert(response.status === 200, `Expected status 200, got ${response.status}`)
      yield* assert(
        response.headers.get("content-type")?.includes("application/atom+xml; charset=utf-8"),
        "Expected Atom content type",
      )

      const xmlContent = yield* Effect.tryPromise(() => response.text())

      yield* assert(XMLValidator.validate(xmlContent) === true, "Expected valid XML")

      const parsedXml = xmlParser.parse(xmlContent)
      yield* assertHasProperty(parsedXml, "feed")
      yield* assertHasProperty(parsedXml.feed, "@_xmlns")
      yield* assert(parsedXml.feed["@_xmlns"] === "http://www.w3.org/2005/Atom", "Expected Atom namespace")
      yield* assertHasProperty(parsedXml.feed, "title")
      yield* assertHasProperty(parsedXml.feed, "id")
      yield* assertHasProperty(parsedXml.feed, "updated")
    }),
  },
  {
    name: "contains entry elements with required fields",
    run: Effect.gen(function* () {
      const response = yield* Effect.tryPromise(() => fetch(FEED_URL))
      const xmlContent = yield* Effect.tryPromise(() => response.text())
      const parsedXml = xmlParser.parse(xmlContent)

      yield* assertHasProperty(parsedXml, "feed")

      if (!parsedXml.feed.entry)
        return

      const entries = Array.isArray(parsedXml.feed.entry) ? parsedXml.feed.entry : [parsedXml.feed.entry]

      yield* Effect.forEach(
        entries,
        entry =>
          Effect.gen(function* () {
            yield* assertHasProperty(entry, "title")
            yield* assertHasProperty(entry, "id")
            yield* assertHasProperty(entry, "content")
          }),
      )
    }),
  },
  {
    name: "returns caching headers",
    run: Effect.gen(function* () {
      const response = yield* Effect.tryPromise(() => fetch(FEED_URL))

      yield* assert(response.headers.get("cache-control")?.includes("public"), "Expected public cache-control header")
    }),
  },
]

const runTest = test =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(test.run)

    if (exit._tag === "Success") {
      process.stdout.write(`PASS ${test.name}\n`)
      return false
    }

    console.error(`FAIL ${test.name}`)
    console.error(exit.cause)
    return true
  })

const program = Effect.scoped(
  server.pipe(
    Effect.andThen(() => Effect.forEach(tests, runTest)),
    Effect.map(results => results.some(Boolean) ? 1 : 0),
  ),
)

const exitCode = await Effect.runPromise(
  program.pipe(
    Effect.catchAllCause((cause) => {
      console.error(cause)
      return Effect.succeed(1)
    }),
  ),
)

process.exit(exitCode)
