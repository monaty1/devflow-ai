"use client";

import { Card, Button } from "@heroui/react";
import {
  FileJson,
  AlertCircle,
  Sparkles,
  Trash2,
  Code2,
  FileCode,
  FolderTree,
  Wand2,
} from "lucide-react";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import type { GenerationMode, NamingConvention } from "@/types/dto-matic";

const NAMING_OPTIONS: { id: NamingConvention; label: string }[] = [
  { id: "camelCase", label: "camelCase" },
  { id: "PascalCase", label: "PascalCase" },
  { id: "snake_case", label: "snake_case" },
];

export default function DtoMaticPage() {
  const { t } = useTranslation();

  const MODE_OPTIONS: { id: GenerationMode; label: string; description: string }[] = [
    { id: "quick", label: "Quick", description: t("dtoMatic.modeQuickDesc") },
    { id: "clean-arch", label: "Clean Arch", description: t("dtoMatic.modeCleanArchDesc") },
    { id: "zod", label: "Zod", description: t("dtoMatic.modeZodDesc") },
  ];

  const {
    jsonInput,
    config,
    result,
    selectedFile,
    selectedFileId,
    isGenerating,
    error,
    setJsonInput,
    setSelectedFileId,
    updateConfig,
    setMode,
    generate,
    formatInput,
    loadExample,
    reset,
    isValidJson,
  } = useDtoMatic();

  const isJsonValid = !jsonInput.trim() || isValidJson(jsonInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={FileJson}
        gradient="from-green-500 to-emerald-600"
        title={t("dtoMatic.title")}
        description={t("dtoMatic.description")}
        breadcrumb
      />

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-3">
        {MODE_OPTIONS.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setMode(mode.id)}
            className={`flex flex-col items-start rounded-lg border-2 px-4 py-3 transition-all ${
              config.mode === mode.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="font-medium text-foreground">{mode.label}</span>
            <span className="text-xs text-muted-foreground">{mode.description}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("dtoMatic.inputJson")}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={loadExample}>
                  <Wand2 className="mr-1 size-4" />
                  {t("dtoMatic.example")}
                </Button>
                <Button variant="ghost" size="sm" onPress={formatInput}>
                  <Code2 className="mr-1 size-4" />
                  {t("dtoMatic.format")}
                </Button>
              </div>
            </div>

            <textarea
              id="dto-json-input"
              aria-label={t("dtoMatic.jsonInputLabel")}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={t("dtoMatic.jsonPlaceholder")}
              rows={12}
              className={`w-full resize-none rounded-lg border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                !isJsonValid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-primary"
              }`}
            />

            {!isJsonValid && (
              <div role="alert" className="mt-2 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="size-4" />
                {t("dtoMatic.invalidJson")}
              </div>
            )}

            {error && (
              <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">{t("common.configuration")}</h3>

            <div className="space-y-4">
              {/* Root Name */}
              <div>
                <label htmlFor="dto-root-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                  {t("dtoMatic.rootTypeName")}
                </label>
                <input
                  id="dto-root-name"
                  type="text"
                  value={config.rootName}
                  onChange={(e) => updateConfig("rootName", e.target.value)}
                  placeholder={t("dtoMatic.rootPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Naming Convention */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  {t("dtoMatic.namingConvention")}
                </label>
                <div className="flex gap-2">
                  {NAMING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateConfig("naming", opt.id)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        config.naming === opt.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.optionalFields}
                    onChange={(e) => updateConfig("optionalFields", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{t("dtoMatic.optionalFields")}</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.detectDates}
                    onChange={(e) => updateConfig("detectDates", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{t("dtoMatic.detectDates")}</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.exportTypes}
                    onChange={(e) => updateConfig("exportTypes", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{t("dtoMatic.exportTypes")}</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.readonlyEntities}
                    onChange={(e) => updateConfig("readonlyEntities", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{t("dtoMatic.readonlyEntities")}</span>
                </label>

                {config.mode === "clean-arch" && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.generateMappers}
                      onChange={(e) => updateConfig("generateMappers", e.target.checked)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm">{t("dtoMatic.generateMappers")}</span>
                  </label>
                )}

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.generateZod}
                    onChange={(e) => updateConfig("generateZod", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{t("dtoMatic.generateZod")}</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                onPress={generate}
                isPending={isGenerating}
                className="flex-1"
              >
                <Sparkles className="mr-2 size-4" />
                {t("dtoMatic.generateCode")}
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
            <h2 className="text-lg font-semibold">{t("dtoMatic.generatedCode")}</h2>
            {result && (
              <CopyButton
                getText={() => result.files.map((f) => `// === ${f.name} ===\n\n${f.content}`).join("\n\n")}
                label={t("dtoMatic.copyAll")}
              />
            )}
          </div>

          {result ? (
            <div className="flex flex-1 flex-col">
              {/* Stats */}
              <div className="mb-4 flex flex-wrap gap-2">
                <StatusBadge variant="success">{t("dtoMatic.types", { count: result.stats.totalTypes })}</StatusBadge>
                {result.stats.nestedObjects > 0 && (
                  <StatusBadge variant="info">{t("dtoMatic.nested", { count: result.stats.nestedObjects })}</StatusBadge>
                )}
                {result.stats.arrays > 0 && (
                  <StatusBadge variant="purple">{t("dtoMatic.arrays", { count: result.stats.arrays })}</StatusBadge>
                )}
                {result.stats.dateFields > 0 && (
                  <StatusBadge variant="warning">{t("dtoMatic.dates", { count: result.stats.dateFields })}</StatusBadge>
                )}
              </div>

              {/* File Tabs */}
              <div className="mb-3 flex flex-wrap gap-2 border-b border-border pb-3">
                {result.files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedFileId(file.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedFileId === file.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <FileCode className="size-3.5" />
                    {file.name}
                  </button>
                ))}
              </div>

              {/* Code Display */}
              {selectedFile && (
                <div className="relative flex-1">
                  <CopyButton text={selectedFile.content} className="absolute right-2 top-2 z-10" />
                  <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <FolderTree className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {t("dtoMatic.emptyState")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                {t("dtoMatic.emptyStateHint")}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
