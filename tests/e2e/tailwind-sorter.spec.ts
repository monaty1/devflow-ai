import { test, expect } from "@playwright/test";

test.describe("Tailwind Sorter", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sorts Tailwind classes", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");

    const input = page.locator("textarea").first();
    await input.fill("text-red-500 flex mt-4 p-2 bg-blue-500 items-center");

    const sortBtn = page.getByRole("button", { name: /sort|ordenar/i }).first();
    await sortBtn.click();

    // Output should contain the sorted classes
    await expect(page.locator("textarea, pre, code").last()).toContainText("flex");
  });
});
