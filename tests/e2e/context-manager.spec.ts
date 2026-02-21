import { test, expect } from "@playwright/test";

test.describe("Context Manager", () => {
  test("loads the context manager page", async ({ page }) => {
    await page.goto("/tools/context-manager");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows model presets", async ({ page }) => {
    await page.goto("/tools/context-manager");
    // Should show model names or context window info
    await expect(page.locator("text=/gpt|claude|gemini|context|contexto/i").first()).toBeVisible({ timeout: 5000 });
  });
});
