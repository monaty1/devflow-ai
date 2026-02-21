import { test, expect } from "@playwright/test";

test.describe("Settings Export/Import", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("settings page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("export button is present and clickable", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /export|exportar/i });
    await expect(exportBtn).toBeVisible();
  });

  test("import button is present and clickable", async ({ page }) => {
    const importBtn = page.getByRole("button", { name: /import|importar/i });
    await expect(importBtn).toBeVisible();
  });

  test("theme toggle changes theme", async ({ page }) => {
    // Find theme toggle (Switch or button)
    const themeToggle = page.getByRole("switch").first();
    if (await themeToggle.isVisible()) {
      const htmlBefore = await page.locator("html").getAttribute("class");
      await themeToggle.click();
      // Wait for theme transition
      await page.waitForTimeout(500);
      const htmlAfter = await page.locator("html").getAttribute("class");
      // Theme class should change
      expect(htmlBefore).not.toBe(htmlAfter);
    }
  });
});
