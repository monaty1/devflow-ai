"use client";

import { useState, useMemo } from "react";
import { SearchField } from "@heroui/react";
import { ToolCard } from "@/components/tools";
import { MagicInput } from "@/components/tools/magic-input";
import { TOOLS_DATA } from "@/config/tools-data";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { Button } from "@/components/ui";
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
      const q = search.toLowerCase();
      const translatedName = t(`tool.${tool.slug}.name`).toLowerCase();
      const translatedDesc = t(`tool.${tool.slug}.description`).toLowerCase();
      const matchesSearch =
        translatedName.includes(q) ||
        translatedDesc.includes(q);
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category, t]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <ToolHeader
        title={t("tools.title")}
        description={t("tools.subtitle")}
      />

      {/* Magic Input */}
      <div className="mx-auto max-w-2xl">
        <MagicInput />
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="max-w-md">
          <SearchField
            value={search}
            onChange={setSearch}
            aria-label={t("tools.search")}
          >
            <SearchField.Input placeholder={t("tools.search")} />
          </SearchField>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("tools.filterByCategory")}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={category === cat.value ? "primary" : "ghost"}
              onPress={() => setCategory(cat.value)}
              className="rounded-full"
            >
              {cat.label}
            </Button>
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
