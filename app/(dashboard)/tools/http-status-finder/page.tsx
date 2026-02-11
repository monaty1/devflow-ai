"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Globe,
  Search,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useHttpStatusFinder } from "@/hooks/use-http-status-finder";
import { getCategoryInfo } from "@/lib/application/http-status-finder";
import type { HttpStatusCategory, HttpStatusCode } from "@/types/http-status-finder";

const CATEGORY_TABS: { id: HttpStatusCategory | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "1xx", label: "1xx" },
  { id: "2xx", label: "2xx" },
  { id: "3xx", label: "3xx" },
  { id: "4xx", label: "4xx" },
  { id: "5xx", label: "5xx" },
];

const CATEGORY_COLORS: Record<HttpStatusCategory, string> = {
  "1xx": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "2xx": "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  "3xx": "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
  "4xx": "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  "5xx": "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
};

function StatusCodeCard({
  status,
  onCopy,
  copied,
  onSelect,
}: {
  status: HttpStatusCode;
  onCopy: (text: string, id: string) => void;
  copied: string | null;
  onSelect: (code: HttpStatusCode) => void;
}) {
  const colorClass = CATEGORY_COLORS[status.category];
  const copyId = `code-${status.code}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(status)}
      className="w-full text-left"
    >
    <Card
      className="cursor-pointer p-4 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-2.5 py-1 font-mono text-lg font-bold ${colorClass}`}>
            {status.code}
          </span>
          <div>
            <h3 className="font-semibold">{status.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{status.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(`${status.code} ${status.name}`, copyId);
          }}
          className="shrink-0"
          aria-label="Copy to clipboard"
        >
          {copied === copyId ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </Card>
    </button>
  );
}

export default function HttpStatusFinderPage() {
  const {
    query,
    categoryFilter,
    results,
    commonCodes,
    selectedCode,
    setQuery,
    setCategoryFilter,
    setSelectedCode,
    clearSearch,
    copyToClipboard,
  } = useHttpStatusFinder();

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayCodes = query.trim() || categoryFilter ? results.codes : commonCodes;
  const activeCategory = categoryFilter ?? "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Globe className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HTTP Status Finder
            </h1>
            <p className="text-sm text-muted-foreground">
              Busca y aprende sobre códigos de estado HTTP
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <label htmlFor="http-status-search" className="sr-only">Search HTTP status codes</label>
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="http-status-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código (404) o nombre (not found)..."
            className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id === "all" ? null : (tab.id as HttpStatusCategory))}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {tab.label}
                {tab.id !== "all" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {getCategoryInfo(tab.id as HttpStatusCategory).label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Code Detail */}
      {selectedCode && (
        <Card className="border-2 border-primary/30 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-3 py-1.5 font-mono text-2xl font-bold ${CATEGORY_COLORS[selectedCode.category]}`}>
                {selectedCode.code}
              </span>
              <div>
                <h2 className="text-xl font-bold">{selectedCode.name}</h2>
                <span className="text-xs text-muted-foreground">
                  {getCategoryInfo(selectedCode.category).label}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onPress={() => setSelectedCode(null)}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">Descripción</span>
              <p className="mt-1 text-sm">{selectedCode.description}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">Cuándo usar</span>
              <p className="mt-1 text-sm">{selectedCode.whenToUse}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-4 py-3 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Ejemplo</span>
              <p className="mt-1 font-mono text-sm">{selectedCode.example}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {query.trim() || categoryFilter
              ? `${displayCodes.length} resultado${displayCodes.length !== 1 ? "s" : ""}`
              : "Códigos más comunes"}
          </h2>
        </div>

        {displayCodes.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayCodes.map((status) => (
              <StatusCodeCard
                key={status.code}
                status={status}
                onCopy={handleCopy}
                copied={copied}
                onSelect={setSelectedCode}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Globe className="mx-auto mb-4 size-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              No se encontraron códigos para &ldquo;{query}&rdquo;
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Intenta con un número (404) o una palabra clave (not found)
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
