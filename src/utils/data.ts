import * as url from 'node:url';
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { isRunningInDeno } from './env';

function getDataDir() {
  if (isRunningInDeno()) {
    // The data directory should be copied to .output directory
    return '../data'
  } else {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../../data');
  }
}

export async function readDataFile(filePath: string) {
  const fullPath = path.join(getDataDir(), filePath);
  return await fs.readFile(fullPath, 'utf-8')
}
