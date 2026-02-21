import { test, expect } from "@playwright/test";

test.describe("Regex Humanizer", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("explains a regex pattern", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");

    // Type a regex pattern in the textarea
    const input = page.locator("textarea").first();
    await input.fill("\\d{3}-\\d{4}");

    // Click analyze button
    const analyzeBtn = page.getByRole("button", { name: /analyze pattern|analizar patr/i });
    await analyzeBtn.click();

    // Explanation should appear mentioning digits or numbers
    await expect(page.getByText(/digit|dígito|number|número/i).first()).toBeVisible({ timeout: 10000 });
  });
});
