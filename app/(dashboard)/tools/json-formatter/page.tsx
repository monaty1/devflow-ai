"use client";

import { useState, useCallback, useMemo } from "react";
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
  Braces,
  AlertCircle,
  Sparkles,
  Trash2,
  Minimize2,
  CheckCircle,
  FileCode,
  ArrowRightLeft,
  List,
  Wand2,
  FileSpreadsheet,
  FileJson2,
  Wrench,
  Search,
  Code2,
  Database,
  Layers,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { useJsonFormatter } from "@/hooks/use-json-formatter";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { JsonFormatMode, JsonPathResult } from "@/types/json-formatter";

export default function JsonFormatterPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();

  const {
    input,
    mode,
    config,
    result,
    compareInput,
    inputStats,
    inputValidation,
    setInput,
    setMode,
    setCompareInput,
    updateConfig,
    process,
    getPaths,
    toTypeScript,
    compare,
    loadExample,
    reset,
    applyOutput,
    fix,
  } = useJsonFormatter();

  const [activeTab, setActiveTab] = useState<"output" | "paths" | "typescript" | "compare">("output");

  const pathColumns: ColumnConfig[] = [
    { name: "PATH", uid: "path", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "VALUE", uid: "value" },
  ];

  const renderPathCell = useCallback((item: JsonPathResult, columnKey: React.Key) => {
    switch (columnKey) {
      case "path":
        return <code className="text-xs font-bold text-primary">{item.path}</code>;
      case "type":
        return (
          <Chip size="sm" variant="flat" className="capitalize text-[10px] font-black bg-muted">
            {item.type}
          </Chip>
        );
      case "value":
        const valStr = String(item.value);
        return <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block">{valStr}</span>;
      default:
        return (item as any)[columnKey];
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
              <h3 className="font-bold flex items-center gap-2">
                <Database className="size-4 text-primary" />
                Raw JSON Input
              </h3>
              <div className="flex gap-1">
                <Button size="sm" variant="flat" onPress={() => loadExample("complex")}>Example</Button>
                <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => setInput("")}><Trash2 className="size-3" /></Button>
              </div>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"paste": "json here"}'
              className={cn(
                "h-80 w-full resize-none rounded-xl border p-4 font-mono text-xs focus:ring-2 transition-all shadow-inner",
                input && !inputValidation.isValid ? "border-danger ring-danger/10" : "border-divider focus:ring-primary/20"
              )}
            />

            {!inputValidation.isValid && input && (
              <div className="mt-4 p-3 bg-danger/10 rounded-xl border border-danger/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-danger text-xs font-bold uppercase">
                  <AlertCircle className="size-4" />
                  Syntax Error: L{inputValidation.error?.line} C{inputValidation.error?.column}
                </div>
                <p className="text-xs text-danger/80 italic">{inputValidation.error?.message}</p>
                <Button size="sm" color="danger" variant="flat" className="mt-1 font-bold" onPress={fix}>
                  <Wrench className="size-3 mr-1" /> Auto-Repair Syntax
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button color="primary" className="font-bold" onPress={() => { setMode("format"); process(); }}>
                <Braces className="size-4 mr-2" /> Format
              </Button>
              <Button variant="flat" color="primary" className="font-bold" onPress={() => { setMode("minify"); process(); }}>
                <Minimize2 className="size-4 mr-2" /> Minify
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-xl shadow-orange-500/20">
            <h3 className="text-xs font-black uppercase opacity-80 mb-4 flex items-center gap-2 tracking-widest">
              <Fingerprint className="size-3" /> Data Fingerprint
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase opacity-60">Keys</p>
                <p className="text-xl font-black">{result?.stats.keys || 0}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase opacity-60">Max Depth</p>
                <p className="text-xl font-black">{result?.stats.depth || 0}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase opacity-60">Size</p>
                <p className="text-sm font-black">{((result?.stats.sizeBytes || 0) / 1024).toFixed(2)} KB</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase opacity-60">Arrays</p>
                <p className="text-xl font-black">{result?.stats.arrays || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && inputValidation.isValid ? (
            <>
              <div className="flex justify-between items-center">
                <Tabs 
                  selectedKey={activeTab} 
                  onSelectionChange={(k) => setActiveTab(k as any)}
                  variant="solid"
                  color="primary"
                  classNames={{ tabList: "bg-muted/50 rounded-xl p-1" }}
                >
                  <Tab key="output" title="Output" />
                  <Tab key="paths" title="Path Explorer" />
                  <Tab key="typescript" title="TypeScript" />
                  <Tab key="compare" title="Compare" />
                </Tabs>
                <Button size="sm" variant="flat" onPress={() => navigateTo("dto-matic", input)}>
                  <Code2 className="size-3 mr-1" /> Send to DTO-Matic
                </Button>
              </div>

              {activeTab === "output" && (
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                    <div className="flex gap-2">
                      {["to-yaml", "to-xml", "to-csv"].map((m) => (
                        <Button 
                          key={m} 
                          size="xs" 
                          variant={mode === m ? "solid" : "flat"} 
                          onPress={() => { setMode(m as any); process(); }}
                          className="h-7 px-2 text-[10px] font-black uppercase"
                        >
                          {m.split("-")[1]}
                        </Button>
                      ))}
                    </div>
                    <CopyButton text={result.output} />
                  </div>
                  <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background">
                    <code>{result.output}</code>
                  </pre>
                </Card>
              )}

              {activeTab === "paths" && (
                <Card className="p-0 overflow-hidden shadow-xl border-divider">
                  <DataTable
                    columns={pathColumns}
                    data={paths.map((p, id) => ({ ...p, id }))}
                    filterField="path"
                    renderCell={renderPathCell}
                    initialVisibleColumns={["path", "type", "value"]}
                  />
                </Card>
              )}

              {activeTab === "typescript" && (
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Interface Schema</span>
                    <CopyButton text={tsOutput} />
                  </div>
                  <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background text-blue-600 dark:text-blue-400">
                    <code>{tsOutput}</code>
                  </pre>
                </Card>
              )}

              {activeTab === "compare" && (
                <div className="grid gap-6">
                  <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="size-4 text-primary" />
                      Comparison Source
                    </h3>
                    <textarea
                      value={compareInput}
                      onChange={(e) => setCompareInput(e.target.value)}
                      placeholder="Paste JSON to compare..."
                      className="h-40 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
                    />
                  </Card>
                  {compareInput && (
                    <Card className={cn(
                      "p-6 flex items-center justify-center border-2",
                      isEqual ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-danger-50 border-danger-200 text-danger-700"
                    )}>
                      {isEqual ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="size-10" />
                          <p className="text-xl font-black">JSONs are Identical</p>
                          <p className="text-xs opacity-70">Structural fingerprint match (keys sorted)</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="size-10" />
                          <p className="text-xl font-black">JSONs are Different</p>
                          <p className="text-xs opacity-70">Structural or value mismatch detected</p>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Layers className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">JSON Lab</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Format, minify, and analyze your JSON. Explore internal paths, generate TypeScript interfaces, or compare multiple payloads.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
