import { test, expect } from "@playwright/test";

test.describe("UUID Generator", () => {
  test("generates a valid UUID v4", async ({ page }) => {
    await page.goto("/tools/uuid-generator");

    // Click the generate button
    const generateBtn = page.getByRole("button", { name: /generate|generar/i }).first();
    await generateBtn.click();

    // Output should contain a UUID pattern (8-4-4-4-12 hex)
    const output = page.locator("pre").first();
    await expect(output).toContainText(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  test("bulk generates multiple UUIDs", async ({ page }) => {
    await page.goto("/tools/uuid-generator");

    // Change quantity to 5
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.fill("5");

    // Click generate
    const generateBtn = page.getByRole("button", { name: /generate|generar/i }).first();
    await generateBtn.click();

    // Output should contain multiple UUIDs (at least 2 lines with UUID pattern)
    const output = page.locator("pre").first();
    const text = await output.textContent();
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const matches = text?.match(uuidPattern) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });
});
