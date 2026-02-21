"use client";

import { useState, useMemo } from "react";
import { Card, Button, SearchField } from "@heroui/react";
import { Trash2, Clock, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

interface HistoryItem {
  id: string;
  toolKey: string;
  toolSlug: string;
  summary: string;
  createdAt: string;
}

const TOOL_STORAGE_KEYS: { key: string; slug: string; summaryField: string }[] = [
  { key: "devflow-analysis-history", slug: "prompt-analyzer", summaryField: "prompt" },
  { key: "devflow-code-review-history", slug: "code-review", summaryField: "code" },
  { key: "devflow-cost-calculator-history", slug: "cost-calculator", summaryField: "model" },
  { key: "devflow-token-visualizer-history", slug: "token-visualizer", summaryField: "text" },
  { key: "devflow-context-manager-history", slug: "context-manager", summaryField: "name" },
  { key: "devflow-regex-humanizer-history", slug: "regex-humanizer", summaryField: "input" },
  { key: "devflow-dto-matic-history", slug: "dto-matic", summaryField: "input" },
  { key: "devflow-cron-builder-history", slug: "cron-builder", summaryField: "expression" },
  { key: "devflow-tailwind-sorter-history", slug: "tailwind-sorter", summaryField: "input" },
  { key: "devflow-variable-name-wizard-history", slug: "variable-name-wizard", summaryField: "input" },
  { key: "devflow-json-formatter-history", slug: "json-formatter", summaryField: "input" },
  { key: "devflow-base64-history", slug: "base64", summaryField: "input" },
  { key: "devflow-uuid-generator-history", slug: "uuid-generator", summaryField: "version" },
  { key: "devflow-git-commit-generator-history", slug: "git-commit-generator", summaryField: "message" },
  { key: "devflow-http-status-finder-history", slug: "http-status-finder", summaryField: "query" },
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
          toolSlug: tool.slug,
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
  "prompt-analyzer": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "code-review": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  "cost-calculator": "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  "token-visualizer": "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  "context-manager": "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
  "regex-humanizer": "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
  "dto-matic": "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  "cron-builder": "bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200",
  "tailwind-sorter": "bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200",
  "variable-name-wizard": "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-200",
  "json-formatter": "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
  "base64": "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  "uuid-generator": "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200",
  "git-commit-generator": "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  "http-status-finder": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
};

const DEFAULT_COLOR = "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(getInitialHistory);
  const { addToast } = useToast();
  const { t } = useTranslation();

  const toolSlugs = useMemo(() => {
    const slugs = new Set(history.map((item) => item.toolSlug));
    return Array.from(slugs).sort((a, b) =>
      t(`tool.${a}.name`).localeCompare(t(`tool.${b}.name`))
    );
  }, [history, t]);

  const filtered = useMemo(() => {
    let items = history;
    if (toolFilter) {
      items = items.filter((item) => item.toolSlug === toolFilter);
    }
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.summary.toLowerCase().includes(lower) ||
          t(`tool.${item.toolSlug}.name`).toLowerCase().includes(lower)
      );
    }
    return items;
  }, [history, search, toolFilter, t]);

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
        <SearchField
          name="history-search"
          value={search}
          onChange={setSearch}
          aria-label={t("history.searchLabel")}
          className="flex-1"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t("history.search")} className="w-full" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {toolSlugs.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <Button
              variant={toolFilter === null ? "primary" : "ghost"}
              size="sm"
              onPress={() => setToolFilter(null)}
            >
              {t("history.filterAll")}
            </Button>
            {toolSlugs.map((slug) => (
              <Button
                key={slug}
                variant={toolFilter === slug ? "primary" : "ghost"}
                size="sm"
                onPress={() => setToolFilter(toolFilter === slug ? null : slug)}
              >
                {t(`tool.${slug}.name`)}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* History Items */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item) => {
            const colorClass = TOOL_COLORS[item.toolSlug] ?? DEFAULT_COLOR;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                    {t(`tool.${item.toolSlug}.name`)}
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
          <Inbox className="mx-auto mb-4 size-12 text-muted-foreground" />
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
