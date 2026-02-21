import { test, expect } from "@playwright/test";

test.describe("Cost Calculator", () => {
  test("loads the cost calculator page", async ({ page }) => {
    await page.goto("/tools/cost-calculator");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows cost table with model data", async ({ page }) => {
    await page.goto("/tools/cost-calculator");
    // The page should show cost data by default
    await expect(page.getByText(/gpt|claude|gemini/i).first()).toBeVisible({ timeout: 5000 });
  });
});
