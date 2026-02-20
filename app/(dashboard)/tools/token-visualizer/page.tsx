"use client";

import { useState, useEffect } from "react";
import {
  Binary,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  ShieldAlert,
  Database,
  Timer,
  Fingerprint,
  Info,
  Bot,
} from "lucide-react";
import { useTokenVisualizer } from "@/hooks/use-token-visualizer";
import { useAITokenize } from "@/hooks/use-ai-tokenize";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { TextArea } from "@heroui/react";
import { Card, Button } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { TokenizerProvider } from "@/types/token-visualizer";

export default function TokenVisualizerPage() {
  const { t } = useTranslation();
  const { 
    input, 
    setInput, 
    provider, 
    setProvider, 
    visualization, 
    allProviderResults, 
    tokenize,
    reset 
  } = useTokenVisualizer();

  const { tokenizeReal, aiResult: realTokenResult, isAILoading: isRealTokenizing } = useAITokenize();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();
  const [isCompareMode, setIsCompareMode] = useState(false);

  const PROVIDERS = [
    { id: "openai", label: t("tokenViz.modelOpenAI"), color: "text-emerald-500" },
    { id: "anthropic", label: t("tokenViz.modelAnthropic"), color: "text-orange-500" },
    { id: "llama", label: t("tokenViz.modelLlama"), color: "text-blue-500" },
  ] as const;

  // Auto-tokenize when input or provider changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        tokenize(input, provider, isCompareMode);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, provider, isCompareMode, tokenize]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Binary}
        gradient="from-emerald-500 to-teal-600"
        title={t("tokenViz.title")}
        description={t("tokenViz.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="token-visualizer" input={input} output={visualization?.totalTokens.toString() || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  {t("tokenViz.sourceText")}
                </h3>
                <div className="flex bg-muted p-1 rounded-xl">
                  <Button
                    isIconOnly
                    size="sm"
                    variant={!isCompareMode ? "primary" : "ghost"}
                    onPress={() => setIsCompareMode(false)}
                    aria-label={t("tokenViz.singleProviderView")}
                  >
                    <ListIcon className="size-3.5" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant={isCompareMode ? "primary" : "ghost"}
                    onPress={() => setIsCompareMode(true)}
                    aria-label={t("tokenViz.compareProviders")}
                  >
                    <LayoutGrid className="size-3.5" />
                  </Button>
                </div>
              </div>

              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("tokenViz.typePaste")}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (input.trim()) tokenize(input, provider, isCompareMode);
                  }
                }}
                className="h-64 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
                aria-label={t("tokenViz.typePaste")}
              />

              {!isCompareMode && (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("tokenViz.providerSelection")}>
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id as TokenizerProvider)}
                      role="radio"
                      aria-checked={provider === p.id}
                      aria-label={p.label}
                      className={cn(
                        "px-2 py-2 rounded-lg border text-[10px] font-black uppercase transition-all",
                        provider === p.id
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {p.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Cross-Tool Links */}
          {visualization && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="sm"
                variant="outline"
                className="font-bold text-xs"
                onPress={() => navigateTo("prompt-analyzer", input)}
              >
                {t("tokenViz.analyzePrompt")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-bold text-xs"
                onPress={() => navigateTo("cost-calculator", visualization.totalTokens.toString())}
              >
                {t("tokenViz.estimateCost")}
              </Button>
            </div>
          )}

          {/* Token Budget Bar */}
          {visualization && (
            <Card className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("tokenViz.contextBudget")}</p>
              {[
                { label: "4K", max: 4096 },
                { label: "8K", max: 8192 },
                { label: "128K", max: 131072 },
              ].map((ctx) => {
                const pct = Math.min(100, (visualization.totalTokens / ctx.max) * 100);
                return (
                  <div key={ctx.label} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground w-8">{ctx.label}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", pct > 90 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </Card>
          )}

          {/* Real BPE Tokenization */}
          {isAIEnabled && visualization && (
            <Card className="p-6 border-violet-500/20 bg-violet-500/5" role="region" aria-label={t("ai.realBPE")}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase flex items-center gap-2">
                  <Bot className="size-3 text-violet-500" aria-hidden="true" /> {t("ai.realBPE")}
                </h3>
                <div className="flex gap-2">
                  {["gpt-4o", "gpt-4", "cl100k_base"].map((model) => (
                    <Button
                      key={model}
                      size="sm"
                      variant="outline"
                      isLoading={isRealTokenizing}
                      onPress={() => tokenizeReal(input, model).catch(() => {
                        addToast(t("ai.tokenizerUnavailable"), "info");
                      })}
                      className="text-[10px] h-6 px-2"
                    >
                      {model}
                    </Button>
                  ))}
                </div>
              </div>
              {realTokenResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("tokenViz.modelLabel")}: <strong>{realTokenResult.model}</strong></span>
                    <StatusBadge variant="info">{realTokenResult.totalTokens} {t("tokenViz.realTokens")}</StatusBadge>
                  </div>
                  <div className="flex flex-wrap gap-1 p-3 bg-background/50 rounded-xl border border-violet-500/10 max-h-[150px] overflow-auto">
                    {realTokenResult.segments.map((s, i) => (
                      <span key={i} title={`Token ID: ${s.tokenId}`} className="px-1 py-0.5 rounded font-mono text-[10px] border bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 cursor-default hover:scale-110 transition-transform">
                        {s.text.replace(/ /g, "\u2423")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Efficiency Audit Card */}
          {visualization && (
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-amber-500/10 dark:from-violet-500/15 dark:to-amber-500/15 shadow-xl shadow-primary/5 border border-default-200 dark:border-default-100">
              <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                <ShieldAlert className="size-3" /> {t("tokenViz.tokenAudit")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60">{t("tokenViz.optimization")}</span>
                  <span className={cn("text-xl font-black", visualization.efficiencyScore > 80 ? "text-emerald-400" : "text-amber-400")}>
                    {visualization.efficiencyScore}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, visualization.efficiencyScore)}%` }} 
                    />
                  </div>
                </div>
                {visualization.wasteCount > 0 && (
                  <div className="p-3 bg-muted/50 rounded-xl border border-default-200">
                    <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold mb-1 uppercase tracking-tighter">{t("tokenViz.wastedDetected")}</p>
                    <p className="text-xs text-muted-foreground italic">{t("tokenViz.wastedFound", { count: String(visualization.wasteCount) })}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {visualization ? (
            <>
              {/* Leaderboard (Compare Mode) */}
              {isCompareMode && allProviderResults.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {allProviderResults.map(({ provider: p, result: r }) => {
                    const info = PROVIDERS.find(op => op.id === p);
                    return (
                      <Card
                        key={p}
                        role="button"
                        tabIndex={0}
                        className="p-4 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer"
                        onClick={() => { setProvider(p); setIsCompareMode(false); }}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setProvider(p); setIsCompareMode(false); } }}
                        aria-label={`${info?.label}: ${r.totalTokens} tokens`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={cn("text-[10px] font-black uppercase", info?.color)}>{info?.label}</span>
                          <StatusBadge variant={r.efficiencyScore > 80 ? "success" : "warning"}>{r.totalTokens} t</StatusBadge>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, r.efficiencyScore)}%` }} 
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Token Cloud */}
              <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col">
                <div className="p-4 border-b border-divider bg-muted/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <StatusBadge variant="info">
                      <Timer className="size-3 mr-1" /> {visualization.totalTokens} {t("tokenViz.totalTokens")}
                    </StatusBadge>
                    <span className="text-[10px] font-black opacity-40 uppercase">{visualization.input.length} {t("tokenViz.characters")}</span>
                  </div>
                  <CopyButton text={visualization.input} />
                </div>
                <div className="p-6 overflow-auto flex-1 bg-background scrollbar-hide">
                  <div className="flex flex-wrap gap-1.5">
                    {visualization.segments.map((s, i) => (
                      <span key={i} title={`Token #${s.tokenId}: "${s.text}"`} className={cn(
                        "px-1.5 py-0.5 rounded font-mono text-xs border transition-all hover:scale-110 cursor-default",
                        s.isWaste ? "bg-red-500/20 border-red-500/40 text-red-600 font-bold" : s.color
                      )}>
                        {s.text.replace(/ /g, "␣")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-divider bg-muted/10">
                  <p className="text-[10px] text-muted-foreground italic flex items-center gap-2">
                    <Info className="size-3" />
                    {t("tokenViz.tokenInfo")}
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">{t("tokenViz.laboratory")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {t("tokenViz.laboratoryDesc")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
