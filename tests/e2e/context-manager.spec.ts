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

  test("add document via paste modal", async ({ page }) => {
    await page.goto("/tools/context-manager");

    // Create a window first
    const windowInput = page.locator("input").first();
    await windowInput.fill("Paste Test");
    await windowInput.press("Enter");
    await expect(page.getByText("Paste Test")).toBeVisible({ timeout: 10000 });

    // Click "Paste Code" button to open modal
    const pasteBtn = page.getByRole("button", { name: /paste/i });
    await pasteBtn.click();

    // Fill in the modal form
    const titleInput = page.getByPlaceholder(/e\.g\. user-service/i);
    await titleInput.fill("my-component.tsx");

    const contentArea = page.getByPlaceholder(/paste context content/i);
    await contentArea.fill("const MyComponent = () => <div>Hello</div>;");

    // Click Ingest button
    const ingestBtn = page.getByRole("button", { name: /ingest/i });
    await ingestBtn.click();

    // Document should appear in the table
    await expect(page.getByText("my-component.tsx")).toBeVisible({ timeout: 10000 });
  });

  test("delete window with confirmation", async ({ page }) => {
    await page.goto("/tools/context-manager");

    // Create a window
    const windowInput = page.locator("input").first();
    await windowInput.fill("Delete Me");
    await windowInput.press("Enter");
    await expect(page.getByText("Delete Me")).toBeVisible({ timeout: 10000 });

    // Hover over the window to reveal delete button
    const windowItem = page.getByText("Delete Me").locator("..");
    await windowItem.hover();

    // Click the delete icon
    const deleteBtn = windowItem.locator("button").last();
    await deleteBtn.click();

    // Confirmation dialog should appear
    await expect(page.getByText(/permanently delete/i)).toBeVisible({ timeout: 5000 });

    // Confirm delete
    const confirmBtn = page.getByRole("button", { name: /delete/i }).last();
    await confirmBtn.click();

    // Window should be gone
    await expect(page.getByText("Delete Me")).not.toBeVisible({ timeout: 5000 });
  });

  test("model selector changes visible token limit", async ({ page }) => {
    await page.goto("/tools/context-manager");

    // Create a window
    const windowInput = page.locator("input").first();
    await windowInput.fill("Model Test");
    await windowInput.press("Enter");
    await expect(page.getByText("Model Test")).toBeVisible({ timeout: 10000 });

    // The model selector should be visible with default value
    const modelSelector = page.locator("select[aria-label]").first();
    await expect(modelSelector).toBeVisible({ timeout: 5000 });

    // Should show token count for the default model
    await expect(page.getByText(/128,000/)).toBeVisible({ timeout: 5000 });
  });

  test("export copies correct content", async ({ page }) => {
    await page.goto("/tools/context-manager");

    // Create window and add a document
    const windowInput = page.locator("input").first();
    await windowInput.fill("Export Test");
    await windowInput.press("Enter");
    await expect(page.getByText("Export Test")).toBeVisible({ timeout: 10000 });

    // Open paste modal
    const pasteBtn = page.getByRole("button", { name: /paste/i });
    await pasteBtn.click();

    const titleInput = page.getByPlaceholder(/e\.g\. user-service/i);
    await titleInput.fill("test-file.ts");

    const contentArea = page.getByPlaceholder(/paste context content/i);
    await contentArea.fill("export const value = 42;");

    const ingestBtn = page.getByRole("button", { name: /ingest/i });
    await ingestBtn.click();

    // Wait for document to appear
    await expect(page.getByText("test-file.ts")).toBeVisible({ timeout: 10000 });

    // The "Copy AI-Ready Context" button should be visible
    const copyBtn = page.getByRole("button", { name: /copy ai-ready/i });
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
  });
});
