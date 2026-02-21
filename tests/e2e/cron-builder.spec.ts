import { test, expect } from "@playwright/test";

test.describe("Cron Builder", () => {
  test("default cron expression is visible", async ({ page }) => {
    await page.goto("/tools/cron-builder");

    // The default cron expression (* * * * *) should be displayed prominently
    await expect(page.getByText("* * * * *")).toBeVisible();
  });

  test("human-readable description appears", async ({ page }) => {
    await page.goto("/tools/cron-builder");

    // The human-readable explanation card should be visible with a description
    await expect(page.getByText(/human readable|legible/i).first()).toBeVisible();
  });
});
