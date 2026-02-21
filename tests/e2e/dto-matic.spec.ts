import { test, expect } from "@playwright/test";

test.describe("DTO-Matic", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/dto-matic");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates TypeScript interface from JSON", async ({ page }) => {
    await page.goto("/tools/dto-matic");

    const input = page.locator("textarea").first();
    await input.fill('{"name": "John", "age": 30, "active": true}');

    const generateBtn = page.getByRole("button", { name: /generate|generar/i }).first();
    await generateBtn.click();

    // Should produce TypeScript interface with the field names
    await expect(page.getByText(/interface|name.*string/i)).toBeVisible({ timeout: 10000 });
  });
});
