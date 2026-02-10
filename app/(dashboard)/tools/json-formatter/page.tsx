"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Braces,
  Copy,
  Check,
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
import type { JsonFormatMode } from "@/types/json-formatter";

const MODE_OPTIONS: { id: JsonFormatMode; label: string; icon: React.ElementType }[] = [
  { id: "format", label: "Format", icon: Braces },
  { id: "minify", label: "Minify", icon: Minimize2 },
  { id: "validate", label: "Validate", icon: CheckCircle },
];

export default function JsonFormatterPage() {
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
    copyToClipboard,
    applyOutput,
  } = useJsonFormatter();

  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "paths" | "typescript" | "compare">("output");

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const paths = inputValidation.isValid ? getPaths() : [];
  const tsOutput = inputValidation.isValid ? toTypeScript("Root") : "";
  const isEqual = activeTab === "compare" && compareInput ? compare() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
            <Braces className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JSON Formatter
            </h1>
            <p className="text-sm text-muted-foreground">
              Format, minify, validate, and transform JSON instantly
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
              <h2 className="text-lg font-semibold">Input JSON</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={() => loadExample("simple")}>
                  <Wand2 className="mr-1 size-4" />
                  Simple
                </Button>
                <Button variant="ghost" size="sm" onPress={() => loadExample("complex")}>
                  <Wand2 className="mr-1 size-4" />
                  Complex
                </Button>
              </div>
            </div>

            <textarea
              id="json-input"
              aria-label="JSON input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "John", "age": 30, "email": "john@example.com"}'
              rows={14}
              className={`w-full resize-none rounded-lg border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                input && !inputValidation.isValid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-primary"
              }`}
            />

            {input && !inputValidation.isValid && inputValidation.error && (
              <div role="alert" className="mt-2 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="size-4" />
                Line {inputValidation.error.line}, Col {inputValidation.error.column}:{" "}
                {inputValidation.error.message}
              </div>
            )}

            {/* Input Stats */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{inputStats.characters} characters</span>
              <span>{inputStats.lines} lines</span>
              {inputStats.isValid && <span className="text-green-600">Valid JSON</span>}
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Configuration</h3>

            <div className="space-y-4">
              {/* Indent Size */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Indent size
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
                      {size} spaces
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
                <span className="text-sm">Sort keys alphabetically</span>
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
                {mode === "format" ? "Format" : mode === "minify" ? "Minify" : "Validate"}
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
              <Button
                variant="ghost"
                size="sm"
                onPress={applyOutput}
              >
                <ArrowRightLeft className="mr-1 size-4" />
                Apply to Input
              </Button>
            )}
          </div>

          {/* Output Tabs */}
          <div className="mb-3 flex flex-wrap gap-2 border-b border-border pb-3">
            {[
              { id: "output", label: "Result", icon: Braces },
              { id: "paths", label: "Paths", icon: List },
              { id: "typescript", label: "TypeScript", icon: FileCode },
              { id: "compare", label: "Compare", icon: ArrowRightLeft },
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
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                          {result.stats.keys} keys
                        </span>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900 dark:bg-green-900/30 dark:text-green-200">
                          depth {result.stats.depth}
                        </span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-900 dark:bg-purple-900/30 dark:text-purple-200">
                          {result.stats.sizeBytes} bytes
                        </span>
                        {result.stats.arrays > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                            {result.stats.arrays} arrays
                          </span>
                        )}
                      </div>
                    )}

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
                    <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                      <code>{result.output || "Valid JSON"}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Braces className="mb-4 size-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      Paste JSON and click Format, Minify, or Validate
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "paths" && (
              <div className="relative">
                {paths.length > 0 ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => handleCopy(paths.map(p => p.path).join("\n"), "paths")}
                      className="absolute right-2 top-2 z-10"
                    >
                      {copied === "paths" ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
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
                      Enter valid JSON to extract paths
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "typescript" && (
              <div className="relative">
                {tsOutput ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => handleCopy(tsOutput, "typescript")}
                      className="absolute right-2 top-2 z-10"
                    >
                      {copied === "typescript" ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                    <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                      <code>{tsOutput}</code>
                    </pre>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileCode className="mb-4 size-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      Enter valid JSON to generate TypeScript interface
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "compare" && (
              <div className="space-y-4">
                <textarea
                  aria-label="Second JSON to compare"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                  placeholder="Paste second JSON to compare..."
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
                        <span className="font-medium">JSON documents are equal</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-5" />
                        <span className="font-medium">JSON documents are different</span>
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
