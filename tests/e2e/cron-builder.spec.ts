import { test, expect } from "@playwright/test";

test.describe("Cron Builder", () => {
  test("loads the cron builder page", async ({ page }) => {
    await page.goto("/tools/cron-builder");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("displays human-readable cron description", async ({ page }) => {
    await page.goto("/tools/cron-builder");
    // The page should show default cron expression description
    await expect(
      page.locator("text=/every|cada|minute|minuto/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
