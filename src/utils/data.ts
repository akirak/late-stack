import type { Pagination } from "./pagination"
import events from "node:events"
import * as fs from "node:fs"
import * as fsPromise from "node:fs/promises"
import * as path from "node:path"
import readline from "node:readline"
import * as url from "node:url"
import { Option, pipe, Schema } from "effect"
import { isRunningInBrowser, isRunningInDeno } from "./env"

/**
 * Returns a path to the data directory for SSR. Data files are only available
 * on the server, so this value is set to null on browser.
 */
export function getDataDir() {
  if (isRunningInBrowser()) {
    throw new Error(`Server data is not available inside browser`)
  }
  else if (isRunningInDeno()) {
    // In the production enviroment of Deno Deploy, The data directory should be
    // copied to .output directory. The working directory will be directly under
    // .output.
    return "data"
  }
  else {
    const __filename = url.fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    // Top-level directory in the repository
    return path.join(__dirname, "../../data")
  }
}

/**
 * Read a JSON file in the data directory.
 *
 * If the file doesn't exist, the function returns None.
 */
export async function readJsonDataFile<T>(filePath: string): Promise<Option.Option<T>> {
  const fullPath = path.join(getDataDir(), filePath)
  if (fs.existsSync(fullPath)) {
    return pipe(
      (await fsPromise.readFile(fullPath, "utf-8")),
      JSON.parse,
      Option.some,
    )
  }
  else {
    return Option.none()
  }
}

export async function readJsonDataFileWithSchema<A, I>(
  schema: Schema.Schema<A, I>,
  filePath: string,
): Promise<Option.Option<A>> {
  return readJsonDataFile(filePath)
    .then(Option.map(Schema.decodeUnknownSync(schema)))
}

export async function readJsonLinesDataFileFiltered<A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  { offset, limit }: Pagination,
  predicate?: (x: A) => boolean,
): Promise<I[]> {
  const fullPath = path.join(getDataDir(), filePath)
  const stream = fs.createReadStream(fullPath, "utf-8")
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })
  const result: I[] = []
  let count = -offset
  rl.on("line", (line) => {
    if (typeof line === "string") {
      if (line.length > 0) {
        const encoded = JSON.parse(line)
        const data = Schema.decodeUnknownSync(schema)(encoded)
        // There is an opportunity for optimization here if the predicate is
        // null.
        if (!predicate || predicate(data)) {
          if (count >= 0) {
            result.push(encoded)
          }
          count += 1
        }
      }
    }
    else {
      throw new TypeError(`undecoded input while reading a file ${filePath}`)
    }
    if (count === limit) {
      rl.close()
    }
  })
  await events.once(rl, "close")
  return result
}

export async function readJsonLinesDataFileWithSchema<A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  { offset, limit }: Pagination,
  predicate: (x: A) => boolean,
): Promise<A[]> {
  const fullPath = path.join(getDataDir(), filePath)
  const stream = fs.createReadStream(fullPath, "utf-8")
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })
  const result: A[] = []
  let count = -offset
  rl.on("line", (line) => {
    if (typeof line === "string") {
      if (line.length > 0) {
        const data = Schema.decodeUnknownSync(schema)(JSON.parse(line))
        if (predicate(data)) {
          if (count >= 0) {
            result.push(data)
          }
          count += 1
        }
      }
    }
    else {
      throw new TypeError(`undecoded input while reading a file ${filePath}`)
    }
    if (count === limit) {
      rl.close()
    }
  })
  await events.once(rl, "close")
  return result
}
