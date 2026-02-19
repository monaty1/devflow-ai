import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing page CTA navigates to /tools", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /open dashboard|abrir dashboard/i }).click();
    await expect(page).toHaveURL(/\/tools/);
  });

  test("tool list click navigates to JSON Formatter page", async ({ page }) => {
    await page.goto("/tools");
    await page.getByRole("link", { name: /json formatter/i }).first().click();
    await expect(page).toHaveURL(/\/tools\/json-formatter/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
