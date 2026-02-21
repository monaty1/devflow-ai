import { test, expect } from "@playwright/test";

test.describe("Variable Name Wizard", () => {
  test("loads the variable name wizard page", async ({ page }) => {
    await page.goto("/tools/variable-name-wizard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates variable name suggestions", async ({ page }) => {
    await page.goto("/tools/variable-name-wizard");
    const input = page.locator("textarea, input[type='text']").first();
    await input.fill("get current user info");
    const generateBtn = page
      .getByRole("button", { name: /generate|generar/i })
      .first();
    await generateBtn.click();
    // Should show camelCase or other naming conventions
    await expect(
      page
        .locator(
          "text=/camelCase|getCurrentUserInfo|get_current_user_info/i"
        )
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});
