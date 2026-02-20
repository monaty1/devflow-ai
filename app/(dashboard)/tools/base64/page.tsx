"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Tabs,
  TextArea,
} from "@heroui/react";
import {
  Binary,
  RotateCcw,
  Sparkles,
  FileJson,
  FileDigit,
  Settings2,
  Trash2,
  Download,
  ArrowRight,
  Database,
  Search,
  Cpu,
  Upload,
} from "lucide-react";
import { useBase64 } from "@/hooks/use-base64";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { DataTable, type ColumnConfig } from "@/components/ui";

export default function Base64Page() {
  const { t } = useTranslation();
  const { navigateTo } = useSmartNavigation();
  const {
    input,
    mode,
    config,
    result,
    setInput,
    setMode,
    updateConfig,
    process,
    reset,
    loadExample,
  } = useBase64();

  const [activeView, setActiveView] = useState<"text" | "preview" | "inspector">("text");

  const byteColumns: ColumnConfig[] = [
    { name: t("table.colOffset"), uid: "offset" },
    { name: t("table.colHex"), uid: "hex" },
    { name: t("table.colBinary"), uid: "binary" },
    { name: t("table.colDecimal"), uid: "decimal" },
  ];

  const byteData = useMemo(() => {
    if (!result?.byteView) return [];
    const hexParts = result.byteView.hex.split(' ');
    const binParts = result.byteView.binary.split(' ');
    return hexParts.map((h, i) => ({
      id: i,
      offset: i.toString(16).padStart(4, '0').toUpperCase(),
      hex: h.toUpperCase(),
      binary: binParts[i],
      decimal: result.byteView!.decimal[i],
    }));
  }, [result]);

  const renderByteCell = useCallback((item: { id: number; offset: string; hex: string; binary: string | undefined; decimal: number | undefined }, columnKey: React.Key) => {
    const key = columnKey.toString() as keyof typeof item;
    switch (key) {
      case "offset": return <span className="font-mono text-[10px] text-muted-foreground">0x{item.offset}</span>;
      case "hex": return <span className="font-mono text-xs font-black text-primary">{item.hex}</span>;
      case "binary": return <span className="font-mono text-[10px] opacity-60">{item.binary}</span>;
      case "decimal": return <span className="font-mono text-xs">{item.decimal}</span>;
      default: return String(item[key]);
    }
  }, []);

  const jwtParts = useMemo(() => {
    if (result?.detectedType === "jwt" && result.isValid) {
      const content = mode === "decode" ? result.output : result.input;
      const parts = content.split(".");
      try {
        return {
          header: JSON.stringify(JSON.parse(atob(parts[0]!.replace(/-/g, "+").replace(/_/g, "/"))), null, 2),
          payload: JSON.stringify(JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"))), null, 2),
          signature: parts[2],
        };
      } catch { return null; }
    }
    return null;
  }, [result, mode]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Binary}
        gradient="from-blue-500 to-cyan-600"
        title={t("base64.title")}
        description={t("base64.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="base64" input={input} output={result?.output || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-muted p-1 rounded-xl">
                <Button size="sm" variant={mode === "encode" ? "primary" : "ghost"} onPress={() => setMode("encode")} className="font-bold h-8">{t("base64.encodeBtn")}</Button>
                <Button size="sm" variant={mode === "decode" ? "primary" : "ghost"} onPress={() => setMode("decode")} className="font-bold h-8">{t("base64.decodeBtn")}</Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onPress={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) { fileInput.onchange = null; return; }
                    const reader = new FileReader();
                    if (mode === "encode") {
                      reader.onload = () => {
                        const base64 = (reader.result as string).split(",")[1];
                        if (base64) setInput(base64);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      reader.onload = () => setInput(reader.result as string);
                      reader.readAsText(file);
                    }
                    fileInput.onchange = null;
                  };
                  fileInput.click();
                }} aria-label={t("base64.uploadFile")}><Upload className="size-3.5 mr-1" />{t("base64.uploadFile")}</Button>
                <Button size="sm" variant="ghost" onPress={() => loadExample("json")}>{t("base64.exampleBtn")}</Button>
                <Button size="sm" variant="ghost" onPress={() => setInput("")} isIconOnly aria-label={t("common.clearInput")}><Trash2 className="size-3.5 text-danger" /></Button>
              </div>
            </div>

            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? t("base64.encodePlaceholder") : t("base64.decodePlaceholder")}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (input.trim()) process();
                }
              }}
              className="h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
              aria-label={mode === "encode" ? t("base64.encodePlaceholder") : t("base64.decodePlaceholder")}
            />

            <div className="mt-6 space-y-4 pt-4 border-t border-divider">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                <Settings2 className="size-3" /> {t("base64.configTitle")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant={config.variant === "standard" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "standard")} className="font-bold">{t("base64.standardBtn")}</Button>
                <Button size="sm" variant={config.variant === "url-safe" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "url-safe")} className="font-bold">{t("base64.urlSafeBtn")}</Button>
              </div>
            </div>

            <Button onPress={process} variant="primary" className="w-full mt-6 h-12 font-black shadow-xl shadow-primary/20 text-md">
              <Sparkles className="size-4 mr-2" /> {mode === "encode" ? t("base64.generateEncoding") : t("base64.executeDecoding")}
            </Button>
          </Card>

          {result && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20">
              <h3 className="text-xs font-black uppercase opacity-60 mb-6 tracking-widest flex items-center gap-2">
                <FileDigit className="size-3 text-cyan-400" /> {t("base64.forensicMetrics")}
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-40">{t("base64.outputSize")}</span>
                  <span className="text-2xl font-black text-cyan-400">{result.stats.outputBytes} bytes</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase opacity-40">
                    <span>{t("base64.byteOverhead")}</span>
                    <span>{Math.round(result.stats.compressionRatio * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400" 
                      style={{ width: `${Math.min(100, result.stats.compressionRatio * 100)}%` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <StatusBadge variant="info">{t("base64.detectedBadge", { type: result.detectedType?.toUpperCase() || "" })}</StatusBadge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs
            selectedKey={activeView}
            onSelectionChange={(k) => setActiveView(k as "text" | "preview" | "inspector")}
            variant="primary"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs.ListContainer>
                <Tabs.List aria-label={t("base64.ariaViewMode")}>
                  <Tabs.Tab id="text">{t("base64.textView")}</Tabs.Tab>
                  <Tabs.Tab id="preview">{t("base64.smartPreview")}</Tabs.Tab>
                  <Tabs.Tab id="inspector">{t("base64.byteInspector")}</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <div className="flex gap-2">
                {result?.detectedType === "json" && (
                  <Button size="sm" variant="ghost" className="font-bold" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                    <FileJson className="size-3.5 mr-1.5 text-secondary" /> {t("base64.jsonLab")}
                  </Button>
                )}
                <CopyButton text={result?.output || ""} />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Tabs.Panel id="text">
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{t("base64.rawPayload")}</span>
                    <span className="text-[9px] font-mono opacity-30">{result?.stats.outputLength || 0} characters</span>
                  </div>
                  <pre className="p-8 font-mono text-[11px] leading-relaxed overflow-auto flex-1 bg-background break-all">
                    <code>{result?.output}</code>
                  </pre>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel id="preview">
                <div className="space-y-6 h-[600px] overflow-auto pr-2 scrollbar-hide">
                  {result?.detectedType === "jwt" && jwtParts && (
                    <div className="grid gap-4">
                      <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-3 tracking-widest">{t("base64.jwtHeader")}</p>
                        <pre className="text-xs font-mono text-blue-700 dark:text-blue-300">{jwtParts.header}</pre>
                      </Card>
                      <Card className="p-6 border-purple-500/20 bg-purple-500/5">
                        <p className="text-[10px] font-black text-purple-500 uppercase mb-3 tracking-widest">{t("base64.jwtPayload")}</p>
                        <pre className="text-xs font-mono text-purple-700 dark:text-purple-300">{jwtParts.payload}</pre>
                      </Card>
                      <Card className="p-6 border-divider bg-muted/5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest">{t("base64.jwtSignature")}</p>
                        <p className="text-[10px] font-mono break-all opacity-40 leading-relaxed">{jwtParts.signature}</p>
                      </Card>
                    </div>
                  )}

                  {result?.detectedType === "image" && (
                    <Card className="p-12 flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                      <img src={mode === "decode" ? `data:image/*;base64,${result.input}` : `data:image/*;base64,${result.output}`} alt="Preview" className="max-w-full max-h-[350px] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800" />
                      <Button size="md" variant="primary" className="mt-8 font-black shadow-lg" onPress={() => {
                        const a = document.createElement("a");
                        a.href = mode === "decode" ? `data:image/*;base64,${result.input}` : `data:image/*;base64,${result.output}`;
                        a.download = "devflow-decoded"; a.click();
                      }}>
                        <Download className="size-4 mr-2" /> {t("base64.downloadResource")}
                      </Button>
                    </Card>
                  )}

                  {result?.detectedType === "json" && (
                    <Card className="p-8 border-emerald-500/20 bg-emerald-500/5 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-emerald-600 flex items-center gap-2 text-md italic">
                          <Database className="size-5" /> {t("base64.structuredObject")}
                        </h3>
                        <Button size="sm" variant="ghost" className="font-black text-success" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                          {t("base64.fullAnalysis")} <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-auto leading-relaxed">
                        {(() => {
                          try {
                            const raw = mode === "decode" ? result.output : result.input;
                            return JSON.stringify(JSON.parse(raw), null, 2);
                          } catch {
                            return mode === "decode" ? result.output : result.input;
                          }
                        })()}
                      </pre>
                    </Card>
                  )}

                  {result?.detectedType && !["jwt", "image", "json"].includes(result.detectedType) && (
                    <Card className="p-20 border-dashed border-2 bg-muted/10 flex flex-col items-center justify-center h-full text-center">
                      <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Search className="size-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t("base64.noPreview")}</h3>
                      <p className="text-muted-foreground max-w-xs">{t("base64.noPreviewDesc")}</p>
                    </Card>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="inspector">
                <Card className="p-0 overflow-hidden shadow-xl border-divider h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">{t("base64.byteAnalysis")}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-primary" /><span className="text-[9px] font-black uppercase opacity-60">HEX</span></div>
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-secondary" /><span className="text-[9px] font-black uppercase opacity-60">BIN</span></div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <DataTable
                      columns={byteColumns}
                      data={byteData}
                      filterField="hex"
                      renderCell={renderByteCell}
                      initialVisibleColumns={["offset", "hex", "binary", "decimal"]}
                      emptyContent={t("base64.processContent")}
                    />
                  </div>
                </Card>
              </Tabs.Panel>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
