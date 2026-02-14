import * as process from "node:process"
import { defineConfig, devices } from "@playwright/test"

const executablePath = process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH

const production = process.env.NODE_ENV === "production"

const APP_PORT = Number(process.env.E2E_PORT || "3000")
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${APP_PORT}`

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  timeout: 120_000,

  expect: {
    timeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath
          ? {
              executablePath,
            }
          : {},
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: production
      ? `NITRO_PORT=${APP_PORT} PORT=${APP_PORT} pnpm run start`
      : `pnpm run dev -- --host 127.0.0.1 --port ${APP_PORT}`,
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
