"use client";

import { useState, useMemo } from "react";
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
  ArrowUp,
  ArrowDown,
  Minus as MinusIcon,
  Download,
  Coins,
  ScanSearch,
  Bot,
  UserCircle,
  Target,
  Layers,
  ListOrdered,
  FileOutput,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  XCircle,
  CircleDot,
  GitCompareArrows,
} from "lucide-react";
import { usePromptAnalyzer } from "@/hooks/use-prompt-analyzer";
import { useAIRefine } from "@/hooks/use-ai-refine";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useToast } from "@/hooks/use-toast";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { ScoreBadge } from "@/components/tools/score-badge";
import { SecurityFlagsList } from "@/components/tools/security-flag";
import { PromptAnalyzerSkeleton } from "@/components/shared/skeletons";
import { CopyButton } from "@/components/shared/copy-button";
import { TextArea } from "@heroui/react";
import { Card, Button } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import type { PromptIssue, AnatomyElement, PromptAnalysisResult, PromptDimension } from "@/types/prompt-analyzer";

const DIMENSION_ICONS: Record<AnatomyElement, React.ElementType> = {
  role: UserCircle,
  task: Target,
  context: Layers,
  steps: ListOrdered,
  format: FileOutput,
  constraints: ShieldAlert,
  clarification: HelpCircle,
};

const DIMENSION_COLORS: Record<AnatomyElement, string> = {
  role: "bg-violet-500",
  task: "bg-blue-500",
  context: "bg-emerald-500",
  steps: "bg-amber-500",
  format: "bg-cyan-500",
  constraints: "bg-rose-500",
  clarification: "bg-indigo-500",
};

const SEVERITY_COLORS = {
  high: "text-red-900 bg-red-100 dark:bg-red-900/30 dark:text-red-200",
  medium: "text-yellow-900 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200",
  low: "text-blue-900 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200",
};

const AXIS_LABELS: Record<AnatomyElement, string> = {
  role: "Role",
  task: "Task",
  context: "Context",
  steps: "Steps",
  format: "Format",
  constraints: "Constraints",
  clarification: "Clarify",
};

function AnatomyRadar({ dimensions, compareDimensions }: { dimensions: PromptDimension[]; compareDimensions?: PromptDimension[] | undefined }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 70;
  const labelR = 88;
  const n = dimensions.length;

  const getPoint = (index: number, score: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (score / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return { x: cx + labelR * Math.cos(angle), y: cy + labelR * Math.sin(angle) };
  };

  const toPath = (dims: PromptDimension[]) =>
    dims.map((d, i) => {
      const p = getPoint(i, d.score);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }).join(" ") + " Z";

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" aria-hidden="true">
      {/* Grid */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, level);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={0.5}
        />
      ))}
      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.06} strokeWidth={0.5} />;
      })}
      {/* Axis labels */}
      {dimensions.map((d, i) => {
        const lp = getLabelPoint(i);
        return (
          <text
            key={`label-${d.id}`}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-current text-muted-foreground"
            fontSize={8}
            fontWeight={500}
          >
            {AXIS_LABELS[d.id]}
          </text>
        );
      })}
      {/* Compare fill (if present) */}
      {compareDimensions && (
        <path d={toPath(compareDimensions)} fill="rgb(168 85 247 / 0.12)" stroke="rgb(168 85 247)" strokeWidth={1} strokeDasharray="3 2" />
      )}
      {/* Main fill */}
      <path d={toPath(dimensions)} fill="rgb(59 130 246 / 0.15)" stroke="rgb(59 130 246)" strokeWidth={1.5} />
      {/* Dots */}
      {dimensions.map((d, i) => {
        const p = getPoint(i, d.score);
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="rgb(59 130 246)" />;
      })}
    </svg>
  );
}

export default function PromptAnalyzerPage() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [compareItem, setCompareItem] = useState<PromptAnalysisResult | null>(null);

  const ISSUE_LABELS: Record<PromptIssue["type"], string> = useMemo(() => ({
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
  }), [t]);
  const [showHistory, setShowHistory] = useState(false);
  const { result, history, isAnalyzing, analyze, clearHistory, removeFromHistory } =
    usePromptAnalyzer();

  const scoreDelta = useMemo(() => {
    if (!result || !compareItem) return null;
    const dimDeltas = result.dimensions.map((dim) => {
      const prev = compareItem.dimensions.find((d) => d.id === dim.id);
      return { id: dim.id, delta: dim.score - (prev?.score ?? 0) };
    });
    return {
      overall: result.score - compareItem.score,
      anatomy: result.anatomyScore - compareItem.anatomyScore,
      dimensions: dimDeltas,
    };
  }, [result, compareItem]);
  const { refineWithAI, aiResult: aiRefineResult, isAILoading: isAIRefining } = useAIRefine();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
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
Anatomy Score: ${result.anatomyScore}/100

## Original Prompt
${result.prompt}

