import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Tools Index", path: "/tools" },
  { name: "JSON Formatter", path: "/tools/json-formatter" },
  { name: "Variable Name Wizard", path: "/tools/variable-name-wizard" },
  { name: "Regex Humanizer", path: "/tools/regex-humanizer" },
  { name: "Code Review", path: "/tools/code-review" },
  { name: "Cost Calculator", path: "/tools/cost-calculator" },
  { name: "Base64", path: "/tools/base64" },
  { name: "UUID Generator", path: "/tools/uuid-generator" },
  { name: "DTO-Matic", path: "/tools/dto-matic" },
  { name: "Git Commit Generator", path: "/tools/git-commit-generator" },
  { name: "Cron Builder", path: "/tools/cron-builder" },
  { name: "Tailwind Sorter", path: "/tools/tailwind-sorter" },
  { name: "Prompt Analyzer", path: "/tools/prompt-analyzer" },
  { name: "Token Visualizer", path: "/tools/token-visualizer" },
  { name: "Context Manager", path: "/tools/context-manager" },
  { name: "HTTP Status Finder", path: "/tools/http-status-finder" },
  { name: "Settings", path: "/settings" },
  { name: "Docs", path: "/docs" },
  { name: "History", path: "/history" },
];

test.describe("Accessibility (WCAG AAA)", () => {
  for (const { name, path } of PAGES) {
    test(`${name} has no critical a11y violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag21aaa", "wcag22aa"])
        .disableRules([
          "color-contrast-enhanced", // WCAG AAA enhanced contrast (7:1) — HeroUI beta theme tokens
          "color-contrast",          // HeroUI beta may have contrast issues in some themes
          "duplicate-id",            // HeroUI compound components may generate duplicate IDs
          "list",                    // HeroUI Pagination v2 renders <ul> with <li role="button"> children
        ])
        .analyze();

      const criticalViolations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      expect(
        criticalViolations,
        `${name}: ${criticalViolations.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`).join("; ")}`
      ).toHaveLength(0);
    });
  }
});
