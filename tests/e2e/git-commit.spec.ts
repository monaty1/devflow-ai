import { test, expect } from "@playwright/test";

test.describe("Git Commit Generator", () => {
  test("loads the git commit generator page", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates a conventional commit message", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");
    const input = page.locator("textarea").first();
    await input.fill("Added user authentication with JWT tokens");
    const generateBtn = page
      .getByRole("button", { name: /generate|generar/i })
      .first();
    await generateBtn.click();
    // Should show conventional commit format
    await expect(
      page.locator("text=/feat|fix|chore|refactor/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
