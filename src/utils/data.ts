import type { Pagination } from "./pagination"
import { Option, pipe, Schema } from "effect"
import { dataFiles } from "virtual:collections-data"

function normalizeDataPath(filePath: string): string {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "")
}

/**
 * Read a generated data file embedded in the application bundle.
 *
 * The collections Vite plugin turns build-time output into a virtual module so
 * production runtimes do not need filesystem access.
 */
export function readDataFile(filePath: string): Option.Option<string> {
  return Option.fromNullable(dataFiles[normalizeDataPath(filePath)])
}

/**
 * Read a JSON file in the generated data.
 *
 * If the file doesn't exist, the function returns None.
 */
export async function readJsonDataFile<T>(filePath: string): Promise<Option.Option<T>> {
  return readJsonDataFileSync(filePath)
}

export function readJsonDataFileSync<T>(filePath: string): Option.Option<T> {
  return pipe(
    readDataFile(filePath),
    Option.map(content => JSON.parse(content) as T),
  )
}

export async function readJsonDataFileWithSchema<A, I>(
  schema: Schema.Schema<A, I>,
  filePath: string,
): Promise<Option.Option<A>> {
  return readJsonDataFile(filePath)
    .then(Option.map(Schema.decodeUnknownSync(schema)))
}

function readJsonLines(filePath: string): unknown[] {
  return pipe(
    readDataFile(filePath),
    Option.map(content => content
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line))),
    Option.getOrElse(() => []),
  )
}

export async function readJsonLinesDataFileFiltered<A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  { offset, limit }: Pagination,
  predicate?: (x: A) => boolean,
): Promise<I[]> {
  const result: I[] = []
  let matched = 0

  for (const encoded of readJsonLines(filePath)) {
    const data = Schema.decodeUnknownSync(schema)(encoded)

    if (predicate && !predicate(data)) {
      continue
    }

    if (matched >= offset && result.length < limit) {
      result.push(encoded as I)
    }

    matched += 1

    if (result.length === limit) {
      break
    }
  }

  return result
}

export async function readJsonLinesDataFileWithSchema<A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  { offset, limit }: Pagination,
  predicate: (x: A) => boolean,
): Promise<A[]> {
  const result: A[] = []
  let matched = 0

  for (const encoded of readJsonLines(filePath)) {
    const data = Schema.decodeUnknownSync(schema)(encoded)

    if (!predicate(data)) {
      continue
    }

    if (matched >= offset && result.length < limit) {
      result.push(data)
    }

    matched += 1

    if (result.length === limit) {
      break
    }
  }

  return result
}
