"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Regex,
  Sparkles,
  FlaskConical,
  Copy,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useRegexHumanizer } from "@/hooks/use-regex-humanizer";
import type { RegexMode } from "@/types/regex-humanizer";

const TABS: { id: RegexMode; label: string; icon: typeof Regex }[] = [
  { id: "explain", label: "Explain", icon: Regex },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "test", label: "Test", icon: FlaskConical },
];

// Token type to color mapping
const TOKEN_COLORS: Record<string, string> = {
  anchor: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  group: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  quantifier: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  charClass: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200",
  escape: "bg-gray-100 text-gray-900 dark:bg-gray-700/30 dark:text-gray-200",
  literal: "text-foreground",
  alternation: "bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-200",
  flag: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
};

export default function RegexHumanizerPage() {
  const {
    mode,
    pattern,
    description,
    testInput,
    analysis,
    generatedPattern,
    testResult,
    isLoading,
    error,
    commonPatterns,
    setMode,
    setPattern,
    setDescription,
    setTestInput,
    explain,
    generate,
    test,
    reset,
    loadPreset,
    isValidRegex,
  } = useRegexHumanizer();

  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (mode === "explain") explain();
    else if (mode === "generate") generate();
    else if (mode === "test") test();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Regex className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Regex Humanizer
            </h1>
            <p className="text-sm text-muted-foreground">
              Explain regex in plain English, generate patterns from descriptions
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            aria-current={mode === tab.id ? "true" : undefined}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === tab.id
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {mode === "explain" && "Regular Expression"}
            {mode === "generate" && "Description"}
            {mode === "test" && "Pattern & Text"}
          </h2>

          {/* Explain Mode */}
          {mode === "explain" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="regex-explain-input" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Enter your regex
                </label>
                <div className="relative">
                  <input
                    id="regex-explain-input"
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="^[a-zA-Z0-9]+@[a-z]+\.[a-z]{2,}$"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {pattern && !isValidRegex(pattern) && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="size-4" />
                      Invalid regex
                    </div>
                  )}
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Common patterns
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonPatterns.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadPreset(preset.id)}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Mode */}
          {mode === "generate" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="regex-description-input" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Describe what you need
                </label>
                <textarea
                  id="regex-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g.: phone number with 10 digits starting with 1"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Example descriptions:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• &quot;valid email&quot;</li>
                  <li>• &quot;US phone number&quot;</li>
                  <li>• &quot;5 digits&quot;</li>
                  <li>• &quot;ISO date (YYYY-MM-DD)&quot;</li>
                  <li>• &quot;strong password&quot;</li>
                </ul>
              </div>
            </div>
          )}

          {/* Test Mode */}
          {mode === "test" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="regex-test-pattern" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Regular expression
                </label>
                <input
                  id="regex-test-pattern"
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="/^\d{3}-\d{2}-\d{4}$/gi"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="regex-test-text" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Test text
                </label>
                <textarea
                  id="regex-test-text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter text to search for matches..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Quick test presets */}
              <div className="flex flex-wrap gap-2">
                {commonPatterns.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      loadPreset(preset.id);
                      setTestInput(preset.examples[0] || "");
                    }}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              onPress={handleSubmit}
              isPending={isLoading}
              className="flex-1"
            >
              {mode === "explain" && "Explain"}
              {mode === "generate" && "Generate"}
              {mode === "test" && "Test"}
            </Button>
            <Button variant="outline" onPress={reset}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </Card>

        {/* Output Panel */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Result</h2>
            {(analysis || generatedPattern || testResult) && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() =>
                  handleCopy(
                    analysis?.explanation ||
                      generatedPattern ||
                      JSON.stringify(testResult, null, 2) ||
                      ""
                  )
                }
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            )}
          </div>

          {/* Explain Result */}
          {mode === "explain" && analysis && (
            <div className="space-y-4">
              {/* Syntax Highlighted Pattern */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Pattern:</h4>
                <div className="flex flex-wrap gap-1 font-mono text-sm">
                  {analysis.tokens.map((token, i) => (
                    <span
                      key={i}
                      className={`rounded px-1 ${TOKEN_COLORS[token.type]}`}
                      title={token.description}
                    >
                      {token.value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`rounded px-2 py-0.5 ${TOKEN_COLORS["anchor"]}`}>
                  Anchors
                </span>
                <span className={`rounded px-2 py-0.5 ${TOKEN_COLORS["group"]}`}>
                  Groups
                </span>
                <span className={`rounded px-2 py-0.5 ${TOKEN_COLORS["quantifier"]}`}>
                  Quantifiers
                </span>
                <span className={`rounded px-2 py-0.5 ${TOKEN_COLORS["charClass"]}`}>
                  Classes
                </span>
                <span className={`rounded px-2 py-0.5 ${TOKEN_COLORS["escape"]}`}>
                  Escapes
                </span>
              </div>

              {/* Explanation */}
              <div className="rounded-lg border border-border p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {analysis.explanation}
                </pre>
              </div>

              {/* Groups */}
              {analysis.groups.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-300">
                    Capture groups ({analysis.groups.length})
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {analysis.groups.map((group) => (
                      <li key={group.index} className="flex items-start gap-2">
                        <span className="rounded bg-blue-200 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                          ${group.index}
                        </span>
                        <span className="text-muted-foreground">
                          {group.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generate Result */}
          {mode === "generate" && generatedPattern && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h4 className="mb-2 font-medium text-green-700 dark:text-green-300">
                  Generated pattern:
                </h4>
                <code className="block rounded bg-green-100 p-3 font-mono text-sm dark:bg-green-900/30">
                  {generatedPattern}
                </code>
              </div>

              <p className="text-sm text-muted-foreground">
                You can copy this pattern and test it in the
                &quot;Test&quot; tab.
              </p>

              <Button
                variant="outline"
                onPress={() => {
                  setMode("test");
                  setPattern(generatedPattern);
                }}
              >
                Test this pattern
              </Button>
            </div>
          )}

          {/* Test Result */}
          {mode === "test" && testResult && (
            <div className="space-y-4">
              {/* Match Status */}
              <div
                className={`flex items-center gap-3 rounded-lg p-4 ${
                  testResult.matches
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <span className="text-2xl">
                  {testResult.matches ? "✅" : "❌"}
                </span>
                <div>
                  <p
                    className={`font-medium ${
                      testResult.matches
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {testResult.matches
                      ? `${testResult.allMatches.length} match(es) found`
                      : "No matches"}
                  </p>
                  {!testResult.isValid && (
                    <p className="text-sm text-red-600">{testResult.error}</p>
                  )}
                </div>
              </div>

              {/* Matches List */}
              {testResult.allMatches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Matches:</h4>
                  {testResult.allMatches.map((match, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-green-100 px-2 py-0.5 font-mono text-sm dark:bg-green-900/30">
                          {match.match}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          index: {match.index}
                        </span>
                      </div>

                      {Object.keys(match.groups).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(match.groups).map(([key, value]) => (
                            <span
                              key={key}
                              className="rounded bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900/30"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Highlighted Text Preview */}
              {testResult.matches && testInput && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Preview:</h4>
                  <HighlightedText
                    text={testInput}
                    matches={testResult.allMatches}
                  />
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!analysis && !generatedPattern && !testResult && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Regex className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {mode === "explain" &&
                  "Enter a regex to see its explanation"}
                {mode === "generate" &&
                  "Describe the pattern you need"}
                {mode === "test" && "Enter a pattern and text to test"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Component to highlight matches in text
function HighlightedText({
  text,
  matches,
}: {
  text: string;
  matches: { match: string; index: number }[];
}) {
  if (matches.length === 0) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort matches by index
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

  for (const match of sortedMatches) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    // Add highlighted match
    parts.push(
      <mark
        key={`match-${match.index}`}
        className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-700/50"
      >
        {match.match}
      </mark>
    );

    lastIndex = match.index + match.match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <span className="font-mono text-sm">{parts}</span>;
}
