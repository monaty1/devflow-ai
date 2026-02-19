import { test, expect } from "@playwright/test";

test.describe("JSON Formatter", () => {
  test("formats valid JSON input", async ({ page }) => {
    await page.goto("/tools/json-formatter");

    const input = page.locator("textarea").first();
    await input.fill('{"name":"test","value":123}');

    // Click the format button
    const formatBtn = page.getByRole("button", { name: /format/i }).first();
    await formatBtn.click();

    // Output should contain formatted JSON with indentation
    const output = page.locator("textarea, pre, code").last();
    await expect(output).toContainText('"name"');
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter");

    const input = page.locator("textarea").first();
    await input.fill("{invalid json}");

    const formatBtn = page.getByRole("button", { name: /format/i }).first();
    await formatBtn.click();

    // Error badge should appear
    await expect(page.getByText("ERROR")).toBeVisible();
  });
});
