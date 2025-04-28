import * as fs from "node:fs"
import * as fsPromise from "node:fs/promises"
import * as path from "node:path"
import * as url from "node:url"
import { isRunningInBrowser, isRunningInDeno } from "./env"
import { Option } from "effect"

/**
 * Returns a path to the data directory for SSR. Data files are only available
 * on the server, so this value is set to null on browser.
 */
function getDataDir() {
  if (isRunningInBrowser()) {
    throw new Error(`Server data is not available inside browser`)
  } else if (isRunningInDeno()) {
    // In the production enviroment of Deno Deploy, The data directory should be
    // copied to .output directory. The working directory will be directly under
    // .output.
    return "data"
  } else {
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
    const string = await fsPromise.readFile(fullPath, "utf-8")
    return Option.some(JSON.parse(string) as T)
  } else {
    return Option.none()
  }
}
