import { expect, test } from "@playwright/test"

const TEST_PATH = "/post/en/sample"

test("post", async ({ page }) => {
  await page.goto(TEST_PATH)

  await expect(page.getByRole("heading", { name: "An Example Post" })).toBeVisible()
})
