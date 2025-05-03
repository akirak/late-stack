import type { Stagehand } from "@browserbasehq/stagehand"
import { afterAll, beforeAll, expect, test } from "vitest"
import * as z from "zod"
import { BASE_URL, initStageHand } from "../stagehand.config"

const TEST_SLUG = "sample-category"

// Set a longer timeout for E2E tests
const testTimeout = 30000 // 30 seconds

let stagehand: Stagehand
let page: Stagehand["page"]

beforeAll(async () => {
  stagehand = await initStageHand()
  page = stagehand.page
}, testTimeout)

afterAll(async () => {
  if (stagehand) {
    await stagehand.close()
  }
}, testTimeout)

test(`categories`, async () => {
  // Path based on routeTree.gen.ts FileRoutesByFullPath interface
  await page.goto(`${BASE_URL}/category/${TEST_SLUG}`)

  const { headingContent } = await page.extract({
    instruction: "The text content of the main heading (h1)",
    schema: z.object({
      headingContent: z.string(),
    }),
  })

  // Check if the heading contains the expected text and the slug
  expect(headingContent).toContain("CategoryComponent")
  expect(headingContent).toContain(TEST_SLUG)

  // eslint-disable-next-line no-console
  console.log(`✅ Test passed for route: /category/${TEST_SLUG}`)
}, testTimeout)
