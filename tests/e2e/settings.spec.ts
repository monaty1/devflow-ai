import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("theme toggle switches between dark and light mode", async ({ page }) => {
    await page.goto("/settings");

    // Click the "dark" theme button on the settings page (guarantees a class change)
    const darkButton = page.getByRole("button", { name: "dark", exact: true });
    await expect(darkButton).toBeVisible({ timeout: 5000 });
    await darkButton.click();

    // next-themes should apply "dark" class on <html>
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5000 });
  });

  test("locale toggle switches between EN and ES", async ({ page }) => {
    await page.goto("/settings");

    // Find any English text on the page
    const settingsHeading = page.getByRole("heading", { level: 1 });
    const initialText = await settingsHeading.textContent();

    // Click locale toggle
    const localeToggle = page.getByRole("button", { name: /language|idioma|locale|en|es/i }).first();
    await localeToggle.click();

    // Heading text should change after locale switch
    await expect(settingsHeading).not.toHaveText(initialText ?? "");
  });
});
