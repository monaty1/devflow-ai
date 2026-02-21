import { test, expect } from "@playwright/test";

test.describe("Base64 Encoder/Decoder", () => {
  test("encodes text to base64", async ({ page }) => {
    await page.goto("/tools/base64");

    // Ensure encode mode is active
    const encodeBtn = page.getByRole("button", { name: /^encode$|^codificar$/i });
    await encodeBtn.click();

    // Type input text
    const input = page.locator("textarea").first();
    await input.fill("Hello World");

    // Click process button
    const processBtn = page.getByRole("button", { name: /generate encoding|generar codificaci/i });
    await processBtn.click();

    // Output should contain the base64 encoded value
    await expect(page.locator("pre code").first()).toContainText("SGVsbG8gV29ybGQ=");
  });

  test("decodes base64 to text", async ({ page }) => {
    await page.goto("/tools/base64");

    // Switch to decode mode
    const decodeBtn = page.getByRole("button", { name: /^decode$|^decodificar$/i });
    await decodeBtn.click();

    // Type base64 input
    const input = page.locator("textarea").first();
    await input.fill("SGVsbG8gV29ybGQ=");

    // Click process button
    const processBtn = page.getByRole("button", { name: /execute decoding|ejecutar decodificaci/i });
    await processBtn.click();

    // Output should contain the decoded text
    await expect(page.locator("pre code").first()).toContainText("Hello World");
  });
});
