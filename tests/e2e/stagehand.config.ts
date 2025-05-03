import * as process from "node:process"
import { Stagehand } from "@browserbasehq/stagehand"

const executablePath = process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH

export const production = process.env.NODE_ENV === "production"

// For production, use the default port for the Deno preset
export const APP_PORT = production ? 8000 : 4000

export const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${APP_PORT}`

export async function initStageHand() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    localBrowserLaunchOptions: {
      headless: true,
      executablePath,
      acceptDownloads: !executablePath,
    },
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })
  await stagehand.init()
  return stagehand
}
