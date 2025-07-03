import { expect, test } from "@playwright/test"

const TEST_PATH = "/post/en/style-guide"

test("post", async ({ page }) => {
  await page.goto(TEST_PATH)

  await expect(page.getByRole("heading", { name: "Content Style Guide" })).toBeVisible()
})

test("display the document title", async ({ page }) => {
  await page.goto("/post/en/style-guide")

  // Check that the document title includes both the post title and site suffix
  await expect(page).toHaveTitle("Content Style Guide — jingsi.space")
})
