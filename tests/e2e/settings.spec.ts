import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("theme toggle switches between dark and light mode", async ({ page }) => {
    await page.goto("/settings");

    // Find the theme toggle and verify the HTML element has the class attribute for theme
    const html = page.locator("html");
    const initialClass = await html.getAttribute("class");

    // Click the theme toggle button
    const themeToggle = page.getByRole("button", { name: /theme|dark|light/i }).first();
    await themeToggle.click();

    // Class should change after toggle
    const newClass = await html.getAttribute("class");
    expect(newClass).not.toBe(initialClass);
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
