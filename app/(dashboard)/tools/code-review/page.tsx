"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { RotateCcw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useCodeReview } from "@/hooks/use-code-review";
import { useToast } from "@/hooks/use-toast";
import { ToolHeader } from "@/components/shared/tool-header";
import type { SupportedLanguage, CodeIssue } from "@/types/code-review";

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const SEVERITY_STYLES: Record<
  CodeIssue["severity"],
  { bg: string; text: string; icon: typeof AlertTriangle }
> = {
  critical: { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
  warning: { bg: "bg-amber-50", text: "text-amber-700", icon: Info },
  info: { bg: "bg-blue-50", text: "text-blue-700", icon: Info },
};

const CATEGORY_COLORS: Record<string, string> = {
  security: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  performance: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  maintainability: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "best-practice": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  style: "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200",
};

export default function CodeReviewPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const { result, isReviewing, review, reset } = useCodeReview();
  const { addToast } = useToast();

  const handleReview = async () => {
    if (!code.trim()) {
      addToast("Please enter code to review", "warning");
      return;
    }

    try {
      const reviewResult = await review(code, language);
      const criticalCount = reviewResult.issues.filter(
        (i) => i.severity === "critical"
      ).length;

      if (criticalCount > 0) {
        addToast(`Found ${criticalCount} critical issue(s)!`, "error");
      } else if (reviewResult.overallScore >= 80) {
        addToast("Code looks great!", "success");
      }
    } catch {
      addToast("Review failed. Please try again.", "error");
    }
  };

  const handleReset = () => {
    setCode("");
    reset();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <ToolHeader
        title="Code Review Assistant"
        description="Automated code quality and security analysis"
        actions={
          <Button variant="outline" size="sm" onPress={handleReset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="p-6">
          <Card.Header className="mb-4 p-0">
            <Card.Title>Code Input</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4 p-0">
            {/* Language Selector */}
            <div>
              <label htmlFor="code-review-language" className="text-sm font-medium text-muted-foreground">
                Language
              </label>
              <select
                id="code-review-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Editor */}
            <div>
              <label htmlFor="code-review-input" className="text-sm font-medium text-muted-foreground">
                Paste your code
              </label>
              <textarea
                id="code-review-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste your code here..."
                className="mt-1 h-80 w-full resize-none rounded-lg border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {code.split("\n").length} lines
              </span>
              <Button
                onPress={handleReview}
                isPending={isReviewing}
                isDisabled={!code.trim()}
              >
                Review Code
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Score Card */}
              <Card className="p-6">
                <Card.Content className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Overall Score
                      </p>
                      <p
                        className={`text-4xl font-bold ${
                          result.overallScore >= 80
                            ? "text-emerald-600"
                            : result.overallScore >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {result.overallScore}/100
                      </p>
                    </div>
                    {result.overallScore >= 80 ? (
                      <CheckCircle className="size-12 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="size-12 text-amber-500" />
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Metrics */}
              <Card className="p-6">
                <Card.Header className="mb-4 p-0">
                  <Card.Title className="text-sm">Metrics</Card.Title>
                </Card.Header>
                <Card.Content className="p-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Lines</p>
                      <p className="font-semibold">{result.metrics.totalLines}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Code Lines</p>
                      <p className="font-semibold">{result.metrics.codeLines}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comments</p>
                      <p className="font-semibold">{result.metrics.commentLines}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Complexity</p>
                      <p className="font-semibold">{result.metrics.complexity}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Maintainability</span>
                      <span>{result.metrics.maintainabilityIndex}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          result.metrics.maintainabilityIndex >= 70
                            ? "bg-emerald-500"
                            : result.metrics.maintainabilityIndex >= 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${result.metrics.maintainabilityIndex}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Issues */}
              {result.issues.length > 0 && (
                <Card className="p-6">
                  <Card.Header className="mb-4 p-0">
                    <Card.Title className="text-sm">
                      Issues ({result.issues.length})
                    </Card.Title>
                  </Card.Header>
                  <Card.Content className="max-h-64 space-y-2 overflow-y-auto p-0">
                    {result.issues.map((issue, i) => {
                      const style = SEVERITY_STYLES[issue.severity];
                      const Icon = style.icon;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 rounded-lg p-3 ${style.bg}`}
                        >
                          <Icon className={`mt-0.5 size-4 shrink-0 ${style.text}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Line {issue.line}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${CATEGORY_COLORS[issue.category]}`}
                              >
                                {issue.category}
                              </span>
                            </div>
                            <p className={`text-sm font-medium ${style.text}`}>
                              {issue.message}
                            </p>
                            {issue.suggestion && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {issue.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Card.Content>
                </Card>
              )}

              {/* Suggestions */}
              <Card className="p-6">
                <Card.Header className="mb-4 p-0">
                  <Card.Title className="text-sm">Suggestions</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-2 p-0">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30"
                    >
                      <span className="font-bold text-blue-600">{i + 1}</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{s}</p>
                    </div>
                  ))}
                </Card.Content>
              </Card>
            </>
          ) : (
            <Card className="p-16">
              <Card.Content className="p-0 text-center">
                <p className="mb-4 text-5xl">🔍</p>
                <p className="text-foreground">Ready to review</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paste code and click Review to analyze
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
