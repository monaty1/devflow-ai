import { test, expect } from "@playwright/test";

test.describe("Tailwind Sorter", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("auto-sorts Tailwind classes on input", async ({ page }) => {
    await page.goto("/tools/tailwind-sorter");

    const input = page.locator("textarea").first();
    await input.fill("text-red-500 flex mt-4 p-2 bg-blue-500 items-center");

    // Auto-sort fires after 400ms debounce — wait for stats cards to appear
    const classesCard = page.locator("text=/\\d+/").first();
    await expect(classesCard).toBeVisible({ timeout: 5000 });

    // The sorted output should contain the input classes (reordered)
    await expect(page.getByText("flex")).toBeVisible();
    await expect(page.getByText("items-center")).toBeVisible();
  });
});
