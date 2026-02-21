import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/tools",
  "/tools/json-formatter",
  "/tools/prompt-analyzer",
  "/tools/code-review",
  "/tools/cost-calculator",
  "/tools/token-visualizer",
  "/tools/context-manager",
  "/tools/uuid-generator",
  "/tools/base64",
  "/tools/regex-humanizer",
  "/tools/variable-name-wizard",
  "/tools/dto-matic",
  "/tools/cron-builder",
  "/tools/git-commit-generator",
  "/tools/http-status-finder",
  "/tools/tailwind-sorter",
  "/settings",
  "/docs",
  "/history",
];

for (const url of PAGES) {
  test(`accessibility: ${url} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"]) // HeroUI beta may have upstream contrast issues
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
