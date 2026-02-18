"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Tabs,
  Tab,
  Chip,
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
} from "lucide-react";
import { useJsonFormatter } from "@/hooks/use-json-formatter";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { JsonPathResult, JsonFormatMode } from "@/types/json-formatter";

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
    loadExample,
    reset,
    applyOutput,
    fix,
  } = useJsonFormatter();

  const [activeTab, setActiveTab] = useState<"output" | "paths" | "typescript" | "compare" | string>("output");

  const pathColumns: ColumnConfig[] = [
    { name: "PATH", uid: "path", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "VALUE", uid: "value" },
  ];

  const renderPathCell = useCallback((item: JsonPathResult, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "path":
        return <code className="text-[11px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">{item.path}</code>;
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
  }, []);

  const paths = useMemo(() => (inputValidation.isValid ? getPaths() : []), [inputValidation.isValid, getPaths]);
  const tsOutput = useMemo(() => (inputValidation.isValid ? toTypeScript("Root") : ""), [inputValidation.isValid, toTypeScript]);
  const isEqual = activeTab === "compare" && compareInput ? compare() : null;

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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Database className="size-4 text-primary" />
                Raw Payload
              </h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onPress={() => loadExample("complex")}>Example</Button>
                <Button size="sm" variant="ghost" onPress={() => setInput("")}><Trash2 className="size-3.5 text-danger" /></Button>
              </div>
            </div>
            
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Paste JSON here...'
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
              />
              {!inputValidation.isValid && input && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <StatusBadge variant="error">ERROR</StatusBadge>
                </div>
              )}
            </div>

            {!inputValidation.isValid && input && (
              <div className="mt-4 p-4 bg-danger/10 rounded-2xl border border-danger/20 space-y-3">
                <div className="flex items-center gap-2 text-danger text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="size-4" />
                  Syntax Logic Failure
                </div>
                <p className="text-xs text-danger/80 font-medium italic">
                  L{inputValidation.error?.line} C{inputValidation.error?.column}: {inputValidation.error?.message}
                </p>
                <Button size="sm" variant="danger" className="w-full font-black shadow-lg shadow-danger/20" onPress={fix}>
                  <Wrench className="size-3.5 mr-2" /> Auto-Repair Structure
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="primary" className="font-black h-12 text-md shadow-xl shadow-primary/20" onPress={() => { setMode("format"); process(); }}>
                <Braces className="size-4 mr-2" /> Format
              </Button>
              <Button variant="ghost" className="font-black h-12 text-md text-primary" onPress={() => { setMode("minify"); process(); }}>
                <Minimize2 className="size-4 mr-2" /> Minify
              </Button>
            </div>
          </Card>

          {/* Luxury Analytics Card */}
          <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20 border-none">
            <h3 className="text-xs font-black uppercase opacity-60 mb-6 flex items-center gap-2 tracking-widest">
              <Fingerprint className="size-3 text-orange-400" /> 
              Structural Fingerprint
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Unique Keys</p>
                <p className="text-2xl font-black text-orange-400">{result?.stats.keys || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Depth Level</p>
                <p className="text-2xl font-black text-blue-400">{result?.stats.depth || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Byte Size</p>
                <p className="text-sm font-black uppercase">{((result?.stats.sizeBytes || 0) / 1024).toFixed(2)} KB</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Node Density</p>
                <p className="text-sm font-black uppercase">{result?.stats.values || 0} items</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
               <div className="flex justify-between text-[9px] font-black uppercase opacity-40">
                  <span>Formatting Efficiency</span>
                  <span>{Math.round(((result?.stats.minifiedSize || 0) / (result?.stats.sizeBytes || 1)) * 100)}%</span>
               </div>
               <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400" 
                    style={{ width: `${Math.min(100, ((result?.stats.minifiedSize || 0) / (result?.stats.sizeBytes || 1)) * 100)}%` }} 
                  />
               </div>
            </div>
          </Card>
        </div>

        {/* Results View */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs 
              selectedKey={activeTab as string} 
              onSelectionChange={(k) => setActiveTab(k as string)}
              variant="primary"
            >
              <Tab key="output">Output</Tab>
              <Tab key="paths">Path Explorer</Tab>
              <Tab key="typescript">Schema</Tab>
              <Tab key="compare">Diff Analysis</Tab>
            </Tabs>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" variant="ghost" className="font-bold flex-1 sm:flex-none" onPress={() => navigateTo("dto-matic", input)}>
                <Code2 className="size-3.5 mr-1.5 text-secondary" /> Architect Layer
              </Button>
              <Button size="sm" variant="ghost" className="font-bold flex-1 sm:flex-none" onPress={applyOutput} isDisabled={!result?.output}>
                <ArrowRightLeft className="size-3.5 mr-1.5 text-primary" /> Set as Input
              </Button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {activeTab === "output" && (
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
                    <pre className="p-8 font-mono text-[11px] leading-relaxed">
                      <code>{result.output}</code>
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                      <Braces className="size-12 mb-3" />
                      <p className="text-sm font-bold">Format or minify JSON to see output</p>
                    </div>
                  )}
                  {result && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <StatusBadge variant="info">PRETTY-PRINTED</StatusBadge>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "paths" && (
              <Card className="p-0 overflow-hidden shadow-xl border-divider min-h-[650px]">
                <div className="p-4 border-b border-divider bg-muted/20 flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest">JSON Object Hierarchy</span>
                </div>
                <DataTable
                  columns={pathColumns}
                  data={paths.map((p, id) => ({ ...p, id }))}
                  filterField="path"
                  renderCell={renderPathCell}
                  initialVisibleColumns={["path", "type", "value"]}
                  emptyContent="Enter valid JSON to explore paths."
                />
              </Card>
            )}

            {activeTab === "typescript" && (
              <Card className="p-0 border-divider shadow-xl overflow-hidden h-[650px] flex flex-col border-none">
                <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">TypeScript Definition</span>
                  <CopyButton text={tsOutput} />
                </div>
                <div className="flex-1 bg-muted/30 dark:bg-zinc-900 p-8 overflow-auto">
                  <pre className="font-mono text-xs leading-relaxed text-primary">
                    <code>{tsOutput}</code>
                  </pre>
                </div>
              </Card>
            )}

            {activeTab === "compare" && (
              <div className="grid gap-6">
                <Card className="p-6 border-divider shadow-md">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                    <ArrowRightLeft className="size-4" />
                    Comparison Target
                  </h3>
                  <textarea
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value)}
                    placeholder="Paste second JSON to find differences..."
                    className="h-48 w-full resize-none rounded-2xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
                  />
                </Card>
                
                {compareInput && (
                  <Card className={cn(
                    "p-8 flex flex-col items-center justify-center border-2 transition-all duration-500",
                    isEqual ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-400" : "bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-950/10 dark:border-danger-900/30 dark:text-danger-400"
                  )}>
                    {isEqual ? (
                      <div className="text-center space-y-3">
                        <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="size-10" />
                        </div>
                        <p className="text-2xl font-black">Binary Identity Match</p>
                        <p className="text-sm font-medium opacity-70">Both payloads are structurally identical after key normalization.</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="size-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertCircle className="size-10" />
                        </div>
                        <p className="text-2xl font-black">Structural Divergence</p>
                        <p className="text-sm font-medium opacity-70">Differences detected in keys, values, or hierarchy depth.</p>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
