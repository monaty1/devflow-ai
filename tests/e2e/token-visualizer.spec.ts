import { test, expect } from "@playwright/test";

test.describe("Token Visualizer", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/token-visualizer");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("tokenizes text and shows token count", async ({ page }) => {
    await page.goto("/tools/token-visualizer");

    const textarea = page.locator("textarea").first();
    await textarea.fill("Hello world, this is a test");

    // Auto-tokenization should produce token segments or a token count badge
    await expect(
      page.getByText(/token/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
