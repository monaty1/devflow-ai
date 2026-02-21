import { test, expect } from "@playwright/test";

test.describe("Context Manager", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/context-manager");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("creates a new context window", async ({ page }) => {
    await page.goto("/tools/context-manager");

    // Type a window name in the input field
    const windowInput = page
      .locator("input")
      .first();
    await windowInput.fill("Test Project");
    await windowInput.press("Enter");

    // The new window should appear in the sidebar list
    await expect(page.getByText("Test Project")).toBeVisible({
      timeout: 10000,
    });
  });
});
