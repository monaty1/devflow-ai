"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "@/components/tools";
import { TOOLS_DATA } from "@/config/tools-data";
import { useTranslation } from "@/hooks/use-translation";
import type { ToolCategory } from "@/types/tools";

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  const CATEGORIES: { label: string; value: ToolCategory | "all" }[] = [
    { label: t("tools.all"), value: "all" },
    { label: t("tools.analysis"), value: "analysis" },
    { label: t("tools.review"), value: "review" },
    { label: t("tools.calculation"), value: "calculation" },
    { label: t("tools.visualization"), value: "visualization" },
    { label: t("tools.management"), value: "management" },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("tools.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("tools.subtitle")}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("tools.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("tools.noResults")}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t("tools.noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
