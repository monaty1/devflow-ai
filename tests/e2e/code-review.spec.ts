import { test, expect } from "@playwright/test";

test.describe("Code Review", () => {
  test("loads the code review page", async ({ page }) => {
    await page.goto("/tools/code-review");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("reviews code and shows issues", async ({ page }) => {
    await page.goto("/tools/code-review");
    const input = page.locator("textarea").first();
    await input.fill("function test() { var x = 1; eval(x); console.log(x); }");
    const reviewBtn = page.getByRole("button", { name: /review|analizar/i }).first();
    await reviewBtn.click();
    // Issues or score should appear
    await expect(page.locator("text=/issue|problema|score|puntuacion/i").first()).toBeVisible({ timeout: 5000 });
  });
});
