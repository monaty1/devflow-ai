"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "@/components/tools";
import { TOOLS_DATA } from "@/config/tools-data";
import type { ToolCategory } from "@/types/tools";

const CATEGORIES: { label: string; value: ToolCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Analysis", value: "analysis" },
  { label: "Review", value: "review" },
  { label: "Calculation", value: "calculation" },
  { label: "Visualization", value: "visualization" },
  { label: "Management", value: "management" },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

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
          Developer Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse and discover AI-powered tools for your development workflow
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools..."
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
          <p className="text-lg text-muted-foreground">No tools found</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
