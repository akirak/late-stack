import { expect, test } from "@playwright/test"

const TEST_PATH = "/about/en"

test("about page renders without parsing errors", async ({ page }) => {
  await page.goto(TEST_PATH)

  // Check that the main heading is visible
  await expect(page.getByRole("heading", { name: "About the Author" })).toBeVisible()

  // Verify no JavaScript errors occurred during rendering
  const errors: string[] = []
  page.on("pageerror", (error) => {
    errors.push(error.message)
  })

  // Wait for page to be fully loaded
  await page.waitForLoadState("networkidle")

  // Check that no parsing errors occurred
  expect(errors).toHaveLength(0)
})

test("about page has correct document title", async ({ page }) => {
  await page.goto(TEST_PATH)

  // Check that the document title includes both the page title and site suffix
  await expect(page).toHaveTitle("Akira Komamura (en) — jingsi.space")
})

test("about page content is properly rendered", async ({ page }) => {
  await page.goto(TEST_PATH)

  // Check for key content elements to ensure proper rendering
  await expect(page.locator("body")).toContainText("Akira Komamura")

  // Verify the page doesn't show any error messages
  await expect(page.locator("text=Error")).not.toBeVisible()
  await expect(page.locator("text=404")).not.toBeVisible()
})
