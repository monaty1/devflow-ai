import type { ToolCategory } from "@/types/tools";

export interface Command {
  id: string;
  type: "tool" | "action";
  labelKey: string;
  descriptionKey: string;
  icon: string;
  href?: string;
  action?: string;
  category?: ToolCategory;
}

export const COMMANDS: Command[] = [
  // Tools (15)
  { id: "prompt-analyzer", type: "tool", labelKey: "tool.prompt-analyzer.name", descriptionKey: "tool.prompt-analyzer.description", icon: "FileSearch", href: "/tools/prompt-analyzer", category: "analysis" },
  { id: "code-review", type: "tool", labelKey: "tool.code-review.name", descriptionKey: "tool.code-review.description", icon: "Code2", href: "/tools/code-review", category: "review" },
  { id: "cost-calculator", type: "tool", labelKey: "tool.cost-calculator.name", descriptionKey: "tool.cost-calculator.description", icon: "Calculator", href: "/tools/cost-calculator", category: "calculation" },
  { id: "token-visualizer", type: "tool", labelKey: "tool.token-visualizer.name", descriptionKey: "tool.token-visualizer.description", icon: "Eye", href: "/tools/token-visualizer", category: "visualization" },
  { id: "context-manager", type: "tool", labelKey: "tool.context-manager.name", descriptionKey: "tool.context-manager.description", icon: "Database", href: "/tools/context-manager", category: "management" },
  { id: "json-formatter", type: "tool", labelKey: "tool.json-formatter.name", descriptionKey: "tool.json-formatter.description", icon: "Braces", href: "/tools/json-formatter", category: "analysis" },
  { id: "uuid-generator", type: "tool", labelKey: "tool.uuid-generator.name", descriptionKey: "tool.uuid-generator.description", icon: "Fingerprint", href: "/tools/uuid-generator", category: "calculation" },
  { id: "base64", type: "tool", labelKey: "tool.base64.name", descriptionKey: "tool.base64.description", icon: "Binary", href: "/tools/base64", category: "calculation" },
  { id: "regex-humanizer", type: "tool", labelKey: "tool.regex-humanizer.name", descriptionKey: "tool.regex-humanizer.description", icon: "Regex", href: "/tools/regex-humanizer", category: "analysis" },
  { id: "variable-name-wizard", type: "tool", labelKey: "tool.variable-name-wizard.name", descriptionKey: "tool.variable-name-wizard.description", icon: "Wand2", href: "/tools/variable-name-wizard", category: "management" },
  { id: "dto-matic", type: "tool", labelKey: "tool.dto-matic.name", descriptionKey: "tool.dto-matic.description", icon: "FileCode2", href: "/tools/dto-matic", category: "analysis" },
  { id: "cron-builder", type: "tool", labelKey: "tool.cron-builder.name", descriptionKey: "tool.cron-builder.description", icon: "Clock", href: "/tools/cron-builder", category: "calculation" },
  { id: "git-commit-generator", type: "tool", labelKey: "tool.git-commit-generator.name", descriptionKey: "tool.git-commit-generator.description", icon: "GitCommit", href: "/tools/git-commit-generator", category: "management" },
  { id: "http-status-finder", type: "tool", labelKey: "tool.http-status-finder.name", descriptionKey: "tool.http-status-finder.description", icon: "Globe", href: "/tools/http-status-finder", category: "analysis" },
  { id: "tailwind-sorter", type: "tool", labelKey: "tool.tailwind-sorter.name", descriptionKey: "tool.tailwind-sorter.description", icon: "ArrowUpDown", href: "/tools/tailwind-sorter", category: "review" },
  // Actions (5)
  { id: "action-theme", type: "action", labelKey: "cmdPalette.toggleTheme", descriptionKey: "cmdPalette.toggleThemeDesc", icon: "Sun", action: "toggle-theme" },
  { id: "action-locale", type: "action", labelKey: "cmdPalette.toggleLocale", descriptionKey: "cmdPalette.toggleLocaleDesc", icon: "Languages", action: "toggle-locale" },
  { id: "action-settings", type: "action", labelKey: "cmdPalette.openSettings", descriptionKey: "cmdPalette.openSettingsDesc", icon: "Settings", href: "/settings" },
  { id: "action-docs", type: "action", labelKey: "cmdPalette.openDocs", descriptionKey: "cmdPalette.openDocsDesc", icon: "BookOpen", href: "/docs" },
  { id: "action-history", type: "action", labelKey: "cmdPalette.openHistory", descriptionKey: "cmdPalette.openHistoryDesc", icon: "History", href: "/history" },
];
