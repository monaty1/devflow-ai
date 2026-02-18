"use client";

import { useState } from "react";
import {
  Sparkles,
  History,
  Trash2,
  Lightbulb,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  ArrowRight,
  Download,
  Coins,
  ScanSearch,
} from "lucide-react";
import { usePromptAnalyzer } from "@/hooks/use-prompt-analyzer";
import { useToast } from "@/hooks/use-toast";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { ScoreBadge } from "@/components/tools/score-badge";
import { SecurityFlagsList } from "@/components/tools/security-flag";
import { PromptAnalyzerSkeleton } from "@/components/shared/skeletons";
import { CopyButton } from "@/components/shared/copy-button";
import { Card, Button } from "@/components/ui";
import type { PromptIssue } from "@/types/prompt-analyzer";

const SEVERITY_COLORS = {
  high: "text-red-900 bg-red-100 dark:bg-red-900/30 dark:text-red-200",
  medium: "text-yellow-900 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200",
  low: "text-blue-900 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200",
};

export default function PromptAnalyzerPage() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");

  const ISSUE_LABELS: Record<PromptIssue["type"], string> = {
    vague_instruction: t("promptAnalyzer.issueVague"),
    missing_context: t("promptAnalyzer.issueMissingContext"),
    no_output_format: t("promptAnalyzer.issueNoOutput"),
    too_long: t("promptAnalyzer.issueTooLong"),
    redundant: t("promptAnalyzer.issueRedundant"),
    missing_role: t("promptAnalyzer.issueMissingRole"),
    vague_terms: t("promptAnalyzer.issueVagueTerms"),
    no_constraints: t("promptAnalyzer.issueNoConstraints"),
    no_success_criteria: t("promptAnalyzer.issueNoSuccessCriteria"),
    no_audience: t("promptAnalyzer.issueNoAudience"),
    missing_examples: t("promptAnalyzer.issueMissingExamples"),
    no_chain_of_thought: t("promptAnalyzer.issueNoChainOfThought"),
    missing_delimiters: t("promptAnalyzer.issueMissingDelimiters"),
    poor_structure: t("promptAnalyzer.issuePoorStructure"),
    payload_splitting_risk: t("promptAnalyzer.issuePayloadSplitting"),
    virtualization_risk: t("promptAnalyzer.issueVirtualization"),
  };
  const [showHistory, setShowHistory] = useState(false);
  const { result, history, isAnalyzing, analyze, clearHistory, removeFromHistory } =
    usePromptAnalyzer();
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      addToast(t("promptAnalyzer.toastEnterPrompt"), "warning");
      return;
    }

    try {
      const analysis = await analyze(prompt);
      if (analysis.securityFlags.length > 0) {
        addToast(
          t("promptAnalyzer.toastSecurity", { count: analysis.securityFlags.length }),
          "warning"
        );
      } else if (analysis.score >= 8) {
        addToast(t("promptAnalyzer.toastExcellent"), "success");
      }
    } catch {
      addToast(t("promptAnalyzer.toastFailed"), "error");
    }
  };

  const handleLoadFromHistory = (historyPrompt: string) => {
    setPrompt(historyPrompt);
    setShowHistory(false);
    addToast(t("promptAnalyzer.toastLoaded"), "info");
  };

  const handleExport = () => {
    if (!result) return;
    const report = `# Prompt Analysis Report
Date: ${new Date().toLocaleString()}
Score: ${result.score}/10 (${result.category})

## Original Prompt
${result.prompt}

## Issues Found
${result.issues.map(i => `- [${i.severity.toUpperCase()}] ${ISSUE_LABELS[i.type]}: ${i.message}`).join("\n")}

## Suggestions
${result.suggestions.map(s => `- ${s}`).join("\n")}

${result.refinedPrompt ? `## Refined Prompt\n${result.refinedPrompt}` : ""}
`;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-analysis-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <ToolHeader
        title={t("promptAnalyzer.title")}
        description={t("promptAnalyzer.description")}
        breadcrumb
      />

      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="prompt-input"
              className="text-sm font-medium text-foreground"
            >
              {t("promptAnalyzer.enterPrompt")}
            </label>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <History className="size-4" />
              {t("common.history", { count: history.length })}
            </button>
          </div>

          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("promptAnalyzer.placeholder")}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                if (prompt.trim()) handleAnalyze();
              }
            }}
            className="min-h-[160px] w-full resize-y rounded-lg border border-border bg-background p-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("promptAnalyzer.stats", { chars: prompt.length, tokens: Math.ceil(prompt.length / 4) })}
            </span>
            <Button
              onPress={handleAnalyze}
              isLoading={isAnalyzing}
              isDisabled={!prompt.trim()}
              className="gap-2"
            >
              <Sparkles className="size-4" />
              {t("promptAnalyzer.analyzePrompt")}
            </Button>
          </div>
        </div>
      </Card>

      {/* History Panel */}
      {showHistory && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{t("promptAnalyzer.analysisHistory")}</h2>
            {history.length > 0 && (
              <Button
                size="sm"
                variant="danger"
                onPress={clearHistory}
                className="gap-1.5"
              >
                <Trash2 className="size-4" />
                {t("common.clearAll")}
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("promptAnalyzer.noAnalysisHistory")}
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span
                      className={`text-sm font-bold ${item.score >= 7 ? "text-emerald-500" : item.score >= 5 ? "text-amber-500" : "text-red-500"}`}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {item.prompt.slice(0, 100)}
                      {item.prompt.length > 100 && "..."}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(item.analyzedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => handleLoadFromHistory(item.prompt)}
                    >
                      {t("promptAnalyzer.load")}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      isIconOnly
                      onPress={() => removeFromHistory(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Results Section */}
      {isAnalyzing ? (
        <Card className="p-6">
          <PromptAnalyzerSkeleton />
        </Card>
      ) : result ? (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ScoreBadge
                score={result.score}
                category={result.category}
                size="lg"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("promptAnalyzer.analysisComplete")}
                  </h2>
                  <Button variant="ghost" size="sm" onPress={handleExport}>
                    <Download className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {t("promptAnalyzer.scoreResult", { score: result.score, category: result.category })}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <span>{t("common.tokens", { count: result.tokenCount })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="size-4 text-muted-foreground" />
                    <span>{t("promptAnalyzer.issues", { count: result.issues.length })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <span>{t("promptAnalyzer.securityFlags", { count: result.securityFlags.length })}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onPress={() => navigateTo("token-visualizer", result.prompt)}
                  >
                    <ScanSearch className="mr-1.5 size-3.5" />
                    Check Tokens
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onPress={() => navigateTo("cost-calculator", result.prompt)}
                  >
                    <Coins className="mr-1.5 size-3.5" />
                    Estimate Cost
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Refined Prompt */}
          {result.refinedPrompt && result.refinedPrompt !== result.prompt && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <Zap className="size-5 text-primary fill-primary/20" />
                    {t("promptAnalyzer.refinedPrompt")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("promptAnalyzer.refinedDescription")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton text={result.refinedPrompt} label={t("common.copy")} />
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => {
                      setPrompt(result.refinedPrompt!);
                      addToast(t("promptAnalyzer.toastApplied"), "success");
                    }}
                    className="gap-1.5"
                  >
                    <ArrowRight className="size-4" />
                    {t("promptAnalyzer.useRefined")}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-primary/10 bg-background/50 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {result.refinedPrompt}
              </div>
            </Card>
          )}

          {/* Security Flags */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="size-5" />
              {t("promptAnalyzer.securityAnalysis")}
            </h3>
            <SecurityFlagsList flags={result.securityFlags} />
          </Card>

          {/* Issues */}
          {result.issues.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-foreground">
                {t("promptAnalyzer.qualityIssues")}
              </h3>
              <div className="space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={`${issue.type}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[issue.severity]}`}
                    >
                      {issue.severity}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {ISSUE_LABELS[issue.type]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Lightbulb className="size-5 text-yellow-500" />
              {t("promptAnalyzer.suggestions")}
            </h3>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Sparkles className="mx-auto size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {t("promptAnalyzer.readyToAnalyze")}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t("promptAnalyzer.emptyStateHint")}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
