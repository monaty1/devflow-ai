"use client";

import { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import { Trash2, Search, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

interface HistoryItem {
  id: string;
  toolKey: string;
  toolLabel: string;
  summary: string;
  createdAt: string;
}

const TOOL_STORAGE_KEYS: { key: string; label: string; summaryField: string }[] = [
  { key: "devflow-analysis-history", label: "Prompt Analyzer", summaryField: "prompt" },
  { key: "devflow-code-review-history", label: "Code Review", summaryField: "code" },
  { key: "devflow-cost-calculator-history", label: "Cost Calculator", summaryField: "model" },
  { key: "devflow-token-visualizer-history", label: "Token Visualizer", summaryField: "text" },
  { key: "devflow-context-manager-history", label: "Context Manager", summaryField: "name" },
  { key: "devflow-regex-humanizer-history", label: "Regex Humanizer", summaryField: "input" },
  { key: "devflow-dto-matic-history", label: "DTO-Matic", summaryField: "input" },
  { key: "devflow-cron-builder-history", label: "Cron Builder", summaryField: "expression" },
  { key: "devflow-tailwind-sorter-history", label: "Tailwind Sorter", summaryField: "input" },
  { key: "devflow-variable-name-wizard-history", label: "Variable Name Wizard", summaryField: "input" },
  { key: "devflow-json-formatter-history", label: "JSON Formatter", summaryField: "input" },
  { key: "devflow-base64-history", label: "Base64", summaryField: "input" },
  { key: "devflow-uuid-generator-history", label: "UUID Generator", summaryField: "version" },
  { key: "devflow-git-commit-generator-history", label: "Git Commit Generator", summaryField: "message" },
  { key: "devflow-http-status-finder-history", label: "HTTP Status Finder", summaryField: "query" },
];

function getInitialHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  const items: HistoryItem[] = [];

  for (const tool of TOOL_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(tool.key);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      for (const entry of parsed) {
        const id = (entry["id"] as string | undefined) ?? crypto.randomUUID();
        const timestamp = (entry["timestamp"] as string | undefined)
          ?? (entry["analyzedAt"] as string | undefined)
          ?? (entry["createdAt"] as string | undefined)
          ?? new Date().toISOString();
        const summaryValue = (entry[tool.summaryField] as string | undefined) ?? "";

        items.push({
          id,
          toolKey: tool.key,
          toolLabel: tool.label,
          summary: summaryValue.slice(0, 120),
          createdAt: timestamp,
        });
      }
    } catch {
      // Ignore parse errors for individual tools
    }
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const TOOL_COLORS: Record<string, string> = {
  "Prompt Analyzer": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "Code Review": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  "Cost Calculator": "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  "Token Visualizer": "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  "Context Manager": "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
  "Regex Humanizer": "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
  "DTO-Matic": "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  "Cron Builder": "bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200",
  "Tailwind Sorter": "bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200",
  "Variable Name Wizard": "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-200",
  "JSON Formatter": "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
  "Base64": "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  "UUID Generator": "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200",
  "Git Commit Generator": "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  "HTTP Status Finder": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
};

const DEFAULT_COLOR = "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(getInitialHistory);
  const { addToast } = useToast();
  const { t } = useTranslation();

  const toolLabels = useMemo(() => {
    const labels = new Set(history.map((item) => item.toolLabel));
    return Array.from(labels).sort();
  }, [history]);

  const filtered = useMemo(() => {
    let items = history;
    if (toolFilter) {
      items = items.filter((item) => item.toolLabel === toolFilter);
    }
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.summary.toLowerCase().includes(lower) ||
          item.toolLabel.toLowerCase().includes(lower)
      );
    }
    return items;
  }, [history, search, toolFilter]);

  const clearAll = () => {
    for (const tool of TOOL_STORAGE_KEYS) {
      localStorage.removeItem(tool.key);
    }
    setHistory([]);
    addToast(t("history.cleared"), "info");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Clock className="size-8" />
            {t("history.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("history.items", { count: history.length })}
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onPress={clearAll} className="gap-2">
            <Trash2 className="size-4" />
            {t("history.clearAll")}
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="history-search" className="sr-only">Search history</label>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="history-search"
            type="text"
            placeholder={t("history.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {toolLabels.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setToolFilter(null)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                toolFilter === null
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              All
            </button>
            {toolLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setToolFilter(toolFilter === label ? null : label)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  toolFilter === label
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History Items */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item) => {
            const colorClass = TOOL_COLORS[item.toolLabel] ?? DEFAULT_COLOR;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                    {item.toolLabel}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {item.summary || "—"}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-16 text-center">
          <p className="mb-4 text-5xl">📭</p>
          <p className="text-foreground">
            {search || toolFilter ? t("history.noResults") : t("history.noHistory")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || toolFilter
              ? t("history.noResultsHint")
              : t("history.noHistoryHint")}
          </p>
        </Card>
      )}
    </div>
  );
}
