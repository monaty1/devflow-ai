import { test, expect } from "@playwright/test";

test.describe("Cost Calculator", () => {
  test("page loads with pricing display visible", async ({ page }) => {
    await page.goto("/tools/cost-calculator");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // The estimated monthly cost card or price comparison section should be visible
    await expect(page.getByText(/\$/)).toBeVisible({ timeout: 10000 });
  });

  test("displays model names in the comparison table", async ({ page }) => {
    await page.goto("/tools/cost-calculator");

    // At least one known model name should appear in the pricing table
    await expect(
      page.getByText(/GPT|Claude|Gemini|Llama/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
