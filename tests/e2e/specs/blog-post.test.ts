import type { Stagehand } from "@browserbasehq/stagehand"
import { afterAll, beforeAll, expect, test } from "vitest"
import * as z from "zod"
import { BASE_URL, initStageHand } from "../stagehand.config"

const TEST_SLUG = "en/tanstack-blog"

// Set a longer timeout for E2E tests
const testTimeout = 60000 // 60 seconds

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

test(`post`, async () => {
  // Path based on routeTree.gen.ts FileRoutesByFullPath interface
  await page.goto(`${BASE_URL}/post/${TEST_SLUG}`)

  const { content } = await page.extract({
    instruction: "Retrieve the text content of the h1 heading",
    schema: z.object({
      content: z.string(),
    }),
  })

  // Check if the heading contains the expected text and the slug
  expect(content).toContain("TanStack Blog")

  console.log(`✅ Test passed for route: /post/${TEST_SLUG}`)
}, testTimeout)
