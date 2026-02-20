"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  TextArea,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import {
  RotateCcw,
  AlertTriangle,
  Info,
  Search,
  Zap,
  ShieldAlert,
  MoreVertical,
  Wand2,
  FileCode,
  Sparkles,
  Bot,
} from "lucide-react";
import { useCodeReview } from "@/hooks/use-code-review";
import { useAICodeReview } from "@/hooks/use-ai-code-review";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { CodeReviewSkeleton, AISectionSkeleton } from "@/components/shared/skeletons";
import type { SupportedLanguage, CodeIssue } from "@/types/code-review";
import type { ToolRoute } from "@/hooks/use-smart-navigation";

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "php", label: "PHP" },
  { value: "csharp", label: "C#" },
];

export default function CodeReviewPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const { result, isReviewing, review, reset } = useCodeReview();
  const { reviewWithAI, aiResult, isAILoading, aiError } = useAICodeReview();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();

  const handleReview = async () => {
    if (!code.trim()) {
      addToast(t("codeReview.toastEnterCode"), "warning");
      return;
    }

    try {
      // Run local analysis first (instant)
      const reviewResult = await review(code, language);
      const criticalCount = reviewResult.issues.filter(
        (i) => i.severity === "critical"
      ).length;

      if (criticalCount > 0) {
        addToast(t("codeReview.toastCritical", { count: criticalCount }), "error");
      } else if (reviewResult.overallScore >= 80) {
        addToast(t("codeReview.toastGreat"), "success");
      }

      // Fire AI request in parallel (if enabled)
      if (isAIEnabled) {
        reviewWithAI(code, language).catch(() => {
          addToast(t("ai.unavailableLocal"), "info");
        });
      }
    } catch {
      addToast(t("codeReview.toastFailed"), "error");
    }
  };

  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");

  const filteredIssues = useMemo(() => {
    if (!result) return [];
    if (severityFilter === "all") return result.issues;
    return result.issues.filter((i) => i.severity === severityFilter);
  }, [result, severityFilter]);

  const severityCounts = useMemo(() => {
    if (!result) return { critical: 0, warning: 0, info: 0 };
    return {
      critical: result.issues.filter((i) => i.severity === "critical").length,
      warning: result.issues.filter((i) => i.severity === "warning").length,
      info: result.issues.filter((i) => i.severity === "info").length,
    };
  }, [result]);

  const handleReset = () => {
    setCode("");
    setLanguage("typescript");
    setSeverityFilter("all");
    reset();
  };

  const issueColumns: ColumnConfig[] = [
    { name: t("table.colLine"), uid: "line", sortable: true },
    { name: t("table.colIssue"), uid: "message", sortable: true },
    { name: t("table.colSeverity"), uid: "severity", sortable: true },
    { name: t("table.colActions"), uid: "actions" },
  ];

  const renderIssueCell = useCallback((issue: CodeIssue, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "line":
        return <span className="font-mono text-muted-foreground text-xs font-bold bg-muted px-1.5 py-0.5 rounded">L{issue.line}</span>;
      case "message":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{issue.message}</span>
            {issue.suggestion && (
              <span className="text-xs text-primary/70 italic flex items-center gap-1">
                <Wand2 className="size-3" /> {issue.suggestion}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold opacity-40 mt-1">{issue.category}</span>
          </div>
        );
      case "severity":
        const severityMap = {
          critical: { color: "danger" as const, icon: ShieldAlert },
          warning: { color: "warning" as const, icon: AlertTriangle },
          info: { color: "accent" as const, icon: Info },
        } as const;
        const config = severityMap[issue.severity as keyof typeof severityMap];
        const Icon = config.icon;
        return (
          <Chip
            size="sm"
            color={config.color}
            variant="soft"
            className="capitalize font-bold h-6"
          >
            <div className="flex items-center gap-1">
              <Icon className="size-3" />
              {issue.severity}
            </div>
          </Chip>
        );
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="ghost" aria-label={t("codeReview.issueActions")}>
                <MoreVertical className="size-4 text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={t("codeReview.ariaIssueActions")}>
              <DropdownItem 
                key="wizard" 
                onPress={() => navigateTo("variable-name-wizard" as ToolRoute, issue.message)}
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="size-3" />
                  <span>{t("codeReview.improveNames")}</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return String(issue[key as keyof typeof issue] ?? "");
    }
  }, [navigateTo, t]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <ToolHeader
        icon={FileCode}
        gradient="from-red-500 to-rose-600"
        title={t("codeReview.title")}
        description={t("codeReview.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={handleReset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="code-review" input={code} output={result?.refactoredCode || ""} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Panel */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileCode className="size-5 text-primary" />
              {t("codeReview.codeInput")}
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Select
                  value={language}
                  onChange={(value) => { if (value) setLanguage(value as SupportedLanguage); }}
                  className="w-full"
                  aria-label={t("codeReview.language")}
                >
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("codeReview.language")}
                  </Label>
                  <Select.Trigger className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {LANGUAGES.map((lang) => (
                        <ListBox.Item key={lang.value} id={lang.value} textValue={lang.label}>
                          {lang.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("codeReview.linesLabel")}
                </label>
                <div className="h-10 flex items-center px-3 bg-muted/30 rounded-xl border border-border/50 font-mono text-sm">
                  {code.split("\n").length}
                </div>
              </div>
            </div>

            <TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("codeReview.placeholder")}
              className="h-[400px] w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner transition-all"
              spellCheck={false}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (code.trim()) handleReview();
                }
              }}
              aria-label={t("codeReview.placeholder")}
            />

            <Button
              onPress={handleReview}
              isLoading={isReviewing}
              isDisabled={!code.trim()}
              variant="primary"
              className="h-12 text-md font-bold shadow-lg shadow-primary/20"
            >
              <Sparkles className="mr-2 size-5" />
              {t("codeReview.reviewCode")}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-6">
          {isReviewing ? (
            <CodeReviewSkeleton />
          ) : result ? (
            <>
              {/* Score & Metrics Dashboard */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 col-span-1 flex flex-col items-center justify-center text-center bg-gradient-to-br from-background to-muted/50">
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {t("codeReview.overallScore")}
                  </p>
                  <div className="relative" role="img" aria-label={`${t("codeReview.overallScore")}: ${result.overallScore}%`}>
                     <svg className="size-24 transform -rotate-90" aria-hidden="true">
                        <circle
                          cx="48" cy="48" r="40"
                          stroke="currentColor" strokeWidth="8" fill="transparent"
                          className="text-muted"
                        />
                        <circle
                          cx="48" cy="48" r="40"
                          stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * result.overallScore) / 100}
                          className={cn(
                            "transition-all duration-1000",
                            result.overallScore >= 80 ? "text-emerald-500" : result.overallScore >= 50 ? "text-amber-500" : "text-red-500"
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                        {result.overallScore}
                      </div>
                  </div>
                </Card>

                <Card className="p-6 col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase cursor-help" title="Cyclomatic complexity: number of independent code paths. Optimal: ≤ 10. High values make code harder to test.">{t("codeReview.complexity")} ⓘ</p>
                      <p className="text-xl font-bold flex items-center gap-2">
                        {result.metrics.complexity}
                        <StatusBadge variant={result.metrics.complexity > 10 ? "warning" : "success"}>
                          {result.metrics.complexity > 10 ? t("codeReview.high") : t("codeReview.optimal")}
                        </StatusBadge>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase cursor-help" title="Maintainability Index (0–100): composite score based on complexity, lines of code, and documentation coverage. Higher is better.">{t("codeReview.maintainability")} ⓘ</p>
                      <p className="text-xl font-bold text-emerald-500">{result.metrics.maintainabilityIndex}%</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{t("codeReview.docCoverage")}</span>
                      <span>{Math.round((result.metrics.commentLines / result.metrics.totalLines) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary" 
                        style={{ width: `${Math.round((result.metrics.commentLines / result.metrics.totalLines) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Issues DataTable */}
              <Card className="p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="size-5 text-danger" />
                    {t("codeReview.auditFindings")}
                  </h3>
                  <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t("codeReview.filterBySeverity")}>
                    {([
                      { key: "all" as const, label: `${t("common.all")} (${result.issues.length})`, icon: null, activeVariant: "primary" as const },
                      ...(severityCounts.critical > 0 ? [{ key: "critical" as const, label: `${t("codeReview.critical")} (${severityCounts.critical})`, icon: ShieldAlert, activeVariant: "danger" as const }] : []),
                      ...(severityCounts.warning > 0 ? [{ key: "warning" as const, label: `${t("codeReview.warnings")} (${severityCounts.warning})`, icon: AlertTriangle, activeVariant: "outline" as const }] : []),
                      ...(severityCounts.info > 0 ? [{ key: "info" as const, label: `${t("codeReview.infoLabel")} (${severityCounts.info})`, icon: Info, activeVariant: "outline" as const }] : []),
                    ]).map((filter) => {
                      const FilterIcon = filter.icon;
                      const isActive = severityFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          onClick={() => setSeverityFilter(filter.key)}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 h-7 rounded-lg text-xs font-bold transition-colors",
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {FilterIcon && <FilterIcon className="size-3" aria-hidden="true" />}
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <DataTable
                  columns={issueColumns}
                  data={filteredIssues.map((issue, idx) => ({ ...issue, id: `${issue.line}-${issue.column}-${idx}` }))}
                  filterField="message"
                  renderCell={renderIssueCell}
                  emptyContent={t("codeReview.noIssues")}
                />
              </Card>

              {/* AI Deep Analysis */}
              {isAIEnabled && isAILoading && !aiResult && (
                <AISectionSkeleton />
              )}
              {isAIEnabled && aiResult && (
                <Card className="p-6 border-violet-500/20 bg-violet-500/5 shadow-xl shadow-violet-500/5" role="region" aria-label={t("ai.deepAnalysis")}>
                  <div className="mb-4 flex items-center gap-2">
                    <Bot className="size-5 text-violet-500" aria-hidden="true" />
                    <h3 className="font-bold text-lg">{t("ai.deepAnalysis")}</h3>
                    {aiError && (
                      <span className="text-xs text-danger ml-auto">{t("ai.unavailable")}</span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("ai.score")}</p>
                        <p className={cn(
                          "text-2xl font-black",
                          aiResult.score >= 80 ? "text-emerald-500" : aiResult.score >= 50 ? "text-amber-500" : "text-red-500"
                        )}>{aiResult.score}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t("ai.suggestions")}</p>
                        <ul className="space-y-1">
                          {aiResult.suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {aiResult.issues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">{t("ai.detectedIssues")}</p>
                        {aiResult.issues.slice(0, 5).map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 bg-background/50 rounded-lg border border-violet-500/10">
                            <Chip size="sm" color={issue.severity === "critical" ? "danger" : issue.severity === "warning" ? "warning" : "default"} variant="soft" className="capitalize text-[10px] h-5">
                              {issue.severity}
                            </Chip>
                            <div>
                              <p className="font-medium">{issue.message}</p>
                              {issue.suggestion && <p className="text-muted-foreground italic mt-0.5">{issue.suggestion}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiResult.refactoredCode && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase">{t("ai.refactoredCode")}</p>
                          <div className="flex gap-2">
                            <CopyButton text={aiResult.refactoredCode} label={t("common.copy")} />
                            <Button size="sm" variant="primary" onPress={() => {
                              setCode(aiResult.refactoredCode);
                              addToast(t("ai.codeApplied"), "success");
                            }}>{t("ai.applyAICode")}</Button>
                          </div>
                        </div>
                        <pre className="rounded-xl border border-violet-500/10 bg-background/80 p-4 font-mono text-xs leading-relaxed overflow-auto max-h-[200px]">
                          <code>{aiResult.refactoredCode}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Smart Refactor Preview */}
              {result.refactoredCode && (
                <Card className="p-6 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 font-bold text-lg">
                        <Zap className="size-5 text-primary fill-primary/20" />
                        {t("codeReview.seniorRefactor")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t("codeReview.refactorDesc")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <CopyButton text={result.refactoredCode} label={t("common.copy")} />
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={() => {
                          setCode(result.refactoredCode!);
                          addToast(t("codeReview.toastRefactoredApplied"), "success");
                        }}
                        className="font-bold"
                      >
                        {t("codeReview.applyChanges")}
                      </Button>
                    </div>
                  </div>
                  <pre className="rounded-xl border border-primary/10 bg-background/80 p-5 font-mono text-sm leading-relaxed overflow-auto max-h-[300px] shadow-inner">
                    <code>{result.refactoredCode}</code>
                  </pre>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20">
              <div className="text-center">
                <div className="size-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="size-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("codeReview.emptyState")}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {t("codeReview.emptyStateHint")}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
