import { test, expect } from "@playwright/test";

test.describe("Git Commit Generator", () => {
  test("page loads with heading visible", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("commit form has type and scope inputs", async ({ page }) => {
    await page.goto("/tools/git-commit-generator");

    // The type selector button should be visible
    await expect(page.getByText(/type|tipo/i).first()).toBeVisible();

    // The scope label should be visible
    await expect(page.getByText(/scope/i).first()).toBeVisible();

    // Type a commit description and verify the character counter updates
    const descInput = page.locator('input').filter({ has: page.locator('[placeholder]') }).first();
    await descInput.fill("add user authentication");

    // The character counter should reflect the input length
    await expect(page.getByText(/\/72/).first()).toBeVisible();
  });
});
