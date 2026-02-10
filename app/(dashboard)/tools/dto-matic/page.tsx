"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  FileJson,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Download,
  Trash2,
  Code2,
  FileCode,
  FolderTree,
  Wand2,
} from "lucide-react";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import type { GenerationMode, NamingConvention } from "@/types/dto-matic";

const MODE_OPTIONS: { id: GenerationMode; label: string; description: string }[] = [
  {
    id: "quick",
    label: "Quick",
    description: "Interface DTO only",
  },
  {
    id: "clean-arch",
    label: "Clean Arch",
    description: "DTO + Entity + Mapper",
  },
  {
    id: "zod",
    label: "Zod",
    description: "Validation schema",
  },
];

const NAMING_OPTIONS: { id: NamingConvention; label: string }[] = [
  { id: "camelCase", label: "camelCase" },
  { id: "PascalCase", label: "PascalCase" },
  { id: "snake_case", label: "snake_case" },
];

export default function DtoMaticPage() {
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
    copyToClipboard,
    copyAllFiles,
    isValidJson,
  } = useDtoMatic();

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    await copyAllFiles();
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const isJsonValid = !jsonInput.trim() || isValidJson(jsonInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <FileJson className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              DTO-Matic
            </h1>
            <p className="text-sm text-muted-foreground">
              JSON to TypeScript: Interface + Entity + Mapper in seconds
            </p>
          </div>
        </div>
      </div>

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
              <h2 className="text-lg font-semibold">Input JSON</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={loadExample}>
                  <Wand2 className="mr-1 size-4" />
                  Example
                </Button>
                <Button variant="ghost" size="sm" onPress={formatInput}>
                  <Code2 className="mr-1 size-4" />
                  Format
                </Button>
              </div>
            </div>

            <textarea
              id="dto-json-input"
              aria-label="JSON input for DTO generation"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"id": 1, "name": "John Doe", "email": "john@example.com"}'
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
                Invalid JSON. Check the syntax.
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
            <h3 className="mb-4 font-semibold">Configuration</h3>

            <div className="space-y-4">
              {/* Root Name */}
              <div>
                <label htmlFor="dto-root-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                  Root type name
                </label>
                <input
                  id="dto-root-name"
                  type="text"
                  value={config.rootName}
                  onChange={(e) => updateConfig("rootName", e.target.value)}
                  placeholder="User, Product, Response..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Naming Convention */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Naming convention
                </label>
                <div className="flex gap-2">
                  {NAMING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateConfig("naming", opt.id)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        config.naming === opt.id
                          ? "bg-primary text-white"
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
                  <span className="text-sm">Optional fields</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.detectDates}
                    onChange={(e) => updateConfig("detectDates", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Detect dates</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.exportTypes}
                    onChange={(e) => updateConfig("exportTypes", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Export types</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.readonlyEntities}
                    onChange={(e) => updateConfig("readonlyEntities", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Readonly entities</span>
                </label>

                {config.mode === "clean-arch" && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.generateMappers}
                      onChange={(e) => updateConfig("generateMappers", e.target.checked)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm">Generate Mappers</span>
                  </label>
                )}

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.generateZod}
                    onChange={(e) => updateConfig("generateZod", e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Generate Zod</span>
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
                Generate Code
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
            <h2 className="text-lg font-semibold">Generated Code</h2>
            {result && (
              <Button
                variant="ghost"
                size="sm"
                onPress={handleCopyAll}
              >
                {copied === "all" ? (
                  <Check className="mr-1 size-4 text-green-500" />
                ) : (
                  <Download className="mr-1 size-4" />
                )}
                Copy All
              </Button>
            )}
          </div>

          {result ? (
            <div className="flex flex-1 flex-col">
              {/* Stats */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900 dark:bg-green-900/30 dark:text-green-200">
                  {result.stats.totalTypes} tipos
                </span>
                {result.stats.nestedObjects > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                    {result.stats.nestedObjects} nested
                  </span>
                )}
                {result.stats.arrays > 0 && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-900 dark:bg-purple-900/30 dark:text-purple-200">
                    {result.stats.arrays} arrays
                  </span>
                )}
                {result.stats.dateFields > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                    {result.stats.dateFields} dates
                  </span>
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
                        ? "bg-primary text-white"
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => handleCopy(selectedFile.content, selectedFile.id)}
                    className="absolute right-2 top-2 z-10"
                  >
                    {copied === selectedFile.id ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
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
                Paste your JSON and generate TypeScript code instantly
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                Supports nested objects, arrays, dates and more
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
