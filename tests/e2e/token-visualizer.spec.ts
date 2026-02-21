import { test, expect } from "@playwright/test";

test.describe("Token Visualizer", () => {
  test("loads the token visualizer page", async ({ page }) => {
    await page.goto("/tools/token-visualizer");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("visualizes tokens from text input", async ({ page }) => {
    await page.goto("/tools/token-visualizer");
    const input = page.locator("textarea").first();
    await input.fill("Hello world, this is a test of token visualization.");
    const visualizeBtn = page.getByRole("button", { name: /visualize|visualizar|tokenize|tokenizar|count|contar/i }).first();
    await visualizeBtn.click();
    // Token count or visualization should appear
    await expect(page.locator("text=/token|ficha/i").first()).toBeVisible({ timeout: 5000 });
  });
});
