"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Braces,
  AlertCircle,
  Sparkles,
  Trash2,
  Minimize2,
  CheckCircle,
  FileCode,
  ArrowRightLeft,
  List,
  Wand2,
} from "lucide-react";
import { useJsonFormatter } from "@/hooks/use-json-formatter";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import type { JsonFormatMode } from "@/types/json-formatter";

export default function JsonFormatterPage() {
  const { t } = useTranslation();

  const MODE_OPTIONS: { id: JsonFormatMode; label: string; icon: React.ElementType }[] = [
    { id: "format", label: t("jsonFmt.modeFormat"), icon: Braces },
    { id: "minify", label: t("jsonFmt.modeMinify"), icon: Minimize2 },
    { id: "validate", label: t("jsonFmt.modeValidate"), icon: CheckCircle },
  ];
  const {
    input,
    mode,
    config,
    result,
    compareInput,
    inputStats,
    inputValidation,
    setInput,
    setMode,
    setCompareInput,
    updateConfig,
    process,
    getPaths,
    toTypeScript,
    compare,
    loadExample,
    reset,
    applyOutput,
  } = useJsonFormatter();

  const [activeTab, setActiveTab] = useState<"output" | "paths" | "typescript" | "compare">("output");

  const paths = inputValidation.isValid ? getPaths() : [];
  const tsOutput = inputValidation.isValid ? toTypeScript("Root") : "";
  const isEqual = activeTab === "compare" && compareInput ? compare() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Braces}
        gradient="from-yellow-500 to-amber-600"
        title={t("jsonFmt.title")}
        description={t("jsonFmt.description")}
        breadcrumb
      />

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-3">
        {MODE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMode(opt.id)}
            aria-current={mode === opt.id ? "true" : undefined}
            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all ${
              mode === opt.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <opt.icon className="size-4" />
            <span className="font-medium">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="json-input" className="text-lg font-semibold">{t("jsonFmt.inputJson")}</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={() => loadExample("simple")}>
                  <Wand2 className="mr-1 size-4" />
                  {t("jsonFmt.simple")}
                </Button>
                <Button variant="ghost" size="sm" onPress={() => loadExample("complex")}>
                  <Wand2 className="mr-1 size-4" />
                  {t("jsonFmt.complex")}
                </Button>
              </div>
            </div>

            <textarea
              id="json-input"
              aria-invalid={input ? !inputValidation.isValid : undefined}
              aria-describedby={input && !inputValidation.isValid ? "json-input-error" : undefined}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("jsonFmt.jsonPlaceholder")}
              rows={14}
              className={`w-full resize-none rounded-lg border bg-background px-4 py-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                input && !inputValidation.isValid
                  ? "border-red-500 focus-visible:border-red-500"
                  : "border-border focus-visible:border-primary"
              }`}
            />

            {input && !inputValidation.isValid && inputValidation.error && (
              <div id="json-input-error" role="alert" className="mt-2 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="size-4" />
                {t("jsonFmt.syntaxError", { line: inputValidation.error.line, col: inputValidation.error.column })}{" "}
                {inputValidation.error.message}
              </div>
            )}

            {/* Input Stats */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{t("common.characters", { count: inputStats.characters })}</span>
              <span>{t("common.lines", { count: inputStats.lines })}</span>
              {inputStats.isValid && <span className="text-green-600">{t("jsonFmt.validJson")}</span>}
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">{t("common.configuration")}</h3>

            <div className="space-y-4">
              {/* Indent Size */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  {t("jsonFmt.indentSize")}
                </label>
                <div className="flex gap-2">
                  {[2, 4].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateConfig("indentSize", size as 2 | 4)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                        config.indentSize === size
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t("jsonFmt.spaces", { size })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Keys */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.sortKeys}
                  onChange={(e) => updateConfig("sortKeys", e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{t("jsonFmt.sortKeys")}</span>
              </label>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                onPress={process}
                isDisabled={!inputValidation.isValid}
                className="flex-1"
              >
                <Sparkles className="mr-2 size-4" />
                {mode === "format" ? t("jsonFmt.modeFormat") : mode === "minify" ? t("jsonFmt.modeMinify") : t("jsonFmt.modeValidate")}
              </Button>
              <Button variant="outline" onPress={reset}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Output Panel */}
        <Card className="flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("jsonFmt.output")}</h2>
            {result?.output && (
              <Button
                variant="ghost"
                size="sm"
                onPress={applyOutput}
              >
                <ArrowRightLeft className="mr-1 size-4" />
                {t("jsonFmt.applyToInput")}
              </Button>
            )}
          </div>

          {/* Output Tabs */}
          <div className="mb-3 flex flex-wrap gap-2 border-b border-border pb-3">
            {[
              { id: "output", label: t("jsonFmt.tabResult"), icon: Braces },
              { id: "paths", label: t("jsonFmt.tabPaths"), icon: List },
              { id: "typescript", label: t("jsonFmt.tabTypeScript"), icon: FileCode },
              { id: "compare", label: t("jsonFmt.tabCompare"), icon: ArrowRightLeft },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "output" && (
              <>
                {result ? (
                  <div className="relative">
                    {/* Stats */}
                    {result.isValid && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        <StatusBadge variant="info">{t("jsonFmt.keys", { count: result.stats.keys })}</StatusBadge>
                        <StatusBadge variant="success">{t("jsonFmt.depth", { count: result.stats.depth })}</StatusBadge>
                        <StatusBadge variant="purple">{t("jsonFmt.bytes", { count: result.stats.sizeBytes })}</StatusBadge>
                        {result.stats.arrays > 0 && (
                          <StatusBadge variant="warning">{t("jsonFmt.arrays", { count: result.stats.arrays })}</StatusBadge>
                        )}
                      </div>
                    )}

                    <CopyButton text={result.output} className="absolute right-2 top-2 z-10" />
                    <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                      <code>{result.output || t("jsonFmt.validJson")}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Braces className="mb-4 size-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      {t("jsonFmt.emptyState")}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "paths" && (
              <div className="relative">
                {paths.length > 0 ? (
                  <>
                    <CopyButton getText={() => paths.map(p => p.path).join("\n")} className="absolute right-2 top-2 z-10" />
                    <div className="max-h-[400px] overflow-auto rounded-lg bg-muted/50 p-4">
                      {paths.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 py-1 font-mono text-sm">
                          <span className="text-blue-600 dark:text-blue-400">{p.path}</span>
                          <span className="text-muted-foreground">:</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.type}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <List className="mb-4 size-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      {t("jsonFmt.pathsEmpty")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "typescript" && (
              <div className="relative">
                {tsOutput ? (
                  <>
                    <CopyButton text={tsOutput} className="absolute right-2 top-2 z-10" />
                    <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                      <code>{tsOutput}</code>
                    </pre>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileCode className="mb-4 size-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      {t("jsonFmt.tsEmpty")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "compare" && (
              <div className="space-y-4">
                <label htmlFor="json-compare" className="block text-sm font-medium text-muted-foreground">
                  {t("jsonFmt.compareLabel")}
                </label>
                <textarea
                  id="json-compare"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                  placeholder={t("jsonFmt.comparePlaceholder")}
                  rows={8}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {compareInput && input && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 ${
                    isEqual
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                    {isEqual ? (
                      <>
                        <CheckCircle className="size-5" />
                        <span className="font-medium">{t("jsonFmt.jsonEqual")}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-5" />
                        <span className="font-medium">{t("jsonFmt.jsonDifferent")}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
