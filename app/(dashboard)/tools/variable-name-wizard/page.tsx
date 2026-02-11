"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Wand2,
  ArrowRight,
  History,
  Trash2,
  ChevronRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useVariableNameWizard } from "@/hooks/use-variable-name-wizard";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import {
  CONVENTION_LABELS,
  CONVENTION_EXAMPLES,
  TYPE_LABELS,
  type NamingConvention,
  type VariableType,
} from "@/types/variable-name-wizard";

const VARIABLE_TYPES: VariableType[] = [
  "variable",
  "function",
  "class",
  "constant",
  "interface",
  "type",
  "enum",
  "component",
  "hook",
  "file",
  "css-class",
];

const CONVENTIONS: NamingConvention[] = [
  "camelCase",
  "PascalCase",
  "snake_case",
  "SCREAMING_SNAKE_CASE",
  "kebab-case",
  "flatcase",
];

export default function VariableNameWizardPage() {
  const {
    input,
    mode,
    variableType,
    conversionResult,
    generationResult,
    history,
    inputStats,
    setInput,
    setMode,
    setVariableType,
    convert,
    generate,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    expand,
    abbreviate,
    applyConversion,
    applySuggestion,
  } = useVariableNameWizard();

  const [showHistory, setShowHistory] = useState(false);

  const handleAction = () => {
    if (mode === "convert") {
      convert();
    } else {
      generate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Wand2}
        gradient="from-fuchsia-500 to-pink-600"
        title="Variable Name Wizard"
        description="Generate and convert variable names between naming conventions"
      />

      {/* Mode Toggle */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setMode("convert")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "convert"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <RefreshCw className="mr-2 inline-block size-4" />
              Convert
            </button>
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "generate"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Sparkles className="mr-2 inline-block size-4" />
              Generate
            </button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onPress={() => loadExample(0)}>
              Example 1
            </Button>
            <Button variant="outline" size="sm" onPress={() => loadExample(1)}>
              Example 2
            </Button>
            <Button variant="outline" size="sm" onPress={() => loadExample(2)}>
              Example 3
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {mode === "convert" ? "Name to convert" : "Name description"}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={expand} isDisabled={!input}>
                  <Maximize2 className="mr-1 size-4" />
                  Expand
                </Button>
                <Button variant="ghost" size="sm" onPress={abbreviate} isDisabled={!input}>
                  <Minimize2 className="mr-1 size-4" />
                  Abbreviate
                </Button>
              </div>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "convert"
                  ? "E.g.: getUserData, user_name, UserProfile..."
                  : "E.g.: get user data, authentication state..."
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputStats.isValid) {
                  handleAction();
                }
              }}
            />

            {/* Input Stats */}
            {input.trim() && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-lg bg-muted px-3 py-1.5 text-sm">
                  <strong>{inputStats.wordCount}</strong> words
                </div>
                {inputStats.detectedConvention !== "unknown" && (
                  <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
                    Detected: <strong>{inputStats.detectedConvention}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Variable Type (for generate mode) */}
            {mode === "generate" && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">
                  Identifier type
                </label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVariableType(type)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        variableType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onPress={handleAction}
                isDisabled={!inputStats.isValid}
              >
                {mode === "convert" ? (
                  <>
                    <RefreshCw className="mr-2 size-5" />
                    Convert to all conventions
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-5" />
                    Generate suggestions
                  </>
                )}
              </Button>
            </div>

            {/* History Toggle */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onPress={reset} isDisabled={!input}>
                <RotateCcw className="mr-1 size-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowHistory(!showHistory)}
              >
                <History className="mr-1 size-4" />
                History ({history.length})
              </Button>
            </div>
          </Card>

          {/* History */}
          {showHistory && history.length > 0 && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Recent history</h4>
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
                      <code className="block truncate text-sm font-medium">
                        {item.input}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {item.mode === "convert" ? "Conversion" : "Generation"}
                      </p>
                    </div>
                    <ChevronRight className="ml-2 size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Convention Reference */}
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold">Naming conventions</h3>
            <div className="space-y-2">
              {CONVENTIONS.map((conv) => (
                <div
                  key={conv}
                  className="flex items-center justify-between rounded-lg border border-border p-2"
                >
                  <div>
                    <span className="font-mono text-sm font-medium">
                      {CONVENTION_LABELS[conv]}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {CONVENTION_EXAMPLES[conv]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Conversion Results */}
          {mode === "convert" && conversionResult && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Conversions</h2>

              <div className="mb-4 rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Original: </span>
                <code className="font-mono font-medium">{conversionResult.original}</code>
                {conversionResult.originalConvention !== "unknown" && (
                  <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {conversionResult.originalConvention}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {(Object.entries(conversionResult.conversions) as [NamingConvention, string][]).map(
                  ([convention, value]) => (
                    <div
                      key={convention}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground">
                          {CONVENTION_LABELS[convention]}
                        </span>
                        <code className="block truncate font-mono font-medium">{value}</code>
                      </div>
                      <div className="ml-2 flex shrink-0 gap-1">
                        <CopyButton text={value} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => applyConversion(convention)}
                        >
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* Generation Results */}
          {mode === "generate" && generationResult && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Suggestions</h2>

              <div className="mb-4 rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Context: </span>
                <span className="font-medium">{generationResult.context}</span>
                <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {TYPE_LABELS[generationResult.type]}
                </span>
              </div>

              {generationResult.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {generationResult.suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                          <code className="font-mono text-lg font-semibold">
                            {suggestion.name}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">
                            {suggestion.convention}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              suggestion.score >= 80
                                ? "bg-green-500/10 text-green-600"
                                : suggestion.score >= 60
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {suggestion.score}%
                          </span>
                        </div>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {suggestion.reasoning}
                      </p>
                      <div className="flex gap-2">
                        <CopyButton text={suggestion.name} label="Copy" variant="outline" />
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => applySuggestion(suggestion.name)}
                        >
                          <ArrowRight className="mr-1 size-4" />
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Wand2 className="mb-2 size-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    No suggestions generated
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Empty State */}
          {!conversionResult && !generationResult && (
            <Card className="p-6">
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <Wand2 className="mb-4 size-16 text-muted-foreground/30" />
                <h3 className="mb-2 text-lg font-medium">
                  {mode === "convert"
                    ? "Convert variable names"
                    : "Generate perfect names"}
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {mode === "convert"
                    ? "Enter a name and automatically convert it to camelCase, snake_case, PascalCase and more."
                    : "Describe what your variable represents and get name suggestions following best practices."}
                </p>
              </div>
            </Card>
          )}

          {/* Type Recommendations */}
          {mode === "generate" && (
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-semibold">
                Recommended conventions by type
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">Variables</span>
                  <p className="text-xs text-muted-foreground">camelCase</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">Constants</span>
                  <p className="text-xs text-muted-foreground">SCREAMING_SNAKE</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">Classes/Types</span>
                  <p className="text-xs text-muted-foreground">PascalCase</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">React Hooks</span>
                  <p className="text-xs text-muted-foreground">useXxxXxx</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">Components</span>
                  <p className="text-xs text-muted-foreground">PascalCase</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <span className="font-medium">Files</span>
                  <p className="text-xs text-muted-foreground">kebab-case</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
