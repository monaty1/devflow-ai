"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Globe,
  Search,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Terminal,
  FileCode,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight,
  Database,
  History,
  X,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useHttpStatusFinder } from "@/hooks/use-http-status-finder";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCategoryInfo } from "@/lib/application/http-status-finder";
import { cn } from "@/lib/utils";
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

  const [activeView, setActiveView] = useState<"grid" | "table">("grid");
  const [testResponse, setTestResult] = useState<{ headers: Record<string, string>; time: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const statusColumns: ColumnConfig[] = [
    { name: "CODE", uid: "code", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "CATEGORY", uid: "category", sortable: true },
    { name: "DESCRIPTION", uid: "description" },
  ];

  const renderStatusCell = useCallback((status: HttpStatusCode, columnKey: React.Key) => {
    switch (columnKey) {
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
        return (status as any)[columnKey];
    }
  }, []);

  const runMockTest = async (code: number) => {
    setIsTesting(true);
    const start = Date.now();
    try {
      const res = await fetch(`https://httpstat.us/${code}`);
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      setTestResult({ headers, time: Date.now() - start });
    } catch {
      setTestResult(null);
    } finally {
      setIsTesting(false);
    }
  };

  const displayCodes = useMemo(() => 
    query.trim() || categoryFilter ? results.codes : commonCodes
  , [query, categoryFilter, results.codes, commonCodes]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Globe}
        gradient="from-cyan-500 to-blue-600"
        title={t("httpStatus.title")}
        description={t("httpStatus.description")}
        breadcrumb
        actions={
          <div className="flex gap-2">
            <div className="flex bg-muted p-1 rounded-xl">
              <Button isIconOnly size="sm" variant={activeView === "grid" ? "solid" : "light"} color={activeView === "grid" ? "primary" : "default"} onPress={() => setActiveView("grid")}><History className="size-3.5" /></Button>
              <Button isIconOnly size="sm" variant={activeView === "table" ? "solid" : "light"} color={activeView === "table" ? "primary" : "default"} onPress={() => setActiveView("table")}><Database className="size-3.5" /></Button>
            </div>
            <Button variant="outline" size="sm" onPress={clearSearch} className="gap-2">
              <RotateCcw className="size-4" /> Reset
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Search & Selector Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Search className="size-4 text-primary" />
              Smart Search
            </h3>
            <Input
              isClearable
              placeholder="Code (404) or Keyword (not found)..."
              value={query}
              onValueChange={setQuery}
              onClear={clearSearch}
              variant="bordered"
              classNames={{ input: "font-medium" }}
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              {["1xx", "2xx", "3xx", "4xx", "5xx"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat as HttpStatusCategory)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all",
                    categoryFilter === cat 
                      ? "bg-primary border-primary text-white shadow-md" 
                      : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>

          {/* Decision Wizard Card */}
          <Card className="p-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-xs font-black uppercase opacity-80 mb-4 flex items-center gap-2 tracking-widest">
              <HelpCircle className="size-3" /> Quick Decision Flow
            </h3>
            <div className="space-y-3">
              {[
                { q: "Auth required?", a: "401 Unauthorized" },
                { q: "Permission denied?", a: "403 Forbidden" },
                { q: "Resource missing?", a: "404 Not Found" },
                { q: "Success & no body?", a: "204 No Content" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                  <span className="text-[10px] font-bold">{item.q}</span>
                  <ChevronRight className="size-3 opacity-40" />
                  <span className="text-[10px] font-black uppercase text-cyan-200">{item.a.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Card */}
              <Card className="p-8 border-divider shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={cn("size-24 rounded-3xl flex items-center justify-center text-4xl font-black shadow-inner", CATEGORY_COLORS[selectedCode.category])}>
                      {selectedCode.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black">{selectedCode.name}</h2>
                        <CopyButton text={selectedCode.code.toString()} variant="ghost" size="sm" />
                      </div>
                      <StatusBadge variant="info">{getCategoryInfo(selectedCode.category).label.toUpperCase()}</StatusBadge>
                    </div>
                  </div>
                  <div className="flex gap-2 self-start">
                    <Button isIconOnly variant="flat" color="danger" onPress={() => setSelectedCode(null)}><X className="size-4" /></Button>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Description</label>
                    <p className="text-sm font-medium leading-relaxed">{selectedCode.description}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">When to use</label>
                    <p className="text-sm font-medium leading-relaxed">{selectedCode.whenToUse}</p>
                  </div>
                </div>
              </Card>

              {/* Implementation & Testing Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
                    <Terminal className="size-4" />
                    Implementation
                  </h3>
                  <div className="space-y-4">
                    {selectedCode.snippets ? (
                      Object.entries(selectedCode.snippets).map(([lang, code]) => (
                        <div key={lang} className="space-y-1.5">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">{lang}</span>
                            <CopyButton text={code} size="xs" variant="ghost" />
                          </div>
                          <pre className="p-3 bg-muted/30 rounded-xl font-mono text-[11px] border border-divider overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Standard headers are usually enough for this code.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2 text-emerald-600">
                      <Play className="size-4" />
                      Live Mock Test
                    </h3>
                    <Button size="sm" color="success" variant="flat" className="font-bold h-8" onPress={() => runMockTest(selectedCode.code)} isLoading={isTesting}>
                      Run Fetch
                    </Button>
                  </div>
                  {testResponse ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                        <span>Response Headers</span>
                        <span>{testResponse.time}ms</span>
                      </div>
                      <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] h-48 overflow-auto border border-white/10">
                        {Object.entries(testResponse.headers).map(([k, v]) => (
                          <div key={k} className="mb-1">
                            <span className="opacity-50">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-row items-center justify-center border-2 border-dashed border-divider rounded-xl text-center p-4">
                      <p className="text-xs text-muted-foreground">Click "Run Fetch" to simulate a real HTTP call to this status code using httpstat.us</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayCodes.map((status) => (
                    <button key={status.code} onClick={() => setSelectedCode(status)} className="group text-left">
                      <Card className="p-4 border-2 border-transparent hover:border-primary/30 transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className={cn("size-12 rounded-xl flex items-center justify-center font-black", CATEGORY_COLORS[status.category])}>
                            {status.code}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate">{status.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate uppercase font-black">{getCategoryInfo(status.category).label}</p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              ) : (
                <Card className="p-0 overflow-hidden border-divider">
                  <DataTable
                    columns={statusColumns}
                    data={displayCodes.map(c => ({ ...c, id: c.code }))}
                    filterField="name"
                    renderCell={renderStatusCell}
                    initialVisibleColumns={["code", "name", "category", "description"]}
                  />
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
