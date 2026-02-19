"use client";

import { useState, useMemo } from "react";
import NextLink from "next/link";
import {
  Search,
  ExternalLink,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { TOOLS_DATA } from "@/config/tools-data";
import { TOOL_ICON_MAP } from "@/config/tool-icon-map";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { cn, getToolGlowClass } from "@/lib/utils";
import type { ToolCategory } from "@/types/tools";

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  analysis: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  review: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  calculation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  visualization: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  management: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  generation: "bg-green-500/10 text-green-600 dark:text-green-400",
  formatting: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  const CATEGORIES: { label: string; value: ToolCategory | "all" }[] = [
    { label: t("common.all"), value: "all" },
    { label: t("tools.analysis"), value: "analysis" },
    { label: t("tools.review"), value: "review" },
    { label: t("tools.calculation"), value: "calculation" },
    { label: t("tools.visualization"), value: "visualization" },
    { label: t("tools.management"), value: "management" },
    { label: t("tools.generation"), value: "generation" },
    { label: t("tools.formatting"), value: "formatting" },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const q = search.toLowerCase();
      const translatedName = t(`tool.${tool.slug}.name`).toLowerCase();
      const translatedDesc = t(`tool.${tool.slug}.description`).toLowerCase();
      const translatedLong = t(`tool.${tool.slug}.longDescription`).toLowerCase();
      const matchesSearch =
        translatedName.includes(q) ||
        translatedDesc.includes(q) ||
        translatedLong.includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category, t]);

  return (
    <div className="space-y-8">
      <ToolHeader
        title={t("docs.title")}
        description={t("docs.subtitle")}
      />

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("docs.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool count */}
      <p className="text-sm text-muted-foreground">
        {t("docs.showing", { count: String(filteredTools.length), total: String(TOOLS_DATA.length) })}
      </p>

      {/* Tool Documentation Cards */}
      <div className="space-y-6">
        {filteredTools.map((tool) => {
          const IconComponent = TOOL_ICON_MAP[tool.icon];
          return (
            <article
              key={tool.id}
              id={tool.slug}
              className={cn("overflow-hidden rounded-xl border bg-card transition-all", getToolGlowClass(tool.color))}
            >
              {/* Header */}
              <div className={cn("bg-gradient-to-r p-6", tool.color)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {IconComponent && (
                      <div className="rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                        <IconComponent className="size-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t(`tool.${tool.slug}.name`)}
                      </h2>
                      <p className="mt-0.5 text-sm text-white/80">
                        {t(`tool.${tool.slug}.description`)}
                      </p>
                    </div>
                  </div>
                  <NextLink
                    href={`/tools/${tool.slug}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    {t("docs.openTool")}
                    <ExternalLink className="size-3.5" />
                  </NextLink>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-4 p-6">
                {/* Long Description */}
                <p className="leading-relaxed text-foreground/90">
                  {t(`tool.${tool.slug}.longDescription`)}
                </p>

                {/* Features */}
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-primary" />
                    {t("common.features")}
                  </h3>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {tool.features.map((_, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
                        {t(`tool.${tool.slug}.feature.${String(idx)}`)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags + Category */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      CATEGORY_COLORS[tool.category]
                    )}
                  >
                    {t(`tools.${tool.category}`)}
                  </span>
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      <Tag className="size-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("docs.noResults")}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t("docs.noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
