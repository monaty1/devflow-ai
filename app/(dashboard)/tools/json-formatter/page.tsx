"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Tabs,
  Chip,
  TextArea,
} from "@heroui/react";
import {
  Braces,
  AlertCircle,
  Minimize2,
  CheckCircle,
  Trash2,
  Wrench,
  Search,
  Code2,
  Database,
  ArrowRightLeft,
  Fingerprint,
  Copy,
  Plus,
  Minus,
  Bot,
} from "lucide-react";
import { useJsonFormatter } from "@/hooks/use-json-formatter";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { JsonPathResult, JsonFormatMode, JsonDiffResult } from "@/types/json-formatter";

export default function JsonFormatterPage() {
  const { t } = useTranslation();
  const { navigateTo } = useSmartNavigation();

  const {
    input,
    mode,
    result,
    compareInput,
    inputValidation,
    setInput,
    setMode,
    setCompareInput,
    process,
    getPaths,
    toTypeScript,
    compare,
    getDiff,
    loadExample,
    reset,
    applyOutput,
    fix,
  } = useJsonFormatter();

  const { explainJsonWithAI, aiResult: aiJsonResult, isAILoading: isAIAnalyzing } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<"output" | "paths" | "typescript" | "compare">("output");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyPath = useCallback((path: string) => {
    void navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  }, []);

  const pathColumns: ColumnConfig[] = [
    { name: t("table.colPath"), uid: "path", sortable: true },
    { name: t("table.colType"), uid: "type", sortable: true },
    { name: t("table.colValue"), uid: "value" },
  ];

  const renderPathCell = useCallback((item: JsonPathResult, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "path":
        return (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => copyPath(item.path)}
            className="group/path h-auto min-h-0 gap-1.5 px-1 -mx-1"
            aria-label={t("jsonFmt.copyPath", { path: item.path })}
          >
            <code className="text-[11px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">{item.path}</code>
            {copiedPath === item.path ? (
              <CheckCircle className="size-3 text-success shrink-0" />
            ) : (
              <Copy className="size-3 text-muted-foreground opacity-0 group-hover/path:opacity-100 transition-opacity shrink-0" />
            )}
          </Button>
        );
      case "type":
        return (
          <Chip size="sm" variant="primary" className="capitalize text-[9px] font-black h-5">
            {item.type}
          </Chip>
        );
      case "value":
        const valStr = String(item.value);
        return <span className="text-[11px] text-muted-foreground truncate max-w-[250px] inline-block font-mono">{valStr}</span>;
      default:
        return String(item[key as keyof typeof item] ?? "");
    }
  }, [copiedPath, copyPath, t]);

  const paths = useMemo(() => (inputValidation.isValid ? getPaths() : []), [inputValidation.isValid, getPaths]);
  const tsOutput = useMemo(() => (inputValidation.isValid ? toTypeScript("Root") : ""), [inputValidation.isValid, toTypeScript]);
  const isEqual = activeTab === "compare" && compareInput ? compare() : null;
  const diffResult: JsonDiffResult | null = activeTab === "compare" && compareInput && input ? getDiff() : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Braces}
        gradient="from-amber-500 to-orange-600"
        title={t("jsonFmt.title")}
        description={t("jsonFmt.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <ArrowRightLeft className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="json-formatter" input={input} output={result?.output || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Database className="size-4 text-primary" />
                {t("jsonFmt.rawPayload")}
              </h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onPress={() => loadExample("complex")}>{t("jsonFmt.example")}</Button>
                <Button size="sm" variant="ghost" aria-label={t("jsonFmt.clearInput")} onPress={() => setInput("")}><Trash2 className="size-3.5 text-danger" /></Button>
              </div>
            </div>
            
            <div className="relative group">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("jsonFmt.pasteJson")}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    process();
                  }
                }}
                className={cn(
                  "h-80 w-full resize-none rounded-2xl border p-4 font-mono text-xs focus:ring-2 transition-all shadow-inner leading-relaxed",
                  input && !inputValidation.isValid ? "border-danger ring-danger/10 bg-danger/5" : "border-divider focus:ring-primary/20 bg-background"
                )}
                spellCheck={false}
                aria-label={t("jsonFmt.pasteJson")}
              />
              {!inputValidation.isValid && input && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <StatusBadge variant="error">{t("jsonFmt.errorBadge")}</StatusBadge>
                </div>
              )}
            </div>

            {!inputValidation.isValid && input && (
              <div className="mt-4 p-4 bg-danger/10 rounded-2xl border border-danger/20 space-y-3">
                <div className="flex items-center gap-2 text-danger text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="size-4" />
                  {t("jsonFmt.syntaxFailure")}
                </div>
                <p className="text-xs text-danger/80 font-medium italic">
                  L{inputValidation.error?.line} C{inputValidation.error?.column}: {inputValidation.error?.message}
                </p>
                <Button size="sm" variant="danger" className="w-full font-black shadow-lg shadow-danger/20" onPress={fix}>
                  <Wrench className="size-3.5 mr-2" /> {t("jsonFmt.autoRepair")}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="primary" className="font-black h-12 text-md shadow-xl shadow-primary/20" onPress={() => { setMode("format"); process(); }}>
                <Braces className="size-4 mr-2" /> {t("jsonFmt.formatBtn")}
              </Button>
              <Button variant="ghost" className="font-black h-12 text-md text-primary" onPress={() => { setMode("minify"); process(); }}>
                <Minimize2 className="size-4 mr-2" /> {t("jsonFmt.minifyBtn")}
              </Button>
            </div>
            {isAIEnabled && (
              <Button
                variant="ghost"
                className="w-full mt-3 font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/10"
                isLoading={isAIAnalyzing}
                isDisabled={!inputValidation.isValid || !input.trim()}
                onPress={() => {
                  explainJsonWithAI(input).catch(() => {
                    addToast(t("ai.unavailableLocal"), "info");
                  });
                }}
              >
                <Bot className="size-4 mr-2" /> {t("jsonFmt.aiAnalyzeBtn")}
              </Button>
            )}
            <p className="text-[9px] text-muted-foreground text-center mt-2 font-medium">
              Ctrl+Enter → {t("jsonFmt.formatBtn")}
            </p>
          </Card>

          {/* Luxury Analytics Card */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-blue-500/10 dark:from-orange-500/15 dark:to-blue-500/15 shadow-xl shadow-primary/5 border border-default-200 dark:border-default-100">
            <h3 className="text-xs font-black uppercase text-muted-foreground mb-6 flex items-center gap-2 tracking-widest">
              <Fingerprint className="size-3 text-orange-500 dark:text-orange-400" />
              {t("jsonFmt.fingerprint")}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60">{t("jsonFmt.uniqueKeys")}</p>
                <p className="text-2xl font-black text-orange-500 dark:text-orange-400">{result?.stats.keys || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60">{t("jsonFmt.depthLevel")}</p>
                <p className="text-2xl font-black text-blue-500 dark:text-blue-400">{result?.stats.depth || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60">{t("jsonFmt.byteSize")}</p>
                <p className="text-sm font-black uppercase">{((result?.stats.sizeBytes || 0) / 1024).toFixed(2)} KB</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60">{t("jsonFmt.nodeDensity")}</p>
                <p className="text-sm font-black uppercase">{result?.stats.values || 0} items</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-default-200 space-y-3">
               <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground/60">
                  <span>{t("jsonFmt.formattingEfficiency")}</span>
                  <span>{Math.round(((result?.stats.minifiedSize || 0) / (result?.stats.sizeBytes || 1)) * 100)}%</span>
               </div>
               <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 dark:bg-orange-400"
                    style={{ width: `${Math.min(100, ((result?.stats.minifiedSize || 0) / (result?.stats.sizeBytes || 1)) * 100)}%` }}
                  />
               </div>
            </div>
          </Card>

          {/* AI Analysis Results */}
          {isAIEnabled && (isAIAnalyzing || aiJsonResult) && (
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 shadow-xl shadow-violet-500/5 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="size-4 text-violet-500" aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("jsonFmt.aiAnalysis")}</span>
                {isAIAnalyzing && (
                  <span className="text-xs text-muted-foreground animate-pulse ml-auto">{t("ai.generating")}</span>
                )}
              </div>
              {aiJsonResult && aiJsonResult.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl space-y-2 mb-3 last:mb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{s.value}</p>
                    <CopyButton text={s.value} size="sm" variant="ghost" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.reasoning}</p>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Results View */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs
            selectedKey={activeTab as string}
            onSelectionChange={(k) => setActiveTab(k as typeof activeTab)}
            variant="primary"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs.ListContainer>
                <Tabs.List aria-label={t("jsonFmt.ariaJsonViews")}>
                  <Tabs.Tab id="output">{t("jsonFmt.outputTab")}</Tabs.Tab>
                  <Tabs.Tab id="paths">{t("jsonFmt.pathExplorer")}</Tabs.Tab>
                  <Tabs.Tab id="typescript">{t("jsonFmt.schemaTab")}</Tabs.Tab>
                  <Tabs.Tab id="compare">{t("jsonFmt.diffAnalysis")}</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button size="sm" variant="ghost" className="font-bold flex-1 sm:flex-none" onPress={() => navigateTo("dto-matic", input)}>
                  <Code2 className="size-3.5 mr-1.5 text-secondary" /> {t("jsonFmt.architectLayer")}
                </Button>
                <Button size="sm" variant="ghost" className="font-bold flex-1 sm:flex-none" onPress={applyOutput} isDisabled={!result?.output}>
                  <ArrowRightLeft className="size-3.5 mr-1.5 text-primary" /> {t("jsonFmt.setAsInput")}
                </Button>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Tabs.Panel id="output">
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[650px] flex flex-col">
                <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                  <div className="flex gap-1">
                    {["format", "minify", "to-yaml", "to-xml", "to-csv"].map((m) => (
                      <Button 
                        key={m} 
                        size="sm" 
                        variant={mode === m ? "primary" : "ghost"} 
                        onPress={() => { setMode(m as JsonFormatMode); process(); }}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-tighter"
                      >
                        {m.includes("-") ? m.split("-")[1] : m}
                      </Button>
                    ))}
                  </div>
                  <CopyButton text={result?.output || ""} />
                </div>
                <div className="flex-1 overflow-auto bg-background relative group">
                  {result?.output ? (
                    <pre className="p-4 font-mono text-[11px] leading-relaxed">
                      <code>{result.output.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="inline-block w-10 pr-3 text-right text-muted-foreground/40 select-none shrink-0">{i + 1}</span>
                          <span>{line}</span>
                        </div>
                      ))}</code>
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                      <Braces className="size-12 mb-3" />
                      <p className="text-sm font-bold">{t("jsonFmt.formatHint")}</p>
                    </div>
                  )}
                  {result && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <StatusBadge variant="info">{t("jsonFmt.prettyPrinted")}</StatusBadge>
                    </div>
                  )}
                </div>
              </Card>
              </Tabs.Panel>

              <Tabs.Panel id="paths">
              <Card className="p-0 overflow-hidden shadow-xl border-divider min-h-[650px]">
                <div className="p-4 border-b border-divider bg-muted/20 flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest">{t("jsonFmt.objectHierarchy")}</span>
                </div>
                <DataTable
                  columns={pathColumns}
                  data={paths.map((p) => ({ ...p, id: p.path }))}
                  filterField="path"
                  renderCell={renderPathCell}
                  initialVisibleColumns={["path", "type", "value"]}
                  emptyContent={t("jsonFmt.enterValidPaths")}
                />
              </Card>
              </Tabs.Panel>

              <Tabs.Panel id="typescript">
              <Card className="p-0 border-divider shadow-xl overflow-hidden h-[650px] flex flex-col border-none">
                <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">{t("jsonFmt.tsDefinition")}</span>
                  <CopyButton text={tsOutput} />
                </div>
                <div className="flex-1 bg-muted/30 dark:bg-muted/50 p-8 overflow-auto">
                  <pre className="font-mono text-xs leading-relaxed text-primary">
                    <code>{tsOutput}</code>
                  </pre>
                </div>
              </Card>
              </Tabs.Panel>

              <Tabs.Panel id="compare">
              <div className="grid gap-6">
                <Card className="p-6 border-divider shadow-md">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                    <ArrowRightLeft className="size-4" />
                    {t("jsonFmt.comparisonTarget")}
                  </h3>
                  <TextArea
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value)}
                    placeholder={t("jsonFmt.pasteDiffJson")}
                    className="h-48 w-full resize-none rounded-2xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
                    aria-label={t("jsonFmt.comparisonTarget")}
                  />
                </Card>

                {compareInput && isEqual !== null && (
                  <Card className={cn(
                    "p-4 flex items-center gap-3 border-2 transition-all duration-500",
                    isEqual ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-400" : "bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-950/10 dark:border-danger-900/30 dark:text-danger-400"
                  )}>
                    {isEqual ? (
                      <>
                        <CheckCircle className="size-5 shrink-0" />
                        <span className="font-black text-sm">{t("jsonFmt.identityMatch")}</span>
                        <span className="text-xs opacity-70 hidden sm:inline">— {t("jsonFmt.identityMatchDesc")}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-5 shrink-0" />
                        <span className="font-black text-sm">{t("jsonFmt.divergence")}</span>
                        {diffResult && (
                          <span className="text-xs opacity-70 hidden sm:inline ml-auto flex items-center gap-3">
                            <span className="flex items-center gap-1"><Plus className="size-3" aria-hidden="true" />{diffResult.addedCount} {t("jsonFmt.diffAdded")}</span>
                            <span className="flex items-center gap-1"><Minus className="size-3" aria-hidden="true" />{diffResult.removedCount} {t("jsonFmt.diffRemoved")}</span>
                          </span>
                        )}
                      </>
                    )}
                  </Card>
                )}

                {diffResult && !isEqual && (
                  <Card className="p-0 overflow-hidden shadow-xl border-divider">
                    <div className="p-3 border-b border-divider bg-muted/20 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("jsonFmt.lineDiff")}</span>
                      <div className="flex gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Plus className="size-3" aria-hidden="true" />{diffResult.addedCount}</span>
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><Minus className="size-3" aria-hidden="true" />{diffResult.removedCount}</span>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-auto">
                      <pre className="text-[11px] font-mono leading-relaxed">
                        {diffResult.lines.map((line, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex px-4 border-l-3",
                              line.status === "added" && "bg-emerald-50 dark:bg-emerald-950/20 border-l-emerald-500 text-emerald-800 dark:text-emerald-300",
                              line.status === "removed" && "bg-red-50 dark:bg-red-950/20 border-l-red-500 text-red-800 dark:text-red-300",
                              line.status === "unchanged" && "border-l-transparent"
                            )}
                          >
                            <span className="inline-block w-8 pr-2 text-right text-muted-foreground/40 select-none shrink-0">
                              {line.status === "added" ? "" : line.lineNumber}
                            </span>
                            <span className="inline-block w-8 pr-2 text-right text-muted-foreground/40 select-none shrink-0">
                              {line.status === "removed" ? "" : line.otherLineNumber}
                            </span>
                            <span className="inline-block w-4 text-center select-none shrink-0 font-bold">
                              {line.status === "added" ? "+" : line.status === "removed" ? "−" : " "}
                            </span>
                            <span className="flex-1 whitespace-pre">{line.content}</span>
                          </div>
                        ))}
                      </pre>
                    </div>
                  </Card>
                )}
              </div>
              </Tabs.Panel>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
