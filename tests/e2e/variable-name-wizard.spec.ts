import { test, expect } from "@playwright/test";

test.describe("Variable Name Wizard", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/variable-name-wizard");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates variable name suggestions", async ({ page }) => {
    await page.goto("/tools/variable-name-wizard");

    // Type a description in the textarea
    const input = page.locator("textarea").first();
    await input.fill("hello world");

    // Click the generate/cast spell button
    const generateBtn = page.getByRole("button", { name: /cast naming spell|lanzar hechizo/i });
    await generateBtn.click();

    // Suggestions should appear with camelCase or other convention names
    await expect(page.getByText(/helloWorld|hello_world/i).first()).toBeVisible({ timeout: 10000 });
  });
});
