"use client";

import { useState } from "react";
import {
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import {
  Palette,
  RotateCcw,
  ListFilter,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Eye,
  Zap,
  Activity,
} from "lucide-react";
import { useTailwindSorter } from "@/hooks/use-tailwind-sorter";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TailwindAuditItem } from "@/types/tailwind-sorter";

export default function TailwindSorterPage() {
  const { t } = useTranslation();
  const {
    input,
    config,
    result,
    isSorting,
    setInput,
    updateConfig,
    reset,
    loadExample,
  } = useTailwindSorter();

  const [activeView, setActiveTab] = useState<"result" | "audit" | "breakpoints" | string>("result");

  const auditColumns: ColumnConfig[] = [
    { name: "CLASS", uid: "class" },
    { name: "ISSUE", uid: "reason" },
    { name: "SEVERITY", uid: "severity", sortable: true },
  ];

  const renderAuditCell = (item: TailwindAuditItem, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "class":
        return <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-bold text-primary">{item.class}</code>;
      case "reason":
        return <span className="text-sm font-medium">{item.reason}</span>;
      case "severity":
        return (
          <Chip size="sm" variant="soft" color={item.severity === "medium" ? "warning" : "default"} className="capitalize font-black text-[10px]">
            {item.severity}
          </Chip>
        );
      default:
        return (item as any)[key];
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
                <Button size="sm" variant="ghost" onPress={() => loadExample("messy")}>Example</Button>
                <Button size="sm" variant="ghost" onPress={() => setInput("")} isIconOnly><Trash2 className="size-3 text-danger" /></Button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your messy tailwind classes here..."
              className="h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-sky-500/20 shadow-inner"
            />
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sorting Options</p>
                {isSorting && <div className="flex items-center gap-1 text-primary animate-pulse"><Activity className="size-3" /><span className="text-[10px] font-black uppercase">Optimizing...</span></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors border border-divider/50">
                  <input 
                    type="checkbox" 
                    checked={config.removeDuplicates} 
                    onChange={(e) => updateConfig("removeDuplicates", e.target.checked)}
                    className="size-4 rounded accent-sky-600"
                  />
                  <span className="text-xs font-bold">Unique Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors border border-divider/50">
                  <input 
                    type="checkbox" 
                    checked={config.sortWithinGroups} 
                    onChange={(e) => updateConfig("sortWithinGroups", e.target.checked)}
                    className="size-4 rounded accent-sky-600"
                  />
                  <span className="text-xs font-bold">Smart Sort</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Live Preview Card */}
          <Card className="p-6 overflow-hidden bg-slate-900 text-white relative border-none">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="size-20" />
            </div>
            <h3 className="text-xs font-black uppercase opacity-60 mb-6 flex items-center gap-2 tracking-widest relative z-10">
              <Eye className="size-3" /> 
              Instant Visual Sandbox
            </h3>
            <div className="flex items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-h-[150px] relative z-10">
              <div className={cn("transition-all duration-500", result?.output || "p-4 bg-sky-500 rounded text-white")}>
                {result?.output ? "Applying Optimized Styles..." : "Sample Element"}
              </div>
            </div>
            <p className="text-[10px] text-center mt-4 opacity-40 italic relative z-10">Note: Classes are applied to this element in real-time from the Web Worker.</p>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center border-b-4 border-b-sky-500 rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Classes</p>
                  <p className="text-2xl font-black">{result.stats.uniqueClasses}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-amber-500 rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Conflicts</p>
                  <p className="text-2xl font-black text-amber-600">{result.conflicts.length}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-emerald-500 rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Efficiency</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {Math.round((result.stats.duplicatesRemoved / (result.stats.totalClasses || 1)) * 100)}%
                  </p>
                </Card>
              </div>

              {/* Analysis Tabs */}
              <Card className="p-0 overflow-hidden shadow-xl">
                <Tabs 
                  selectedKey={activeView as string} 
                  onSelectionChange={(k) => setActiveTab(k as string)}
                  variant="primary"
                >
                  <Tab 
                    key="result" 
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Sorted List
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-100 dark:border-sky-900/30">
                        <span className="text-xs font-bold text-sky-700">Production-Ready Output</span>
                        <CopyButton text={result.output} />
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl font-mono text-sm leading-relaxed border border-divider break-all min-h-[100px]">
                        {result.output}
                      </div>
                    </div>
                  </Tab>

                  <Tab 
                    key="audit" 
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="size-4 text-amber-500" />
                      Issues ({result.audit.length + result.conflicts.length})
                    </div>
                    <div className="p-0">
                      {result.conflicts.length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                          <p className="text-xs font-black text-red-700 uppercase mb-3">Critical Logic Conflicts</p>
                          <div className="flex flex-wrap gap-2">
                            {result.conflicts.map((c, i) => (
                              <Chip key={i} size="sm" color="danger" variant="soft" className="font-bold border border-danger/20">
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
                        initialVisibleColumns={["class", "reason", "severity"]}
                        emptyContent="No redundancies detected."
                      />
                    </div>
                  </Tab>

                  <Tab 
                    key="breakpoints" 
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <Monitor className="size-4 text-blue-500" />
                      Responsive
                    </div>
                    <div className="p-6 space-y-6">
                      {Object.entries(result.breakpoints).map(([bp, classes]) => (
                        <div key={bp} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest w-8 text-primary">{bp}</span>
                            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full bg-primary transition-all", classes.length > 0 ? "w-full" : "w-0")} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-10">
                            {classes.length > 0 ? (
                              classes.map((c, i) => <Chip key={i} size="sm" variant="soft" className="h-6 text-[10px] font-bold">{c}</Chip>)
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">No overrides for this size</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Tab>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Palette className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">Tailwind Auditor</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Analyze, sort and optimize your utility classes. Detection of property conflicts and responsive mapping built-in.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
