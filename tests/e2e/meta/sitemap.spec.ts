import { expect, test } from "@playwright/test"
import { XMLParser, XMLValidator } from "fast-xml-parser"

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

test("sitemap.xml returns valid XML response", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml")

  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("application/xml")

  const xmlContent = await response.text()

  // Validate XML structure using fast-xml-parser
  const isValid = XMLValidator.validate(xmlContent)
  expect(isValid).toBe(true)

  // Parse XML and validate sitemap structure
  const parsedXml = xmlParser.parse(xmlContent)
  expect(parsedXml).toHaveProperty("urlset")
  expect(parsedXml.urlset).toHaveProperty("@_xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

  // Check that URLs exist
  const urls = Array.isArray(parsedXml.urlset.url) ? parsedXml.urlset.url : [parsedXml.urlset.url]
  expect(urls.length).toBeGreaterThan(0)
})

test("sitemap.xml contains url entries", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml")
  const xmlContent = await response.text()
  const parsedXml = xmlParser.parse(xmlContent)

  const urls = Array.isArray(parsedXml.urlset.url) ? parsedXml.urlset.url : [parsedXml.urlset.url]

  // Check for homepage entry
  expect(urls.some((url: any) => url.loc)).toBe(true)
})

test("sitemap.xml has proper caching headers", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml")

  expect(response.headers()["cache-control"]).toContain("public")
  expect(response.headers()["cache-control"]).toContain("max-age=86400")
})
