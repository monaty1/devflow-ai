"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Binary,
  Copy,
  Check,
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
import type { Base64Mode, Base64Variant } from "@/types/base64";

const MODE_OPTIONS: { id: Base64Mode; label: string; icon: React.ElementType }[] = [
  { id: "encode", label: "Encode", icon: Lock },
  { id: "decode", label: "Decode", icon: Unlock },
];

const VARIANT_OPTIONS: { id: Base64Variant; label: string; description: string }[] = [
  { id: "standard", label: "Standard", description: "RFC 4648 with +/=" },
  { id: "url-safe", label: "URL-Safe", description: "RFC 4648 with -_" },
];

export default function Base64Page() {
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
    copyToClipboard,
    applyOutput,
    toDataUrl,
  } = useBase64();

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const dataUrl = result?.isValid && mode === "encode" ? toDataUrl("text/plain") : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
            <Binary className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Base64 Encoder/Decoder
            </h1>
            <p className="text-sm text-muted-foreground">
              Encode and decode Base64 with URL-safe variant support
            </p>
          </div>
        </div>
      </div>

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
                {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => loadExample(mode === "encode" ? "text" : "encoded")}
                >
                  <Wand2 className="mr-1 size-4" />
                  Example
                </Button>
              </div>
            </div>

            <textarea
              id="base64-input"
              aria-label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Paste Base64 to decode..."
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
              <span>{inputStats.characters} characters</span>
              <span>{inputStats.bytes} bytes</span>
              <span>{inputStats.lines} lines</span>
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Configuration</h3>

            <div className="space-y-4">
              {/* Variant Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Base64 Variant
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
                    <span className="text-sm">Add line breaks</span>
                  </label>

                  {config.lineBreaks && (
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">
                        Line length
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
                {mode === "encode" ? "Encode" : "Decode"}
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
            <h2 className="text-lg font-semibold">Output</h2>
            {result?.output && (
              <Button variant="ghost" size="sm" onPress={applyOutput}>
                <ArrowRightLeft className="mr-1 size-4" />
                Swap
              </Button>
            )}
          </div>

          {result?.isValid ? (
            <div className="flex flex-1 flex-col">
              {/* Stats */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                  {result.stats.outputLength} chars
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900 dark:bg-green-900/30 dark:text-green-200">
                  {result.stats.outputBytes} bytes
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-900 dark:bg-purple-900/30 dark:text-purple-200">
                  {(result.stats.compressionRatio * 100).toFixed(0)}% size ratio
                </span>
              </div>

              {/* Output */}
              <div className="relative flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleCopy(result.output, "output")}
                  className="absolute right-2 top-2 z-10"
                  aria-label="Copy to clipboard"
                >
                  {copied === "output" ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
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
                      Data URL
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => handleCopy(dataUrl, "dataurl")}
                    >
                      {copied === "dataurl" ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
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
                {mode === "encode"
                  ? "Enter text and click Encode"
                  : "Paste Base64 and click Decode"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                Supports Unicode, URL-safe variant, and data URLs
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
