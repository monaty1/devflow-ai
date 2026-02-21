import { test, expect } from "@playwright/test";

test.describe("HTTP Status Finder", () => {
  test("page loads with common status codes visible", async ({ page }) => {
    await page.goto("/tools/http-status-finder");

    // Common codes like 200 or 404 should appear on the page
    await expect(page.getByText("200").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("404").first()).toBeVisible();
  });

  test("clicking a status code shows detail information", async ({ page }) => {
    await page.goto("/tools/http-status-finder");

    // Click the 404 status code card
    const card404 = page
      .getByRole("button", { name: /404/i })
      .first();
    await card404.click();

    // Detail view should show the status name and description
    await expect(page.getByText("Not Found")).toBeVisible({ timeout: 10000 });
  });
});
