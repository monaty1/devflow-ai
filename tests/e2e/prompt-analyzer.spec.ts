import { test, expect } from "@playwright/test";

test.describe("Prompt Analyzer", () => {
  test("loads the prompt analyzer page", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("analyzes a prompt and shows score", async ({ page }) => {
    await page.goto("/tools/prompt-analyzer");
    const input = page.locator("textarea").first();
    await input.fill("Write a Python function that sorts a list of integers in ascending order using quicksort algorithm. Include type hints and docstrings.");
    const analyzeBtn = page.getByRole("button", { name: /analyze/i }).first();
    await analyzeBtn.click();
    // Score should appear
    await expect(page.getByText(/score|puntuacion/i).first()).toBeVisible({ timeout: 5000 });
  });
});
