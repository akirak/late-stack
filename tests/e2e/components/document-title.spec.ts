import { expect, test } from "@playwright/test"

test("display a title with the suffix (on about page)", async ({ page }) => {
  await page.goto("/about/en")

  // Check that the document title includes both the page title and site suffix
  await expect(page).toHaveTitle("Akira Komamura [en] — jingsi.space")
})

test("display the default title (on home page)", async ({ page }) => {
  await page.goto("/")

  // Check that the homepage shows the default site title
  await expect(page).toHaveTitle("jingsi.space")
})
