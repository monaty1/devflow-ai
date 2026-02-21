import { test, expect } from "@playwright/test";

test.describe("Tailwind Sorter", () => {
  test("loads the tailwind sorter page", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sorts tailwind classes", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");
    const input = page.locator("textarea").first();
    await input.fill(
      "text-red-500 flex mt-4 p-2 bg-blue-100 items-center"
    );
    const sortBtn = page
      .getByRole("button", { name: /sort|ordenar/i })
      .first();
    await sortBtn.click();
    // Sorted output should appear
    await expect(
      page.locator("text=/flex/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
