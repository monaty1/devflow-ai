import { test, expect } from "@playwright/test";

test.describe("Regex Humanizer", () => {
  test("loads the regex humanizer page", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("explains a regex pattern", async ({ page }) => {
    await page.goto("/tools/regex-humanizer");
    const input = page.locator("textarea, input[type='text']").first();
    await input.fill("^[a-zA-Z0-9]+@[a-zA-Z]+\\.[a-zA-Z]{2,}$");
    const explainBtn = page.getByRole("button", { name: /explain|explicar|analyze|analizar/i }).first();
    await explainBtn.click();
    // Explanation should appear
    await expect(page.locator("text=/start|begin|inicio|comienzo|character|caracter/i").first()).toBeVisible({ timeout: 5000 });
  });
});
