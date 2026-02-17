"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Chip,
  Progress,
  Tooltip,
} from "@heroui/react";
import {
  Type,
  Layout,
  Palette,
  Layers,
  MousePointer2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Copy,
  ArrowRight,
  ListFilter,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Eye,
  Search,
} from "lucide-react";
import { useTailwindSorter } from "@/hooks/use-tailwind-sorter";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { TailwindAuditItem, TailwindConflict } from "@/types/tailwind-sorter";

export default function TailwindSorterPage() {
  const { t } = useTranslation();
  const {
    input,
    config,
    result,
    setInput,
    updateConfig,
    sort,
    reset,
    loadExample,
  } = useTailwindSorter();

  const [activeView, setActiveTab] = useState<"result" | "audit" | "breakpoints">("result");

  const auditColumns: ColumnConfig[] = [
    { name: "CLASS", uid: "class" },
    { name: "ISSUE", uid: "reason" },
    { name: "SEVERITY", uid: "severity", sortable: true },
  ];

  const renderAuditCell = (item: TailwindAuditItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "class":
        return <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-bold text-primary">{item.class}</code>;
      case "reason":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{item.reason}</span>
            {item.suggestion && (
              <span className="text-xs text-success font-medium">Suggestion: {item.suggestion}</span>
            )}
          </div>
        );
      case "severity":
        return (
          <Chip size="sm" variant="flat" color={item.severity === "medium" ? "warning" : "primary"} className="capitalize font-black text-[10px]">
            {item.severity}
          </Chip>
        );
      default:
        return (item as any)[columnKey];
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Palette}
        gradient="from-sky-500 to-blue-600"
        title={t("tailwind.title")}
        description={t("tailwind.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-sky-600">
                <ListFilter className="size-5" />
                Raw Classes
              </h3>
              <div className="flex gap-1">
                <Button size="sm" variant="flat" onPress={() => loadExample("messy")}>Example</Button>
                <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => setInput("")}><Trash2 className="size-3" /></Button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your messy tailwind classes here..."
              className="h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-sky-500/20 shadow-inner"
            />
            
            <div className="mt-6 space-y-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sorting Options</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.removeDuplicates} 
                    onChange={(e) => updateConfig("removeDuplicates", e.target.checked)}
                    className="size-4 rounded accent-sky-600"
                  />
                  <span className="text-xs font-bold">Unique Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.sortWithinGroups} 
                    onChange={(e) => updateConfig("sortWithinGroups", e.target.checked)}
                    className="size-4 rounded accent-sky-600"
                  />
                  <span className="text-xs font-bold">Sort Logic</span>
                </label>
              </div>
            </div>

            <Button 
              onPress={sort} 
              color="primary"
              className="w-full mt-6 h-12 font-bold shadow-lg shadow-sky-500/20"
            >
              <Sparkles className="size-4 mr-2" /> Optimize Classes
            </Button>
          </Card>

          {/* Live Preview Card */}
          <Card className="p-6 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h3 className="text-xs font-black uppercase opacity-60 mb-6 flex items-center gap-2 tracking-widest">
              <Eye className="size-3" /> 
              Instant Visual Preview
            </h3>
            <div className="flex items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-h-[150px]">
              <div className={cn("transition-all duration-500", result?.output || "p-4 bg-sky-500 rounded text-white")}>
                {result?.output ? "Applying Optimized Styles..." : "Sample Element"}
              </div>
            </div>
            <p className="text-[10px] text-center mt-4 opacity-40 italic">Note: Classes are applied to this element in real-time</p>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center border-b-4 border-b-sky-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Unique</p>
                  <p className="text-2xl font-black">{result.stats.uniqueClasses}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-amber-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Conflicts</p>
                  <p className="text-2xl font-black text-amber-600">{result.conflicts.length}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-emerald-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Optimization</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {Math.round((result.stats.duplicatesRemoved / (result.stats.totalClasses || 1)) * 100)}%
                  </p>
                </Card>
              </div>

              {/* Analysis Tabs */}
              <Card className="overflow-hidden border-divider shadow-xl">
                <Tabs 
                  selectedKey={activeView} 
                  onSelectionChange={(k) => setActiveTab(k as any)}
                  classNames={{
                    tabList: "w-full rounded-none bg-muted/30 border-b border-divider p-0 h-14",
                    tab: "h-full",
                    cursor: "bg-sky-500",
                  }}
                >
                  <Tab 
                    key="result" 
                    title={
                      <div className="flex items-center gap-2 font-bold px-4">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Sorted Result
                      </div>
                    }
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-100 dark:border-sky-900/30">
                        <span className="text-xs font-bold text-sky-700">Production-Ready Output</span>
                        <CopyButton text={result.output} />
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl font-mono text-sm leading-relaxed border border-divider break-all">
                        {result.output}
                      </div>
                    </div>
                  </Tab>

                  <Tab 
                    key="audit" 
                    title={
                      <div className="flex items-center gap-2 font-bold px-4">
                        <AlertTriangle className="size-4 text-amber-500" />
                        Audit & Conflicts
                      </div>
                    }
                  >
                    <div className="p-0">
                      {result.conflicts.length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                          <p className="text-xs font-black text-red-700 uppercase mb-2">Critical Property Conflicts</p>
                          <div className="flex flex-wrap gap-2">
                            {result.conflicts.map((c, i) => (
                              <Chip key={i} size="sm" color="danger" variant="flat" className="font-bold">
                                {c.classes.join(" vs ")}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      <DataTable
                        columns={auditColumns}
                        data={result.audit.map((a, id) => ({ ...a, id }))}
                        filterField="class"
                        renderCell={renderAuditCell}
                        emptyContent="Clean classes! No redundancies or conflicts found."
                      />
                    </div>
                  </Tab>

                  <Tab 
                    key="breakpoints" 
                    title={
                      <div className="flex items-center gap-2 font-bold px-4">
                        <Monitor className="size-4 text-blue-500" />
                        Responsive Map
                      </div>
                    }
                  >
                    <div className="p-6 space-y-6">
                      {Object.entries(result.breakpoints).map(([bp, classes]) => (
                        <div key={bp} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {bp === "base" ? <Smartphone className="size-3 opacity-50" /> : bp === "sm" ? <Tablet className="size-3 opacity-50" /> : <Monitor className="size-3 opacity-50" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{bp}</span>
                            <Progress value={classes.length > 0 ? 100 : 0} size="sm" color={classes.length > 0 ? "primary" : "default"} className="h-1 flex-1" />
                          </div>
                          {classes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pl-5">
                              {classes.map((c, i) => <Chip key={i} size="sm" variant="dot" className="h-6 text-[10px]">{c}</Chip>)}
                            </div>
                          ) : (
                            <p className="pl-5 text-[10px] text-muted-foreground italic">No classes for this breakpoint</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Tab>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Layers className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">Design Analysis Ready</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Paste your class strings to detect conflicts, remove duplicates and visualize your responsive design distribution.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
