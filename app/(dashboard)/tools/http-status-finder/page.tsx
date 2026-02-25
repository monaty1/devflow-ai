"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Chip,
  Input,
} from "@heroui/react";
import {
  Globe,
  Search,
  RotateCcw,
  ExternalLink,
  Terminal,
  X,
  ChevronRight,
  HelpCircle,
  Activity,
  Info,
  Server,
  History,
  LayoutGrid,
  List,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useHttpStatusFinder } from "@/hooks/use-http-status-finder";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCategoryInfo } from "@/lib/application/http-status-finder";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import type { HttpStatusCode, HttpStatusCategory } from "@/types/http-status-finder";

const CATEGORY_COLORS: Record<HttpStatusCategory, string> = {
  "1xx": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "2xx": "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200",
  "3xx": "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
  "4xx": "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  "5xx": "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
};

export default function HttpStatusFinderPage() {
  const { t } = useTranslation();
  const {
    query,
    categoryFilter,
    results,
    commonCodes,
    selectedCode,
    setQuery,
    setCategoryFilter,
    setSelectedCode,
    clearSearch,
  } = useHttpStatusFinder();

  const [searchInput, setSearchInput] = useState(query);
  const [activeView, setActiveView] = useState<"grid" | "table">("grid");
  const { explainHttpStatusWithAI, aiResult, isAILoading, aiError } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setQuery]);
  const [testResponse, setTestResult] = useState<{ headers: Record<string, string>; time: number; ok: boolean } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const statusColumns: ColumnConfig[] = [
    { name: t("table.colCode"), uid: "code", sortable: true },
    { name: t("table.colName"), uid: "name", sortable: true },
    { name: t("table.colCategory"), uid: "category", sortable: true },
    { name: t("table.colDescription"), uid: "description" },
  ];

  const renderStatusCell = useCallback((status: HttpStatusCode, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "code":
        return (
          <span className={cn("font-mono font-black text-sm px-2 py-1 rounded-lg", CATEGORY_COLORS[status.category])}>
            {status.code}
          </span>
        );
      case "name":
        return <span className="font-bold text-sm">{status.name}</span>;
      case "category":
        return <span className="text-[10px] font-black uppercase opacity-60">{getCategoryInfo(status.category).label}</span>;
      case "description":
        return <span className="text-xs text-muted-foreground line-clamp-1">{status.description}</span>;
      default:
        return String(status[key as keyof typeof status] ?? "");
    }
  }, []);

  const runMockTest = (code: number) => {
    setIsTesting(true);
    const start = Date.now();
    // Simulate response using local data (avoids CORS issues with external APIs)
    setTimeout(() => {
      const ok = code >= 200 && code < 400;
      const headers: Record<string, string> = {
        "content-type": "application/json; charset=utf-8",
        "x-status-code": String(code),
        "x-simulated": "true",
        "cache-control": code === 200 ? "public, max-age=3600" : "no-cache",
        ...(code === 301 || code === 302 ? { location: "https://example.com/redirected" } : {}),
        ...(code === 401 ? { "www-authenticate": "Bearer realm=\"api\"" } : {}),
        ...(code === 429 ? { "retry-after": "60" } : {}),
      };
      setTestResult({ headers, time: Date.now() - start, ok });
      setIsTesting(false);
    }, 150 + Math.random() * 200);
  };

  const displayCodes = useMemo(() => 
    query.trim() || categoryFilter ? results.codes : commonCodes
  , [query, categoryFilter, results.codes, commonCodes]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Globe}
        gradient="from-cyan-500 to-blue-600"
        title={t("httpStatus.title")}
        description={t("httpStatus.description")}
        breadcrumb
        actions={
          <div className="flex gap-2">
            <div className="flex bg-muted p-1 rounded-xl">
              <Button isIconOnly size="sm" variant={activeView === "grid" ? "primary" : "ghost"} onPress={() => setActiveView("grid")} aria-label={t("httpStatus.ariaGridView")}><LayoutGrid className="size-3.5" /></Button>
              <Button isIconOnly size="sm" variant={activeView === "table" ? "primary" : "ghost"} onPress={() => setActiveView("table")} aria-label={t("httpStatus.ariaTableView")}><List className="size-3.5" /></Button>
            </div>
            <Button variant="outline" size="sm" onPress={clearSearch} className="gap-2 font-bold">
              <RotateCcw className="size-4" /> {t("httpStatus.resetBtn")}
            </Button>
          </div>
        }
      />

      <ToolSuggestions toolId="http-status-finder" input={searchInput} output={selectedCode?.description || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Search & Selector Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-foreground/80 uppercase text-[10px] tracking-widest">
              <Search className="size-4 text-primary" />
              {t("httpStatus.smartNavigator")}
            </h3>
            <Input
              placeholder={t("httpStatus.searchHint")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              variant="primary"
              className="font-bold text-sm"
            />
            <div className="grid grid-cols-5 gap-2 mt-6" role="radiogroup" aria-label={t("httpStatus.filterByCategory")}>
              {["1xx", "2xx", "3xx", "4xx", "5xx"].map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? "primary" : "ghost"}
                  onPress={() => setCategoryFilter(categoryFilter === cat ? null : cat as HttpStatusCategory)}
                  className="text-[10px] font-black uppercase"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </Card>

          {/* Decision Wizard Card */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 dark:from-cyan-500/15 dark:to-violet-500/15 shadow-2xl shadow-primary/5 border border-default-200 dark:border-default-100">
            <h3 className="text-xs font-black uppercase text-muted-foreground mb-6 flex items-center gap-2 tracking-widest">
              <HelpCircle className="size-3 text-cyan-500 dark:text-cyan-400" /> {t("httpStatus.decisionPipeline")}
            </h3>
            <div className="space-y-4">
              {[
                { q: t("httpStatus.decisionQ1"), a: "304" },
                { q: t("httpStatus.decisionQ2"), a: "401" },
                { q: t("httpStatus.decisionQ3"), a: "403" },
                { q: t("httpStatus.decisionQ4"), a: "413" },
                { q: t("httpStatus.decisionQ5"), a: "502" },
              ].map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onPress={() => setSearchInput(item.a)}
                  className="flex justify-between items-center bg-muted/50 p-3 h-auto rounded-xl border border-default-200 group hover:bg-muted w-full"
                >
                  <span className="text-[10px] font-bold text-foreground/80">{item.q}</span>
                  <ChevronRight className="size-3 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase text-cyan-500 dark:text-cyan-400">{item.a}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Header Card */}
              <Card className="p-10 relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 -mr-10 -mt-10 rounded-full", CATEGORY_COLORS[selectedCode.category].split(" ")[0])} />
                <div className="flex flex-col sm:flex-row justify-between gap-8 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className={cn("size-32 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl transform hover:rotate-3 transition-transform", CATEGORY_COLORS[selectedCode.category])}>
                      {selectedCode.code}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-black tracking-tight">{selectedCode.name}</h2>
                        <CopyButton text={selectedCode.code.toString()} variant="ghost" size="sm" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <StatusBadge variant="info">{getCategoryInfo(selectedCode.category).label.toUpperCase()}</StatusBadge>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{t("httpStatus.rfcCompliant")}</span>
                      </div>
                    </div>
                  </div>
                  <Button isIconOnly variant="ghost" onPress={() => setSelectedCode(null)} className="shadow-lg rounded-full h-10 w-10 min-w-0" aria-label={t("httpStatus.ariaClose")}><X className="size-5 text-danger" /></Button>
                </div>

                <div className="mt-12 grid gap-10 sm:grid-cols-2 border-t border-divider pt-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Info className="size-3" /> {t("httpStatus.descriptionHeader")}
                    </label>
                    <p className="text-sm font-medium leading-relaxed opacity-80">{selectedCode.description}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Activity className="size-3" /> {t("httpStatus.usageContext")}
                    </label>
                    <p className="text-sm font-medium leading-relaxed opacity-80">{selectedCode.whenToUse}</p>
                  </div>
                </div>
              </Card>

              {/* Related Headers & Links Row */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                    <History className="size-4 text-primary" /> {t("httpStatus.associatedHeaders")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCode.relatedHeaders?.length ? selectedCode.relatedHeaders.map(h => (
                      <Chip key={h} variant="primary" color="default" className="font-mono text-[10px] font-bold">{h}</Chip>
                    )) : <p className="text-xs italic opacity-40">{t("httpStatus.noHeaders")}</p>}
                  </div>
                  <div className="mt-8 pt-6 border-t border-divider flex gap-3">
                    {selectedCode.rfcLink && (
                      <Button size="sm" variant="outline" className="font-bold flex-1" onPress={() => window.open(selectedCode.rfcLink, "_blank")}>
                        <ExternalLink className="size-3.5 mr-2" /> {t("httpStatus.rfcDocs")}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="font-bold flex-1" onPress={() => window.open(`https://http.cat/${selectedCode.code}`, "_blank")}>
                      🐱 {t("httpStatus.httpCat")}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/15 dark:to-cyan-500/15 shadow-xl overflow-hidden relative border border-default-200 dark:border-default-100">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Server className="size-20" /></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Activity className="size-4 text-emerald-500 dark:text-emerald-400" />
                      {t("httpStatus.liveSimulation")}
                    </h3>
                    <Button size="sm" variant="primary" className="font-black h-8 bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30" onPress={() => runMockTest(selectedCode.code)} isLoading={isTesting}>
                      {t("httpStatus.triggerResponse")}
                    </Button>
                  </div>
                  {testResponse ? (
                    <div className="space-y-4 animate-in fade-in duration-500 relative z-10">
                      <div className="flex justify-between items-center px-1">
                        <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded", testResponse.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                          {testResponse.ok ? t("httpStatus.httpOk") : t("httpStatus.errorSignal")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">{testResponse.time}ms</span>
                      </div>
                      <div className="p-4 bg-muted/80 dark:bg-muted rounded-2xl font-mono text-[10px] h-40 overflow-auto border border-default-200 scrollbar-hide">
                        {Object.entries(testResponse.headers).map(([k, v]) => (
                          <div key={k} className="mb-1.5 flex gap-2">
                            <span className="text-muted-foreground/50 shrink-0 capitalize">{k}:</span>
                            <span className="text-emerald-600 dark:text-emerald-400/80 break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-default-200 rounded-2xl text-center p-6 relative z-10">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{t("httpStatus.awaitingExecution")}</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Implementation Snippets */}
              <Card className="p-8">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <Terminal className="size-5 text-primary" />
                  {t("httpStatus.codeImpl")}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedCode.snippets ? Object.entries(selectedCode.snippets).map(([lang, code]) => (
                    <div key={lang} className="space-y-2 group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter group-hover:text-primary transition-colors">{lang}</span>
                        <CopyButton text={code} size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <pre className="p-4 bg-muted/30 rounded-2xl font-mono text-[10px] border border-divider overflow-x-auto h-32 scrollbar-hide">
                        <code>{code}</code>
                      </pre>
                    </div>
                  )) : (
                    <div className="col-span-full p-10 bg-muted/10 border-2 border-dashed border-divider rounded-3xl text-center">
                      <p className="text-sm italic opacity-40">{t("httpStatus.genericResponse")}</p>
                    </div>
                  )}
                </div>
              </Card>

              {isAIEnabled && (
                <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-500/20 dark:border-violet-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase text-violet-600 dark:text-violet-400 flex items-center gap-2 tracking-widest">
                      <Bot className="size-3" /> {t("httpStatus.aiExpert")}
                    </h3>
                    <Button
                      size="sm"
                      variant="primary"
                      className="font-bold bg-violet-600 hover:bg-violet-700 border-none shadow-lg shadow-violet-500/20 dark:shadow-violet-500/30"
                      onPress={() => {
                        void explainHttpStatusWithAI(`${selectedCode.code} ${selectedCode.name}: ${selectedCode.description}. When to use: ${selectedCode.whenToUse}`);
                      }}
                      isLoading={isAILoading}
                    >
                      <Bot className="size-4 mr-2" /> {t("httpStatus.aiAskExpert")}
                    </Button>
                  </div>
                  {isAILoading && (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-violet-500/20 rounded w-3/4" />
                      <div className="h-3 bg-violet-500/20 rounded w-1/2" />
                      <div className="h-3 bg-violet-500/20 rounded w-2/3" />
                    </div>
                  )}
                  {aiResult?.suggestions && aiResult.suggestions.length > 0 && !isAILoading && (
                    <div className="space-y-3">
                      {aiResult.suggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-background/80 rounded-xl border border-violet-500/10 dark:border-violet-500/20">
                          <p className="text-sm font-medium leading-relaxed">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-2 italic">{s.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {isAIEnabled && aiError && (
                <Card className="p-3 border-danger/30 bg-danger/5" role="alert">
                  <p className="text-xs text-danger font-bold flex items-center gap-2">
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                    {t("ai.errorOccurred", { message: aiError.message })}
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  {query.trim() || categoryFilter ? t("httpStatus.searchResultsTitle") : t("httpStatus.mostCommonTitle")}
                </h2>
                {displayCodes.length > 0 && <StatusBadge variant="info">{t("httpStatus.codesFound", { count: String(displayCodes.length) })}</StatusBadge>}
              </div>

              {activeView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {displayCodes.map((status) => (
                    <Button
                      key={status.code}
                      variant="ghost"
                      onPress={() => setSelectedCode(status)}
                      className="h-auto p-0 text-left w-full group"
                    >
                      <Card className="p-5 border-2 border-transparent group-hover:border-primary/30 transition-all cursor-pointer shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 h-full flex flex-row items-center gap-4 bg-content1 overflow-hidden relative w-full">
                        <div className={cn("size-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner", CATEGORY_COLORS[status.category])}>
                          {status.code}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm truncate uppercase tracking-tight">{status.name}</h4>
                          <p className="text-[9px] text-muted-foreground truncate font-bold opacity-60 uppercase">{getCategoryInfo(status.category).label}</p>
                        </div>
                        <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><Globe className="size-16" /></div>
                      </Card>
                    </Button>
                  ))}
                </div>
              ) : (
                <Card className="p-0 overflow-hidden border-divider shadow-xl">
                  <DataTable
                    columns={statusColumns}
                    data={displayCodes.map(c => ({ ...c, id: c.code }))}
                    filterField="name"
                    renderCell={renderStatusCell}
                    initialVisibleColumns={["code", "name", "category", "description"]}
                  />
                </Card>
              )}

              {displayCodes.length === 0 && (
                <Card className="p-20 border-dashed border-2 bg-muted/20 text-center">
                  <Globe className="size-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold opacity-40">{t("httpStatus.noMatchingCodes")}</h3>
                  <p className="text-sm opacity-30 mt-1">{t("httpStatus.trySearching")}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
