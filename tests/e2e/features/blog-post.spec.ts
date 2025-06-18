import { expect, test } from "@playwright/test"

const TEST_PATH = "/post/en/sample"

test("post", async ({ page }) => {
  await page.goto(TEST_PATH)

  await expect(page.getByRole("heading", { name: "An Example Post" })).toBeVisible()
})

test("display the document title", async ({ page }) => {
  await page.goto("/post/en/sample")

  // Check that the document title includes both the post title and site suffix
  await expect(page).toHaveTitle("An Example Post — jingsi.space")
})
