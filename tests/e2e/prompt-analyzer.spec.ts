import { test, expect } from "@playwright/test";

test.describe("Prompt Analyzer", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("analyzes a prompt and shows score", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");

    const textarea = page.locator("textarea").first();
    await textarea.fill(
      "You are a helpful assistant. Summarize the following text:"
    );

    // Click the analyze button (i18n: English or Spanish)
    const analyzeBtn = page
      .getByRole("button", { name: /analy|analiz/i })
      .first();
    await analyzeBtn.click();

    // Score badge or analysis result should appear
    await expect(page.getByText(/\/10/)).toBeVisible({ timeout: 10000 });
  });
});
