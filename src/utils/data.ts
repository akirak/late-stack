import * as url from 'node:url';
import * as fs from "node:fs/promises"
import * as path from "node:path"

export async function readDataFile(filePath: string) {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const fullPath = path.join(__dirname, '../../data', filePath);
  return await fs.readFile(fullPath, 'utf-8')
}
