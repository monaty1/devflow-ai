"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Progress,
  Tooltip,
} from "@heroui/react";
import {
  Regex,
  Sparkles,
  Search,
  Zap,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  TextCursorInput,
  Play,
  Copy,
  ChevronRight,
  ListRestart,
  Wand2,
} from "lucide-react";
import { useRegexHumanizer } from "@/hooks/use-regex-humanizer";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { RegexGroup } from "@/types/regex-humanizer";

export default function RegexHumanizerPage() {
  const { t } = useTranslation();
  const {
    pattern,
    explanation,
    testResult,
    isExplaining,
    isGenerating,
    setPattern,
    explain,
    generate,
    test,
    reset,
  } = useRegexHumanizer();

  const [testText, setTestText] = useState("john.doe@example.com, test@devflow.ai, invalid-email");
  const [activeTab, setActiveTab] = useState<"explain" | "generate" | "test">("explain");

  const handleTest = useCallback(() => {
    test(pattern, testText);
  }, [pattern, testText, test]);

  const groupColumns: ColumnConfig[] = [
    { name: "INDEX", uid: "index", sortable: true },
    { name: "PATTERN", uid: "pattern" },
    { name: "EXPLANATION", uid: "description" },
  ];

  const renderGroupCell = (group: RegexGroup, columnKey: React.Key) => {
    switch (columnKey) {
      case "index":
        return <span className="font-bold text-primary">#{group.index}</span>;
      case "pattern":
        return <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{group.pattern}</code>;
      case "description":
        return <span className="text-sm">{group.description}</span>;
      default:
        return (group as any)[columnKey];
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Regex}
        gradient="from-pink-500 to-rose-600"
        title={t("regex.title")}
        description={t("regex.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pattern Input & Generation */}
        <Card className="p-6 lg:col-span-2 flex flex-col gap-6">
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as any)}
            variant="underlined"
            classNames={{ tabList: "gap-6", cursor: "w-full bg-primary" }}
          >
            <Tab 
              key="explain" 
              title={
                <div className="flex items-center gap-2">
                  <Search className="size-4" />
                  <span>Explain</span>
                </div>
              }
            />
            <Tab 
              key="generate" 
              title={
                <div className="flex items-center gap-2">
                  <Wand2 className="size-4" />
                  <span>Generate</span>
                </div>
              }
            />
          </Tabs>

          {activeTab === "explain" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Regex Pattern
                </label>
                <textarea
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi"
                  className="h-32 w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner transition-all"
                />
              </div>
              <Button 
                onPress={() => explain(pattern)} 
                isLoading={isExplaining}
                color="primary"
                className="w-full h-12 font-bold shadow-lg shadow-primary/20"
              >
                Analyze Pattern
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Natural Language Description
                </label>
                <textarea
                  placeholder="E.g.: A valid email address with optional plus signs"
                  className="h-32 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      generate(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Press Enter to generate instantly</p>
            </div>
          )}

          {/* Quick Cheat Sheet */}
          <div className="mt-auto border-t border-divider pt-4">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Quick Reference</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { s: "\\d", d: "Digit" }, { s: "\\w", d: "Word" },
                { s: "\\s", d: "Space" }, { s: ".", d: "Any" },
                { s: "^", d: "Start" }, { s: "$", d: "End" }
              ].map(ref => (
                <div key={ref.s} className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded text-[10px] font-mono">
                  <span className="text-primary font-bold">{ref.s}</span>
                  <span className="opacity-60">{ref.d}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-6">
          {explanation ? (
            <>
              {/* Safety & Overview */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 col-span-1 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Safety Score</p>
                  <div className="relative mb-2">
                    <svg className="size-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted" />
                      <circle
                        cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray={201}
                        strokeDashoffset={201 - (201 * (explanation.safetyScore || 0)) / 100}
                        className={cn(
                          "transition-all duration-1000",
                          explanation.isDangerous ? "text-danger" : "text-emerald-500"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                      {explanation.safetyScore}%
                    </div>
                  </div>
                  <StatusBadge variant={explanation.isDangerous ? "danger" : "success"}>
                    {explanation.isDangerous ? "Vulnerable" : "Secure"}
                  </StatusBadge>
                </Card>

                <Card className="p-6 col-span-2">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Info className="size-4 text-primary" />
                    Structural Breakdown
                  </h3>
                  <div className="space-y-3">
                    {explanation.warnings.length > 0 ? (
                      explanation.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                          <AlertTriangle className="size-4 text-amber-600 mt-0.5" />
                          <p className="text-xs text-amber-800 dark:text-amber-200">{w}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <p className="text-xs text-emerald-800 dark:text-emerald-200">No catastrophic backtracking detected.</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <StatusBadge variant="info">{explanation.tokens.length} Tokens</StatusBadge>
                      <StatusBadge variant="purple">{explanation.groups.length} Groups</StatusBadge>
                      {explanation.commonPattern && (
                        <StatusBadge variant="success">{explanation.commonPattern}</StatusBadge>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Dynamic Tabs for Analysis/Test */}
              <Card className="overflow-hidden">
                <Tabs 
                  aria-label="Result Tabs"
                  classNames={{
                    base: "w-full",
                    tabList: "w-full bg-muted/50 rounded-none border-b border-divider",
                    tab: "h-12",
                    cursor: "bg-primary",
                  }}
                >
                  <Tab key="explanation" title="Explanation">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Human Readable Logic</h3>
                        <CopyButton text={explanation.explanation} />
                      </div>
                      <pre className="text-sm font-mono leading-relaxed bg-muted/30 p-4 rounded-xl whitespace-pre-wrap">
                        {explanation.explanation}
                      </pre>
                    </div>
                  </Tab>
                  <Tab key="groups" title="Groups">
                    <div className="p-0">
                      <DataTable
                        columns={groupColumns}
                        data={explanation.groups.map(g => ({ ...g, id: g.index }))}
                        filterField="description"
                        renderCell={renderGroupCell}
                        emptyContent="No capture groups found in this pattern."
                      />
                    </div>
                  </Tab>
                  <Tab key="test" title="Interactive Test">
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Sample Text to Test</label>
                        <textarea
                          value={testText}
                          onChange={(e) => setTestText(e.target.value)}
                          className="h-32 w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <Button onPress={handleTest} color="primary" variant="flat" className="w-full">
                        <Play className="size-4 mr-2" /> Run Test Matches
                      </Button>

                      {testResult && (
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">Matches Found: {testResult.allMatches.length}</span>
                            <StatusBadge variant={testResult.matches ? "success" : "warning"}>
                              {testResult.matches ? "Matching" : "No Matches"}
                            </StatusBadge>
                          </div>
                          
                          {testResult.allMatches.length > 0 && (
                            <div className="max-h-48 overflow-y-auto border border-divider rounded-xl divide-y divide-divider bg-muted/10">
                              {testResult.allMatches.map((m, i) => (
                                <div key={i} className="p-3 text-xs flex flex-col gap-2">
                                  <div className="flex justify-between">
                                    <span className="font-mono bg-primary/10 text-primary px-1.5 rounded">Match {i + 1}</span>
                                    <span className="text-muted-foreground italic">Index: {m.index}</span>
                                  </div>
                                  <p className="font-mono break-all font-bold">"{m.match}"</p>
                                  {Object.keys(m.groups).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {Object.entries(m.groups).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded border border-border/50">
                                          <span className="font-bold opacity-50">{key}:</span>
                                          <span className="font-mono text-primary">{val}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Regex className="size-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready to Decode</h3>
              <p className="text-muted-foreground max-w-xs">
                Paste a complex regex pattern or describe what you need to get a human-friendly analysis.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
