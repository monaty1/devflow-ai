import { test, expect } from "@playwright/test";

test.describe("Code Review", () => {
  test("page heading is visible", async ({ page }) => {
    await page.goto("/tools/code-review");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("reviews code and shows score", async ({ page }) => {
    await page.goto("/tools/code-review");

    const textarea = page.locator("textarea").first();
    await textarea.fill(
      'function hello() { console.log("hi"); eval("bad"); }'
    );

    // Click review button (i18n: "Review Code" / "Revisar Codigo")
    const reviewBtn = page
      .getByRole("button", { name: /review|revisar/i })
      .first();
    await reviewBtn.click();

    // Overall score circle should appear with a number
    await expect(
      page.locator('[role="img"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
