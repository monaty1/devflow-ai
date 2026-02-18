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
} from "lucide-react";
import { useTokenVisualizer } from "@/hooks/use-token-visualizer";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, Button } from "@/components/ui";
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  Source Text
                </h3>
                <div className="flex bg-muted p-1 rounded-xl">
                  <Button
                    isIconOnly
                    size="sm"
                    variant={!isCompareMode ? "primary" : "ghost"}
                    onPress={() => setIsCompareMode(false)}
                    aria-label="Single provider view"
                  >
                    <ListIcon className="size-3.5" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant={isCompareMode ? "primary" : "ghost"}
                    onPress={() => setIsCompareMode(true)}
                    aria-label="Compare providers"
                  >
                    <LayoutGrid className="size-3.5" />
                  </Button>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text to visualize tokenization..."
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (input.trim()) tokenize(input, provider, isCompareMode);
                  }
                }}
                className="h-64 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
              />

              {!isCompareMode && (
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id as TokenizerProvider)}
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
                Analyze Prompt
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-bold text-xs"
                onPress={() => navigateTo("cost-calculator", visualization.totalTokens.toString())}
              >
                Estimate Cost
              </Button>
            </div>
          )}

          {/* Efficiency Audit Card */}
          {visualization && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20 border-none">
              <h3 className="text-xs font-black uppercase opacity-60 mb-4 tracking-widest flex items-center gap-2">
                <ShieldAlert className="size-3" /> Token Audit
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-60">Optimization</span>
                  <span className={cn("text-xl font-black", visualization.efficiencyScore > 80 ? "text-emerald-400" : "text-amber-400")}>
                    {visualization.efficiencyScore}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, visualization.efficiencyScore)}%` }} 
                    />
                  </div>
                </div>
                {visualization.wasteCount > 0 && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-amber-300 font-bold mb-1 uppercase tracking-tighter">Wasted Tokens Detected</p>
                    <p className="text-xs opacity-70 italic">Found {visualization.wasteCount} redundant spaces or invisible characters.</p>
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
                      <Card key={p} className="p-4 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer" onClick={() => {
                        setProvider(p);
                        setIsCompareMode(false);
                      }}>
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
                      <Timer className="size-3 mr-1" /> {visualization.totalTokens} Tokens
                    </StatusBadge>
                    <span className="text-[10px] font-black opacity-40 uppercase">{visualization.input.length} Characters</span>
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
                    Each box represents a token. Red highlights indicate &quot;waste&quot; (extra spaces/redundancy).
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">Token Laboratory</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Analyze how different AI models (GPT-4, Claude, Llama) see your text. Optimize your prompts by reducing wasted tokens.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
