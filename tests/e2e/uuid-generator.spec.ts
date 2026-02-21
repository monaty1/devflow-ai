import { test, expect } from "@playwright/test";

test.describe("UUID Generator", () => {
  test("loads the UUID generator page", async ({ page }) => {
    await page.goto("/tools/uuid-generator");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates a valid UUID", async ({ page }) => {
    await page.goto("/tools/uuid-generator");
    const generateBtn = page.getByRole("button", { name: /generate|generar/i }).first();
    await generateBtn.click();
    // UUID pattern should appear somewhere
    await expect(page.locator("text=/[0-9a-f]{8}-[0-9a-f]{4}/i").first()).toBeVisible({ timeout: 5000 });
  });
});
