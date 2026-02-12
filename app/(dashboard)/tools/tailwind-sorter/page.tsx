"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Palette,
  AlertCircle,
  Trash2,
  History,
  RotateCcw,
  ArrowRight,
  Layers,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useTailwindSorter } from "@/hooks/use-tailwind-sorter";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { CATEGORY_LABELS, type OutputFormat } from "@/types/tailwind-sorter";

export default function TailwindSorterPage() {
  const { t } = useTranslation();

  const OUTPUT_FORMATS: { id: OutputFormat; label: string; description: string }[] = [
    { id: "single-line", label: t("tailwind.singleLine"), description: t("tailwind.singleLineDesc") },
    { id: "multi-line", label: t("tailwind.multiLine"), description: t("tailwind.multiLineDesc") },
    { id: "grouped", label: t("tailwind.grouped"), description: t("tailwind.groupedDesc") },
  ];
  const {
    input,
    config,
    result,
    history,
    inputStats,
    setInput,
    updateConfig,
    setOutputFormat,
    sort,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    applyToInput,
  } = useTailwindSorter();

  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Palette}
        gradient="from-sky-500 to-cyan-600"
        title={t("tailwind.title")}
        description={t("tailwind.description")}
      />

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onPress={() => loadExample("clean")}>
              <FileText className="mr-1 size-4" />
              {t("tailwind.cleanExample")}
            </Button>
            <Button variant="outline" size="sm" onPress={() => loadExample("messy")}>
              <FileText className="mr-1 size-4" />
              {t("tailwind.messyExample")}
            </Button>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("tailwind.format")}</span>
            {OUTPUT_FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setOutputFormat(format.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  config.outputFormat === format.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
                title={format.description}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("tailwind.inputClasses")}</h2>
              <div className="flex gap-2">
                <CopyButton text={input} label={t("common.copy")} isDisabled={!input} />
                <Button variant="ghost" size="sm" onPress={reset} isDisabled={!input}>
                  <RotateCcw className="mr-1 size-4" />
                  {t("common.clear")}
                </Button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your Tailwind classes here...&#10;&#10;Example: flex p-4 bg-blue-500 text-white hover:bg-blue-600 mt-4 rounded-lg"
              className="min-h-[200px] w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Input Stats */}
            {input.trim() && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                  <Layers className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("tailwind.classes", { count: inputStats.classCount })}
                  </span>
                </div>
                {inputStats.duplicates.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-amber-600">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">
                      {t("tailwind.duplicates", { count: inputStats.duplicates.length })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Config Options */}
            <div className="mt-4 space-y-3 rounded-lg border border-border p-4">
              <h4 className="text-sm font-medium">{t("common.options")}</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.removeDuplicates}
                    onChange={(e) => updateConfig("removeDuplicates", e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  <span className="text-sm">{t("tailwind.removeDuplicates")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.groupByCategory}
                    onChange={(e) => updateConfig("groupByCategory", e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  <span className="text-sm">{t("tailwind.groupByCategory")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.preserveVariants}
                    onChange={(e) => updateConfig("preserveVariants", e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  <span className="text-sm">{t("tailwind.sortVariants")}</span>
                </label>
              </div>
            </div>

            {/* Sort Button */}
            <div className="mt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onPress={sort}
                isDisabled={!inputStats.isValid}
              >
                <ArrowRight className="mr-2 size-5" />
                {t("tailwind.sortClasses")}
              </Button>
            </div>

            {/* History Toggle */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowHistory(!showHistory)}
              >
                <History className="mr-1 size-4" />
                {t("common.history", { count: history.length })}
              </Button>
            </div>
          </Card>

          {/* History */}
          {showHistory && history.length > 0 && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t("common.recentHistory")}</h4>
                <Button variant="ghost" size="sm" onPress={clearHistory}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-2 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="block truncate text-sm font-medium">{item.input}</code>
                      <p className="text-xs text-muted-foreground">
                        {t("tailwind.classes", { count: item.classCount })}
                      </p>
                    </div>
                    <ChevronRight className="ml-2 size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("tailwind.sortedResult")}</h2>
              <div className="flex gap-2">
                <CopyButton getText={() => result?.output ?? ""} label={t("common.copy")} isDisabled={!result} />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={applyToInput}
                  isDisabled={!result}
                >
                  <ArrowRight className="mr-1 size-4" />
                  {t("common.apply")}
                </Button>
              </div>
            </div>

            {result ? (
              <>
                <pre className="min-h-[200px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm">
                  {result.output}
                </pre>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {result.stats.totalClasses}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("tailwind.total")}</p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.stats.uniqueClasses}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("tailwind.unique")}</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {result.stats.duplicatesRemoved}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("tailwind.removed")}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
                <Palette className="mb-2 size-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  {t("tailwind.emptyState")}
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {t("tailwind.emptyStateHint")}
                </p>
              </div>
            )}
          </Card>

          {/* Groups Breakdown */}
          {result && result.groups.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-semibold">{t("tailwind.breakdown")}</h3>
              <div className="space-y-3">
                {result.groups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">
                        {CATEGORY_LABELS[group.id as keyof typeof CATEGORY_LABELS] || group.name}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {group.classes.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.classes.map((cls, i) => (
                        <code
                          key={i}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs"
                        >
                          {cls}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Category Reference */}
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold">{t("tailwind.categoryOrder")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(CATEGORY_LABELS).slice(0, 12).map(([id, label], index) => (
                <div key={id} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
