import { expect, test } from "@playwright/test"
import { XMLParser, XMLValidator } from "fast-xml-parser"

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

test("default RSS feed returns valid Atom 1.0 XML", async ({ page }) => {
  const response = await page.request.get("/feeds/default.xml")

  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("application/atom+xml; charset=utf-8")

  const xmlContent = await response.text()

  // Validate XML structure using fast-xml-parser
  const isValid = XMLValidator.validate(xmlContent)
  expect(isValid).toBe(true)

  // Parse XML and validate Atom feed structure
  const parsedXml = xmlParser.parse(xmlContent)
  expect(parsedXml).toHaveProperty("feed")
  expect(parsedXml.feed).toHaveProperty("@_xmlns", "http://www.w3.org/2005/Atom")

  // Check required Atom elements
  expect(parsedXml.feed).toHaveProperty("title")
  expect(parsedXml.feed).toHaveProperty("id")
  expect(parsedXml.feed).toHaveProperty("updated")
})

test("default RSS feed contains entry elements", async ({ page }) => {
  const response = await page.request.get("/feeds/default.xml")
  const xmlContent = await response.text()
  const parsedXml = xmlParser.parse(xmlContent)

  if (parsedXml.feed.entry) {
    const entries = Array.isArray(parsedXml.feed.entry) ? parsedXml.feed.entry : [parsedXml.feed.entry]

    // Check that entries have required fields
    entries.forEach((entry: any) => {
      expect(entry).toHaveProperty("title")
      expect(entry).toHaveProperty("id")
      expect(entry).toHaveProperty("content")
    })
  }
})

test("default RSS feed has proper caching headers", async ({ page }) => {
  const response = await page.request.get("/feeds/default.xml")

  expect(response.headers()["cache-control"]).toContain("public")
})
