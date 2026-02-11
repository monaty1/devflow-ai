"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Fingerprint,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Search,
  Info,
} from "lucide-react";
import { useUuidGenerator } from "@/hooks/use-uuid-generator";
import type { UuidVersion, UuidFormat } from "@/types/uuid-generator";

const VERSION_OPTIONS: { id: UuidVersion; label: string; description: string }[] = [
  { id: "v4", label: "v4", description: "Random (más común)" },
  { id: "v1", label: "v1", description: "Basado en tiempo" },
  { id: "v7", label: "v7", description: "Unix epoch + random" },
  { id: "nil", label: "Nil", description: "Todo ceros" },
  { id: "max", label: "Max", description: "Todo efes" },
];

const FORMAT_OPTIONS: { id: UuidFormat; label: string; example: string }[] = [
  { id: "standard", label: "Estándar", example: "550e8400-e29b-..." },
  { id: "uppercase", label: "Mayúsculas", example: "550E8400-E29B-..." },
  { id: "no-hyphens", label: "Sin guiones", example: "550e8400e29b..." },
  { id: "braces", label: "Con llaves", example: "{550e8400-...}" },
  { id: "urn", label: "URN", example: "urn:uuid:550e..." },
];

export default function UuidGeneratorPage() {
  const {
    config,
    result,
    validateInput,
    parseInput,
    parsedInfo,
    setValidateInput,
    setParseInput,
    updateConfig,
    generate,
    validate,
    parse,
    loadExample,
    reset,
    copyToClipboard,
  } = useUuidGenerator();

  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "validate" | "parse">("generate");

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const validationResult = validateInput.trim() ? validate() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
            <Fingerprint className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              UUID Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Genera, valida y analiza UUIDs en todos los formatos
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "generate", label: "Generar", icon: Sparkles },
            { id: "validate", label: "Validar", icon: Search },
            { id: "parse", label: "Analizar", icon: Info },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all ${
              activeTab === tab.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <tab.icon className="size-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {/* Version Selector */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Versión</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VERSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateConfig("version", opt.id)}
                    className={`flex flex-col items-start rounded-lg border-2 px-3 py-2 transition-all ${
                      config.version === opt.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-mono text-sm font-bold">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Format Selector */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Formato</h3>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateConfig("format", opt.id)}
                    className={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 transition-all ${
                      config.format === opt.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{opt.example}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quantity */}
            <Card className="p-6">
              <label htmlFor="uuid-quantity" className="mb-4 block font-semibold">Cantidad</label>
              <input
                id="uuid-quantity"
                type="number"
                value={config.quantity}
                onChange={(e) =>
                  updateConfig("quantity", Math.max(1, Math.min(1000, parseInt(e.target.value, 10) || 1)))
                }
                min={1}
                max={1000}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-2 text-xs text-muted-foreground">Máximo 1000 UUIDs</p>

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <Button onPress={generate} className="flex-1">
                  <Sparkles className="mr-2 size-4" />
                  Generar
                </Button>
                <Button variant="outline" onPress={reset}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Output */}
          <Card className="flex flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Resultado</h2>
              {result && result.uuids.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleCopy(result.uuids.join("\n"), "all")}
                >
                  {copied === "all" ? (
                    <Check className="mr-1 size-4 text-green-500" />
                  ) : (
                    <Copy className="mr-1 size-4" />
                  )}
                  Copiar todo
                </Button>
              )}
            </div>

            {result && result.uuids.length > 0 ? (
              <div className="flex-1 space-y-2 overflow-auto">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                    {result.version.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
                    {result.uuids.length} UUID{result.uuids.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="max-h-[500px] space-y-1 overflow-auto">
                  {result.uuids.map((uuid, i) => (
                    <div
                      key={`${uuid}-${i}`}
                      className="group flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <code className="break-all font-mono text-sm">{uuid}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(uuid, `uuid-${i}`)}
                        className="ml-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        aria-label="Copy to clipboard"
                      >
                        {copied === `uuid-${i}` ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <Fingerprint className="mb-4 size-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  Selecciona versión y formato, luego genera
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Validate Tab */}
      {activeTab === "validate" && (
        <Card className="p-6">
          <label htmlFor="uuid-validate" className="mb-4 block text-lg font-semibold">Validar UUID</label>
          <input
            id="uuid-validate"
            type="text"
            value={validateInput}
            onChange={(e) => setValidateInput(e.target.value)}
            placeholder="Pega un UUID para validar..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {validationResult && (
            <div className="mt-4 space-y-3">
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 ${
                  validationResult.isValid
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {validationResult.isValid ? (
                  <Check className="size-5" />
                ) : (
                  <Info className="size-5" />
                )}
                <span className="font-medium">
                  {validationResult.isValid ? "UUID válido" : validationResult.error ?? "UUID inválido"}
                </span>
              </div>

              {validationResult.isValid && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Versión</span>
                    <p className="font-mono font-bold">{validationResult.version ?? "unknown"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Variante</span>
                    <p className="font-mono font-bold">{validationResult.variant ?? "unknown"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Parse Tab */}
      {activeTab === "parse" && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analizar UUID</h2>
            <div className="flex gap-2">
              {(["v1", "v4", "v7", "nil"] as const).map((v) => (
                <Button key={v} variant="ghost" size="sm" onPress={() => loadExample(v)}>
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <input
            id="uuid-parse"
            aria-label="UUID to parse"
            type="text"
            value={parseInput}
            onChange={(e) => setParseInput(e.target.value)}
            placeholder="Pega un UUID para analizar..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="mt-3">
            <Button onPress={parse} isDisabled={!parseInput.trim()}>
              <Search className="mr-2 size-4" />
              Analizar
            </Button>
          </div>

          {parsedInfo && (
            <div className="mt-4 space-y-3">
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 ${
                  parsedInfo.isValid
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {parsedInfo.isValid ? (
                  <Check className="size-5" />
                ) : (
                  <Info className="size-5" />
                )}
                <span className="font-medium">
                  {parsedInfo.isValid ? "UUID válido" : "UUID inválido"}
                </span>
              </div>

              {parsedInfo.isValid && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">UUID normalizado</span>
                    <p className="break-all font-mono text-sm font-bold">{parsedInfo.uuid}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Versión</span>
                    <p className="font-mono font-bold">{parsedInfo.version}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Variante</span>
                    <p className="font-mono font-bold">{parsedInfo.variant}</p>
                  </div>
                  {parsedInfo.timestamp !== undefined && (
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                      <span className="text-xs text-muted-foreground">Timestamp</span>
                      <p className="font-mono text-sm font-bold">
                        {parsedInfo.timestamp.toISOString()}
                      </p>
                    </div>
                  )}
                  {parsedInfo.clockSeq !== undefined && (
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                      <span className="text-xs text-muted-foreground">Clock Sequence</span>
                      <p className="font-mono font-bold">{parsedInfo.clockSeq}</p>
                    </div>
                  )}
                  {parsedInfo.node !== undefined && (
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                      <span className="text-xs text-muted-foreground">Node (MAC)</span>
                      <p className="font-mono font-bold">{parsedInfo.node}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
