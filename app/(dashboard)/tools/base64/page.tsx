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
  Binary,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  FileJson,
  FileText,
  Image as ImageIcon,
  FileDigit,
  ShieldCheck,
  Settings2,
  Trash2,
  Download,
  Eye,
  ArrowRight,
  Database,
  Search,
} from "lucide-react";
import { useBase64 } from "@/hooks/use-base64";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

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

  const [activeView, setActiveView] = useState<"text" | "preview">("text");

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
      } catch {
        return null;
      }
    }
    return null;
  }, [result, mode]);

  const isImage = result?.detectedType === "image";
  const isPdf = result?.detectedType === "pdf";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-muted p-1 rounded-xl">
                <Button
                  size="sm"
                  variant={mode === "encode" ? "solid" : "light"}
                  color={mode === "encode" ? "primary" : "default"}
                  onPress={() => setMode("encode")}
                  className="font-bold h-8"
                >
                  Encode
                </Button>
                <Button
                  size="sm"
                  variant={mode === "decode" ? "solid" : "light"}
                  color={mode === "decode" ? "primary" : "default"}
                  onPress={() => setMode("decode")}
                  className="font-bold h-8"
                >
                  Decode
                </Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="flat" onPress={() => loadExample("json")}>Example</Button>
                <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => setInput("")}><Trash2 className="size-3" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                {mode === "encode" ? "Plain Text / JSON" : "Base64 String"}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 here..."}
                className="h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <Settings2 className="size-3" /> Variant Options
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={config.variant === "standard" ? "solid" : "flat"}
                  onPress={() => updateConfig("variant", "standard")}
                  className="flex-1 font-bold h-9"
                >
                  Standard
                </Button>
                <Button
                  size="sm"
                  variant={config.variant === "url-safe" ? "solid" : "flat"}
                  onPress={() => updateConfig("variant", "url-safe")}
                  className="flex-1 font-bold h-9"
                >
                  URL-Safe
                </Button>
              </div>
            </div>

            <Button 
              onPress={process} 
              color="primary"
              className="w-full mt-6 h-12 font-bold shadow-lg shadow-primary/20"
            >
              <Sparkles className="size-4 mr-2" /> 
              {mode === "encode" ? "Generate Base64" : "Decode Content"}
            </Button>
          </Card>

          {/* Quick Stats Card */}
          {result && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20">
              <h3 className="text-xs font-black uppercase opacity-60 mb-4 tracking-widest flex items-center gap-2">
                <FileDigit className="size-3" /> Transformation Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-60">Payload Size</span>
                  <span className="text-xl font-black">{result.stats.outputBytes} bytes</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                    <span>Overhead</span>
                    <span>{Math.round(result.stats.compressionRatio * 100)}%</span>
                  </div>
                  <Progress value={result.stats.compressionRatio * 100} size="sm" color="primary" className="h-1.5 bg-white/10" />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && result.isValid ? (
            <>
              <div className="flex justify-between items-center">
                <Tabs 
                  selectedKey={activeView} 
                  onSelectionChange={(k) => setActiveView(k as any)}
                  variant="solid"
                  color="primary"
                  classNames={{ tabList: "bg-muted/50 rounded-xl p-1" }}
                >
                  <Tab key="text" title="Output Text" />
                  <Tab key="preview" title="Smart Preview" />
                </Tabs>
                <div className="flex gap-2">
                  {result.detectedType === "json" && (
                    <Button size="sm" variant="flat" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                      <FileJson className="size-3 mr-1" /> Format JSON
                    </Button>
                  )}
                  <CopyButton text={result.output} />
                </div>
              </div>

              {activeView === "text" ? (
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[500px] flex flex-col">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                    <StatusBadge variant="info">{result.detectedType?.toUpperCase()} CONTENT</StatusBadge>
                    <span className="text-[10px] font-mono opacity-50">{result.stats.outputLength} chars</span>
                  </div>
                  <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background break-all">
                    <code>{result.output}</code>
                  </pre>
                </Card>
              ) : (
                <div className="space-y-6 h-[500px] overflow-auto pr-2 scrollbar-hide">
                  {/* JWT Preview */}
                  {result.detectedType === "jwt" && jwtParts && (
                    <div className="grid gap-4">
                      <Card className="p-4 border-blue-500/20 bg-blue-50/10">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Header</p>
                        <pre className="text-xs font-mono text-blue-700 dark:text-blue-300">{jwtParts.header}</pre>
                      </Card>
                      <Card className="p-4 border-purple-500/20 bg-purple-50/10">
                        <p className="text-[10px] font-black text-purple-500 uppercase mb-2">Payload (Claims)</p>
                        <pre className="text-xs font-mono text-purple-700 dark:text-purple-300">{jwtParts.payload}</pre>
                      </Card>
                      <Card className="p-4 border-divider bg-muted/10">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Signature</p>
                        <p className="text-xs font-mono break-all opacity-50">{jwtParts.signature}</p>
                      </Card>
                    </div>
                  )}

                  {/* Image Preview */}
                  {isImage && (
                    <Card className="p-6 flex flex-col items-center justify-center bg-muted/20 border-dashed border-2">
                      <img 
                        src={mode === "decode" ? `data:image/png;base64,${result.input}` : `data:image/png;base64,${result.output}`} 
                        alt="Decoded Preview" 
                        className="max-w-full max-h-[300px] rounded-lg shadow-2xl"
                      />
                      <Button size="sm" variant="flat" className="mt-4 font-bold" onPress={() => {
                        const a = document.createElement("a");
                        a.href = mode === "decode" ? `data:image/png;base64,${result.input}` : `data:image/png;base64,${result.output}`;
                        a.download = "decoded-image.png";
                        a.click();
                      }}>
                        <Download className="size-3 mr-1" /> Download Image
                      </Button>
                    </Card>
                  )}

                  {/* JSON Preview */}
                  {result.detectedType === "json" && (
                    <Card className="p-6 border-emerald-500/20 bg-emerald-50/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-emerald-600 flex items-center gap-2">
                          <Database className="size-4" /> Structured Data
                        </h3>
                        <Button size="xs" variant="flat" color="success" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                          Full Inspector <ArrowRight className="size-3 ml-1" />
                        </Button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-auto max-h-60">
                        {mode === "decode" ? JSON.stringify(JSON.parse(result.output), null, 2) : JSON.stringify(JSON.parse(result.input), null, 2)}
                      </pre>
                    </Card>
                  )}

                  {!["jwt", "image", "json"].includes(result.detectedType!) && (
                    <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
                      <FileText className="size-12 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground font-medium">Standard text content detected. No special preview available.</p>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Binary className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">Base64 Laboratory</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Transform strings or files into Base64. Our engine automatically detects JWTs, JSON, Images and PDFs for rich visualization.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
