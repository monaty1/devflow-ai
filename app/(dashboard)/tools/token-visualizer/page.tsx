"use client";

import { Card, Button, Chip } from "@heroui/react";
import { RotateCcw, Sparkles, LayoutGrid, List as ListIcon } from "lucide-react";
import { useTokenVisualizer } from "@/hooks/use-token-visualizer";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { formatCost } from "@/lib/application/cost-calculator";

export default function TokenVisualizerPage() {
  const { t } = useTranslation();
  const { input, setInput, provider, setProvider, visualization, allProviderResults, reset } = useTokenVisualizer();
  const [isCompareMode, setIsCompareMode] = useState(false);

  const PROVIDERS = [
    { id: "openai", label: t("tokenViz.modelOpenAI") },
    { id: "anthropic", label: t("tokenViz.modelAnthropic") },
    { id: "llama", label: t("tokenViz.modelLlama") },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <ToolHeader
        title={t("tokenViz.title")}
        description={t("tokenViz.description")}
        breadcrumb
        actions={
          <div className="flex gap-2">
            {visualization && (
              <CopyButton
                getText={() =>
                  `Tokens (${visualization.provider}): ${visualization.totalTokens}\nEfficiency: ${visualization.efficiencyScore}%\nInput: ${visualization.input}`
                }
                label={t("common.copy")}
                variant="outline"
              />
            )}
            <Button variant="outline" size="sm" onPress={reset} className="gap-2">
              <RotateCcw className="size-4" />
              {t("common.reset")}
            </Button>
          </div>
        }
      />

      {/* View Toggle & Model Selector */}
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setIsCompareMode(false)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              !isCompareMode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListIcon className="size-4" /> Single
          </button>
          <button
            onClick={() => setIsCompareMode(true)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              isCompareMode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" /> Compare All
          </button>
        </div>

        {!isCompareMode && (
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id as any)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  provider === p.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <Card className="p-6">
        <Card.Header className="mb-4 p-0">
          <Card.Title>{t("tokenViz.inputText")}</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("tokenViz.placeholder")}
            className="h-40 w-full resize-none rounded-lg border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Card.Content>
      </Card>

      {/* Stats Bar (Single Mode) */}
      {visualization && !isCompareMode && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("tokenViz.totalTokens")}</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {visualization.totalTokens}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("tokenViz.efficiencyScore")}</p>
              <p className={`text-3xl font-bold mt-1 ${
                visualization.efficiencyScore > 80 ? "text-emerald-600" : visualization.efficiencyScore > 50 ? "text-amber-600" : "text-red-600"
              }`}>
                {visualization.efficiencyScore}%
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("tokenViz.wasteTokens")}</p>
              <p className={`text-3xl font-bold mt-1 ${visualization.wasteCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {visualization.wasteCount}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("tokenViz.characters")}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {visualization.input.length}
              </p>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Stats Bar (Compare Mode) */}
      {isCompareMode && allProviderResults.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {allProviderResults.map(({ provider: p, result: r }) => (
            <Card key={p} className="p-6 border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{p.toUpperCase()}</h3>
                <StatusBadge variant={r.efficiencyScore > 80 ? "success" : "warning"}>
                  {r.efficiencyScore}%
                </StatusBadge>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Total Tokens</span>
                  <span className="text-2xl font-bold text-primary">{r.totalTokens}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Wasted</span>
                  <span className={`text-lg font-semibold ${r.wasteCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>{r.wasteCount}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="flat" 
                  className="w-full"
                  onPress={() => {
                    setProvider(p);
                    setIsCompareMode(false);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Token Visualization (Single Mode Only) */}
      {visualization && !isCompareMode && (
        <Card className="p-6">
          <Card.Header className="mb-4 p-0">
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>{t("tokenViz.tokenBreakdown")}</Card.Title>
                <Card.Description>
                  {t("tokenViz.tokenDescription")}
                </Card.Description>
              </div>
              {visualization.wasteCount > 0 && (
                <Chip size="sm" color="warning" variant="flat" className="gap-1">
                  <span className="font-bold">{visualization.wasteCount}</span> {t("tokenViz.wasteTokens")}
                </Chip>
              )}
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/30 p-4 min-h-[100px]">
              {visualization.segments.map((segment, i) => (
                <span
                  key={i}
                  className={`inline-flex cursor-default items-center rounded border px-2 py-1 font-mono text-xs transition-all duration-200 hover:scale-110 shadow-sm ${
                    segment.isWaste 
                      ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800" 
                      : segment.color
                  }`}
                  title={segment.isWaste ? "Inefficient token (waste)" : `Token #${segment.tokenId}`}
                >
                  {segment.text.replace(/ /g, "␣")}
                  <span className="ml-1.5 text-[9px] opacity-40">
                    {segment.tokenId}
                  </span>
                </span>
              ))}
            </div>

            {/* Legend & Advice */}
            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground italic">
                {t("tokenViz.legend")}
              </p>
              {visualization.wasteCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                  <div className="mt-0.5 size-1.5 rounded-full bg-amber-500" />
                  <p className="text-xs">{t("tokenViz.wasteDesc")}</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {!visualization && (
        <Card className="p-16">
          <Card.Content className="p-0 text-center">
            <Sparkles className="mx-auto mb-4 size-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t("tokenViz.emptyState")}
            </p>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
