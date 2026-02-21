import { test, expect } from "@playwright/test";

test.describe("HTTP Status Finder", () => {
  test("loads the HTTP status finder page", async ({ page }) => {
    await page.goto("/tools/http-status-finder");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("finds status code 404", async ({ page }) => {
    await page.goto("/tools/http-status-finder");
    const searchInput = page
      .locator("input[type='text'], input[type='search']")
      .first();
    await searchInput.fill("404");
    // Should show 404 Not Found
    await expect(
      page.locator("text=/not found/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
