import { test, expect } from "@playwright/test";

test.describe("Base64 Encoder/Decoder", () => {
  test("loads the base64 page", async ({ page }) => {
    await page.goto("/tools/base64");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("encodes text to base64", async ({ page }) => {
    await page.goto("/tools/base64");
    const input = page.locator("textarea").first();
    await input.fill("Hello World");
    const encodeBtn = page.getByRole("button", { name: /encode|codificar/i }).first();
    await encodeBtn.click();
    // Base64 output should contain the encoded value
    await expect(page.locator("text=SGVsbG8gV29ybGQ=").first()).toBeVisible({ timeout: 5000 });
  });
});
