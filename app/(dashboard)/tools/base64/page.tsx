"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
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
} from "lucide-react";
import { useBase64 } from "@/hooks/use-base64";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
    { name: "OFFSET", uid: "offset" },
    { name: "HEX", uid: "hex" },
    { name: "BINARY", uid: "binary" },
    { name: "DEC", uid: "decimal" },
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

  const renderByteCell = useCallback((item: any, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "offset": return <span className="font-mono text-[10px] text-muted-foreground">0x{item.offset}</span>;
      case "hex": return <span className="font-mono text-xs font-black text-primary">{item.hex}</span>;
      case "binary": return <span className="font-mono text-[10px] opacity-60">{item.binary}</span>;
      case "decimal": return <span className="font-mono text-xs">{item.decimal}</span>;
      default: return item[key];
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-muted p-1 rounded-xl">
                <Button size="sm" variant={mode === "encode" ? "primary" : "ghost"} onPress={() => setMode("encode")} className="font-bold h-8">Encode</Button>
                <Button size="sm" variant={mode === "decode" ? "primary" : "ghost"} onPress={() => setMode("decode")} className="font-bold h-8">Decode</Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onPress={() => loadExample("json")}>Example</Button>
                <Button size="sm" variant="ghost" onPress={() => setInput("")} isIconOnly><Trash2 className="size-3.5 text-danger" /></Button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text or JSON to encode..." : "Paste Base64 string here..."}
              className="h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
            />

            <div className="mt-6 space-y-4 pt-4 border-t border-divider">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                <Settings2 className="size-3" /> Base64 Configuration
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant={config.variant === "standard" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "standard")} className="font-bold">Standard</Button>
                <Button size="sm" variant={config.variant === "url-safe" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "url-safe")} className="font-bold">URL-Safe</Button>
              </div>
            </div>

            <Button onPress={process} variant="primary" className="w-full mt-6 h-12 font-black shadow-xl shadow-primary/20 text-md">
              <Sparkles className="size-4 mr-2" /> {mode === "encode" ? "Generate Encoding" : "Execute Decoding"}
            </Button>
          </Card>

          {result && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20">
              <h3 className="text-xs font-black uppercase opacity-60 mb-6 tracking-widest flex items-center gap-2">
                <FileDigit className="size-3 text-cyan-400" /> Forensic Metrics
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-40">Output Size</span>
                  <span className="text-2xl font-black text-cyan-400">{result.stats.outputBytes} bytes</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase opacity-40">
                    <span>Byte Overhead</span>
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
                  <StatusBadge variant="info">{result.detectedType?.toUpperCase()} DETECTED</StatusBadge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs 
              selectedKey={activeView} 
              onSelectionChange={(k) => setActiveView(k as any)}
              variant="primary"
            >
              <Tab key="text">Text View</Tab>
              <Tab key="preview">Smart Preview</Tab>
              <Tab key="inspector">Byte Inspector</Tab>
            </Tabs>
            <div className="flex gap-2">
              {result?.detectedType === "json" && (
                <Button size="sm" variant="ghost" className="font-bold" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                  <FileJson className="size-3.5 mr-1.5 text-secondary" /> JSON Lab
                </Button>
              )}
              <CopyButton text={result?.output || ""} />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {activeView === "text" && (
              <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col">
                <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Raw Encoded/Decoded Payload</span>
                  <span className="text-[9px] font-mono opacity-30">{result?.stats.outputLength || 0} characters</span>
                </div>
                <pre className="p-8 font-mono text-[11px] leading-relaxed overflow-auto flex-1 bg-background break-all">
                  <code>{result?.output}</code>
                </pre>
              </Card>
            )}

            {activeView === "preview" && (
              <div className="space-y-6 h-[600px] overflow-auto pr-2 scrollbar-hide">
                {result?.detectedType === "jwt" && jwtParts && (
                  <div className="grid gap-4">
                    <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-3 tracking-widest">Header</p>
                      <pre className="text-xs font-mono text-blue-700 dark:text-blue-300">{jwtParts.header}</pre>
                    </Card>
                    <Card className="p-6 border-purple-500/20 bg-purple-500/5">
                      <p className="text-[10px] font-black text-purple-500 uppercase mb-3 tracking-widest">Payload (Claims)</p>
                      <pre className="text-xs font-mono text-purple-700 dark:text-purple-300">{jwtParts.payload}</pre>
                    </Card>
                    <Card className="p-6 border-divider bg-muted/5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest">Cryptographic Signature</p>
                      <p className="text-[10px] font-mono break-all opacity-40 leading-relaxed">{jwtParts.signature}</p>
                    </Card>
                  </div>
                )}

                {result?.detectedType === "image" && (
                  <Card className="p-12 flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                    <img src={mode === "decode" ? `data:image/png;base64,${result.input}` : `data:image/png;base64,${result.output}`} alt="Preview" className="max-w-full max-h-[350px] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800" />
                    <Button size="md" variant="primary" className="mt-8 font-black shadow-lg" onPress={() => {
                      const a = document.createElement("a");
                      a.href = mode === "decode" ? `data:image/png;base64,${result.input}` : `data:image/png;base64,${result.output}`;
                      a.download = "devflow-decoded.png"; a.click();
                    }}>
                      <Download className="size-4 mr-2" /> Download Resource
                    </Button>
                  </Card>
                )}

                {result?.detectedType === "json" && (
                  <Card className="p-8 border-emerald-500/20 bg-emerald-500/5 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-emerald-600 flex items-center gap-2 text-md italic">
                        <Database className="size-5" /> Structured Object
                      </h3>
                      <Button size="sm" variant="ghost" className="font-black text-success" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                        Full Analysis <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-auto leading-relaxed">
                      {mode === "decode" ? JSON.stringify(JSON.parse(result.output), null, 2) : JSON.stringify(JSON.parse(result.input), null, 2)}
                    </pre>
                  </Card>
                )}

                {!["jwt", "image", "json"].includes(result?.detectedType!) && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-20 opacity-30">
                    <Search className="size-16 mb-4" />
                    <p className="font-black text-xl">NO SMART PREVIEW</p>
                    <p className="text-sm">Content identified as raw string or unknown binary stream.</p>
                  </div>
                )}
              </div>
            )}

            {activeView === "inspector" && (
              <Card className="p-0 overflow-hidden shadow-xl border-divider h-[600px] flex flex-col">
                <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">Low-Level Byte Analysis</span>
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
                    emptyContent="Process content to see byte breakdown."
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
