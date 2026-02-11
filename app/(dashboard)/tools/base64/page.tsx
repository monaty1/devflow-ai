"use client";

import { Card, Button } from "@heroui/react";
import {
  Binary,
  AlertCircle,
  Sparkles,
  Trash2,
  ArrowRightLeft,
  Lock,
  Unlock,
  Wand2,
  Link2,
} from "lucide-react";
import { useBase64 } from "@/hooks/use-base64";
import { useTranslation } from "@/hooks/use-translation";
import { StatusBadge } from "@/components/shared/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import type { Base64Mode, Base64Variant } from "@/types/base64";

export default function Base64Page() {
  const { t } = useTranslation();

  const MODE_OPTIONS: { id: Base64Mode; label: string; icon: React.ElementType }[] = [
    { id: "encode", label: t("base64.encode"), icon: Lock },
    { id: "decode", label: t("base64.decode"), icon: Unlock },
  ];

  const VARIANT_OPTIONS: { id: Base64Variant; label: string; description: string }[] = [
    { id: "standard", label: t("base64.standard"), description: t("base64.standardDesc") },
    { id: "url-safe", label: t("base64.urlSafe"), description: t("base64.urlSafeDesc") },
  ];

  const {
    input,
    mode,
    config,
    result,
    inputStats,
    inputValidation,
    setInput,
    setMode,
    updateConfig,
    process,
    loadExample,
    reset,
    applyOutput,
    toDataUrl,
  } = useBase64();

  const dataUrl = result?.isValid && mode === "encode" ? toDataUrl("text/plain") : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Binary}
        gradient="from-indigo-500 to-blue-600"
        title={t("base64.title")}
        description={t("base64.description")}
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
              <h2 className="text-lg font-semibold">
                {mode === "encode" ? t("base64.inputEncode") : t("base64.inputDecode")}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => loadExample(mode === "encode" ? "text" : "encoded")}
                >
                  <Wand2 className="mr-1 size-4" />
                  {t("base64.example")}
                </Button>
              </div>
            </div>

            <textarea
              id="base64-input"
              aria-label={mode === "encode" ? t("base64.inputEncode") : t("base64.inputDecode")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? t("base64.placeholderEncode")
                  : t("base64.placeholderDecode")
              }
              rows={10}
              className={`w-full resize-none rounded-lg border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                input && !inputValidation.isValid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-primary"
              }`}
            />

            {input && !inputValidation.isValid && inputValidation.error && (
              <div role="alert" className="mt-2 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="size-4" />
                {inputValidation.error}
              </div>
            )}

            {/* Input Stats */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{t("base64.characters", { count: inputStats.characters })}</span>
              <span>{t("base64.bytes", { count: inputStats.bytes })}</span>
              <span>{t("base64.lines", { count: inputStats.lines })}</span>
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">{t("common.configuration")}</h3>

            <div className="space-y-4">
              {/* Variant Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  {t("base64.variant")}
                </label>
                <div className="flex gap-2">
                  {VARIANT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateConfig("variant", opt.id)}
                      className={`flex flex-col items-start rounded-lg border-2 px-3 py-2 transition-all ${
                        config.variant === opt.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Breaks (only for encode mode) */}
              {mode === "encode" && (
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.lineBreaks}
                      onChange={(e) => updateConfig("lineBreaks", e.target.checked)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm">{t("base64.lineBreaks")}</span>
                  </label>

                  {config.lineBreaks && (
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">
                        {t("base64.lineLength")}
                      </label>
                      <input
                        type="number"
                        value={config.lineLength}
                        onChange={(e) =>
                          updateConfig("lineLength", parseInt(e.target.value, 10) || 76)
                        }
                        min={20}
                        max={200}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                onPress={process}
                isDisabled={!input.trim() || (mode === "decode" && !inputValidation.isValid)}
                className="flex-1"
              >
                <Sparkles className="mr-2 size-4" />
                {mode === "encode" ? t("base64.encode") : t("base64.decode")}
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
            <h2 className="text-lg font-semibold">{t("base64.output")}</h2>
            {result?.output && (
              <Button variant="ghost" size="sm" onPress={applyOutput}>
                <ArrowRightLeft className="mr-1 size-4" />
                {t("base64.swap")}
              </Button>
            )}
          </div>

          {result?.isValid ? (
            <div className="flex flex-1 flex-col">
              {/* Stats */}
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge variant="info">{t("base64.chars", { count: result.stats.outputLength })}</StatusBadge>
                <StatusBadge variant="success">{t("base64.bytes", { count: result.stats.outputBytes })}</StatusBadge>
                <StatusBadge variant="purple">{t("base64.sizeRatio", { ratio: (result.stats.compressionRatio * 100).toFixed(0) })}</StatusBadge>
              </div>

              {/* Output */}
              <div className="relative flex-1">
                <CopyButton text={result.output} className="absolute right-2 top-2 z-10" />
                <pre className="max-h-[300px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm break-all whitespace-pre-wrap">
                  <code>{result.output}</code>
                </pre>
              </div>

              {/* Data URL (encode mode only) */}
              {mode === "encode" && dataUrl && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Link2 className="size-4" />
                      {t("base64.dataUrl")}
                    </span>
                    <CopyButton text={dataUrl} />
                  </div>
                  <pre className="max-h-24 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs break-all">
                    <code>{dataUrl}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : result?.error ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="mb-4 size-12 text-red-500/50" />
              <p className="font-medium text-red-600 dark:text-red-400">{result.error}</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <Binary className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {t("base64.emptyState")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                {t("base64.emptyStateHint")}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
