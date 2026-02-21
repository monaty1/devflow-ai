import { test, expect } from "@playwright/test";

test.describe("DTO-Matic", () => {
  test("loads the DTO-Matic page", async ({ page }) => {
    await page.goto("/tools/dto-matic");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates code from JSON input", async ({ page }) => {
    await page.goto("/tools/dto-matic");
    const input = page.locator("textarea").first();
    await input.fill(
      '{"name": "John", "age": 30, "email": "john@example.com"}'
    );
    const generateBtn = page
      .getByRole("button", { name: /generate|generar/i })
      .first();
    await generateBtn.click();
    // Generated files should appear
    await expect(
      page.locator("text=/interface|type|entity|class/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