## Prompt Anatomy (7 Dimensions)
${result.dimensions.map(d => `- **${d.id}** — ${d.score}% ${d.detected ? "✓" : "✗"} ${d.evidence ? `("${d.evidence}")` : ""}`).join("\n")}

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
        icon={ScanSearch}
        gradient="from-yellow-500 to-orange-600"
        title={t("promptAnalyzer.title")}
        description={t("promptAnalyzer.description")}
        breadcrumb
      />

      <ToolSuggestions toolId="prompt-analyzer" input={prompt} output={result?.refinedPrompt || ""} />

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

          <TextArea
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
            aria-label={t("promptAnalyzer.enterPrompt")}
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
                    {result && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onPress={() => setCompareItem(item)}
                        aria-label={t("promptAnalyzer.compareWithCurrent")}
                      >
                        <GitCompareArrows className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      isIconOnly
                      onPress={() => removeFromHistory(item.id)}
                      aria-label={t("common.delete")}
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
              <div className="flex flex-col items-center gap-3">
                <ScoreBadge
                  score={result.score}
                  category={result.category}
                  size="lg"
                />
                <div className="size-[140px]">
                  <AnatomyRadar dimensions={result.dimensions} compareDimensions={compareItem?.dimensions} />
                </div>
                {compareItem && scoreDelta && (
                  <div className="flex items-center gap-1 text-xs">
                    {scoreDelta.overall > 0 ? (
                      <><ArrowUp className="size-3 text-emerald-500" /><span className="font-bold text-emerald-600">+{scoreDelta.overall}</span></>
                    ) : scoreDelta.overall < 0 ? (
                      <><ArrowDown className="size-3 text-red-500" /><span className="font-bold text-red-600">{scoreDelta.overall}</span></>
                    ) : (
                      <><MinusIcon className="size-3 text-muted-foreground" /><span className="font-bold text-muted-foreground">0</span></>
                    )}
                    <span className="text-muted-foreground">{t("promptAnalyzer.vsHistory")}</span>
                    <button type="button" onClick={() => setCompareItem(null)} className="ml-1 text-muted-foreground hover:text-foreground">
                      <XCircle className="size-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("promptAnalyzer.analysisComplete")}
                  </h2>
                  <Button variant="ghost" size="sm" onPress={handleExport} aria-label={t("promptAnalyzer.exportReport")}>
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
                    {t("promptAnalyzer.checkTokens")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => navigateTo("cost-calculator", result.prompt)}
                  >
                    <Coins className="mr-1.5 size-3.5" />
                    {t("promptAnalyzer.estimateCost")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Anatomy Breakdown */}
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Layers className="size-5 text-primary" />
                  {t("promptAnalyzer.anatomy.title")}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("promptAnalyzer.anatomy.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("promptAnalyzer.anatomy.score")}
                </span>
                <span className="text-lg font-bold text-primary">
                  {result.anatomyScore}
                  <span className="text-xs font-normal text-muted-foreground">/100</span>
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {result.dimensions.map((dim) => {
                const DimIcon = DIMENSION_ICONS[dim.id];
                const barColor = DIMENSION_COLORS[dim.id];
                const status = dim.score >= 60 ? "detected" : dim.score >= 30 ? "partial" : "missing";
                const StatusIcon = status === "detected" ? CheckCircle2 : status === "partial" ? CircleDot : XCircle;
                const statusColor = status === "detected" ? "text-emerald-500" : status === "partial" ? "text-amber-500" : "text-red-400";

                return (
                  <div key={dim.id} className="group rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${barColor}/15`}>
                        <DimIcon className={`size-4 ${barColor.replace("bg-", "text-")}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {t(`promptAnalyzer.anatomy.${dim.id}`)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`size-3.5 ${statusColor}`} />
                            <span className={`text-xs font-medium ${statusColor}`}>
                              {t(`promptAnalyzer.anatomy.${status}`)}
                            </span>
                            <span className="ml-1 text-xs tabular-nums text-muted-foreground">
                              {dim.score}%
                            </span>
                            {scoreDelta && (() => {
                              const dd = scoreDelta.dimensions.find((d) => d.id === dim.id);
                              if (!dd || dd.delta === 0) return null;
                              return dd.delta > 0
                                ? <span className="ml-1 text-[10px] font-bold text-emerald-500">+{dd.delta}</span>
                                : <span className="ml-1 text-[10px] font-bold text-red-500">{dd.delta}</span>;
                            })()}
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {dim.evidence ? (
                      <p className="mt-2 ml-11 text-xs text-muted-foreground italic truncate">
                        &ldquo;{dim.evidence}&rdquo;
                      </p>
                    ) : (
                      <p className="mt-2 ml-11 text-xs text-muted-foreground">
                        {t(`promptAnalyzer.anatomy.tip.${dim.id}`)}
                      </p>
                    )}
                  </div>
                );
              })}
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

          {/* AI Refinement */}
          {isAIEnabled && result && (
            <Card className="p-6 border-violet-500/20 bg-violet-500/5" role="region" aria-label={t("ai.poweredRefinement")}>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <Bot className="size-5 text-violet-500" aria-hidden="true" />
                    {t("ai.poweredRefinement")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("ai.getRefinement")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["clarity", "specificity", "conciseness"] as const).map((goal) => (
                    <Button
                      key={goal}
                      size="sm"
                      variant="outline"
                      isLoading={isAIRefining}
                      onPress={() => refineWithAI(result.prompt, goal).catch(() => {
                        addToast(t("ai.unavailable"), "info");
                      })}
                      className="capitalize text-xs"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
              {aiRefineResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{t("ai.score")}: {aiRefineResult.score}/100</span>
                    <div className="flex gap-2">
                      <CopyButton text={aiRefineResult.refinedPrompt} label={t("common.copy")} />
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={() => {
                          setPrompt(aiRefineResult.refinedPrompt);
                          addToast(t("ai.refinedApplied"), "success");
                        }}
                        className="gap-1.5"
                      >
                        <ArrowRight className="size-3" />
                        {t("common.apply")}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-violet-500/10 bg-background/50 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {aiRefineResult.refinedPrompt}
                  </div>
                  {aiRefineResult.changelog.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t("ai.changesMade")}</p>
                      <ul className="space-y-1">
                        {aiRefineResult.changelog.map((change, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Security Flags */}
          {result.securityFlags.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="size-5" />
                {t("promptAnalyzer.securityAnalysis")}
              </h3>
              <SecurityFlagsList flags={result.securityFlags} />
            </Card>
          )}

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
