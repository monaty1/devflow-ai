"use client";

import { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import {
  GitCommitHorizontal,
  Check,
  Trash2,
  Sparkles,
  Search,
  AlertCircle,
  History,
} from "lucide-react";
import { useGitCommitGenerator } from "@/hooks/use-git-commit-generator";
import { CopyButton } from "@/components/shared/copy-button";
import { COMMIT_TYPES, validateCommitMessage } from "@/lib/application/git-commit-generator";

export default function GitCommitGeneratorPage() {
  const {
    config,
    result,
    parseInput,
    parsedCommit,
    history,
    setParseInput,
    updateConfig,
    generate,
    parse,
    loadExample,
    getSuggestions,
    reset,
    clearHistory,
    loadFromHistory,
  } = useGitCommitGenerator();

  const [activeTab, setActiveTab] = useState<"generate" | "parse" | "history">("generate");
  const [isBreaking, setIsBreaking] = useState(false);

  const scopeSuggestions = useMemo(
    () => getSuggestions(config.description),
    [config.description, getSuggestions]
  );

  const previewValidation = useMemo(() => {
    if (!result) return null;
    return validateCommitMessage(result.message);
  }, [result]);

  const descLength = config.description.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <GitCommitHorizontal className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Git Commit Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Genera mensajes de commit siguiendo Conventional Commits
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "generate", label: "Generar", icon: Sparkles },
            { id: "parse", label: "Analizar", icon: Search },
            { id: "history", label: "Historial", icon: History },
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
            {/* Type Selector */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Tipo de Commit</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {COMMIT_TYPES.map((ct) => (
                  <button
                    key={ct.type}
                    type="button"
                    onClick={() => updateConfig("type", ct.type)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left transition-all ${
                      config.type === ct.type
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-lg">{ct.emoji}</span>
                    <div>
                      <span className="text-sm font-bold">{ct.type}</span>
                      <p className="text-xs text-muted-foreground">{ct.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Scope & Description */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* Scope */}
                <div>
                  <label htmlFor="commit-scope" className="mb-2 block text-sm font-medium">
                    Scope <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <input
                    id="commit-scope"
                    type="text"
                    value={config.scope}
                    onChange={(e) => updateConfig("scope", e.target.value)}
                    placeholder="auth, api, ui, db..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {scopeSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {scopeSuggestions.map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => updateConfig("scope", scope)}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="commit-description" className="text-sm font-medium">Descripción</label>
                    <span
                      className={`text-xs ${
                        descLength > 72 ? "text-red-500" : descLength > 50 ? "text-yellow-500" : "text-muted-foreground"
                      }`}
                    >
                      {descLength}/72
                    </span>
                  </div>
                  <input
                    id="commit-description"
                    type="text"
                    value={config.description}
                    onChange={(e) => updateConfig("description", e.target.value)}
                    placeholder="add user authentication flow"
                    maxLength={100}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Body */}
                <div>
                  <label htmlFor="commit-body" className="mb-2 block text-sm font-medium">
                    Body <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <textarea
                    id="commit-body"
                    value={config.body}
                    onChange={(e) => updateConfig("body", e.target.value)}
                    placeholder="Explicación detallada del cambio..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Breaking Change */}
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => {
                        setIsBreaking(e.target.checked);
                        if (!e.target.checked) {
                          updateConfig("breakingChange", "");
                        }
                      }}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-medium">Breaking Change</span>
                  </label>
                  {isBreaking && (
                    <input
                      type="text"
                      value={config.breakingChange}
                      onChange={(e) => updateConfig("breakingChange", e.target.value)}
                      placeholder="Describe el breaking change..."
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>

                {/* Issue Reference */}
                <div>
                  <label htmlFor="commit-issues" className="mb-2 block text-sm font-medium">
                    Issues <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <input
                    id="commit-issues"
                    type="text"
                    value={config.issueRef}
                    onChange={(e) => updateConfig("issueRef", e.target.value)}
                    placeholder="#123, #456"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <Button
                  onPress={generate}
                  isDisabled={!config.description.trim()}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 size-4" />
                  Generar
                </Button>
                <Button variant="outline" onPress={reset}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <Card className="flex flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vista Previa</h2>
              {result && (
                <CopyButton text={result.message} label="Copiar" />
              )}
            </div>

            {result ? (
              <div className="flex-1 space-y-4">
                {/* Validation Status */}
                {previewValidation && (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      previewValidation.isValid
                        ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {previewValidation.isValid ? (
                      <Check className="size-4" />
                    ) : (
                      <AlertCircle className="size-4" />
                    )}
                    {previewValidation.isValid
                      ? "Formato válido"
                      : previewValidation.errors[0] ?? "Formato inválido"}
                  </div>
                )}

                {/* Message Preview */}
                <div className="relative">
                  <pre className="overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap">
                    <code>{result.message}</code>
                  </pre>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                    {result.type}
                  </span>
                  {result.scope && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-900 dark:bg-purple-900/30 dark:text-purple-200">
                      {result.scope}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-900 dark:bg-gray-900/30 dark:text-gray-200">
                    {result.message.length} chars
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <GitCommitHorizontal className="mb-4 size-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  Selecciona tipo y escribe la descripción
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Parse Tab */}
      {activeTab === "parse" && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analizar Commit</h2>
            <div className="flex gap-2">
              {(["feat", "fix", "refactor"] as const).map((t) => (
                <Button key={t} variant="ghost" size="sm" onPress={() => loadExample(t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <textarea
            id="commit-parse-input"
            aria-label="Commit message to parse"
            value={parseInput}
            onChange={(e) => setParseInput(e.target.value)}
            placeholder="Pega un mensaje de commit para analizar..."
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="mt-3">
            <Button onPress={parse} isDisabled={!parseInput.trim()}>
              <Search className="mr-2 size-4" />
              Analizar
            </Button>
          </div>

          {parsedCommit && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-xs text-muted-foreground">Tipo</span>
                <p className="font-mono font-bold">{parsedCommit.type ?? "Desconocido"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-xs text-muted-foreground">Scope</span>
                <p className="font-mono font-bold">{parsedCommit.scope || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3 sm:col-span-2">
                <span className="text-xs text-muted-foreground">Descripción</span>
                <p className="font-mono font-bold">{parsedCommit.description}</p>
              </div>
              {parsedCommit.body && (
                <div className="rounded-lg bg-muted/50 px-4 py-3 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Body</span>
                  <p className="whitespace-pre-wrap font-mono text-sm">{parsedCommit.body}</p>
                </div>
              )}
              {parsedCommit.isBreaking && (
                <div className="rounded-lg bg-red-100 px-4 py-3 dark:bg-red-900/30 sm:col-span-2">
                  <span className="text-xs text-red-700 dark:text-red-300">Breaking Change</span>
                  <p className="font-mono font-bold text-red-800 dark:text-red-200">
                    {parsedCommit.breakingChange || "Yes"}
                  </p>
                </div>
              )}
              {parsedCommit.issueRefs.length > 0 && (
                <div className="rounded-lg bg-muted/50 px-4 py-3 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Issues</span>
                  <div className="mt-1 flex gap-2">
                    {parsedCommit.issueRefs.map((ref) => (
                      <span
                        key={ref}
                        className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Historial</h2>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clearHistory}>
                <Trash2 className="mr-1 size-4" />
                Limpiar
              </Button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadFromHistory(item)}
                  className="flex w-full items-start gap-3 rounded-lg bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="mt-0.5 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                    {item.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm">{item.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <History className="mx-auto mb-4 size-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay historial todavía</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
