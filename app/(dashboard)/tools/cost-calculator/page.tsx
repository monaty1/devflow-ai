"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Chip, Modal, Slider, NumberField, Input, Label } from "@heroui/react";
import {
  RotateCcw,
  TrendingDown,
  RefreshCw,
  Cloud,
  CloudOff,
  Coins,
  ArrowRight,
  Eye,
  Sparkles,
  Download,
  Cpu,
  Zap,
  BarChart3,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useCostCalculator } from "@/hooks/use-cost-calculator";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";

const CostProjectionChart = dynamic(
  () => import("@/components/tools/cost-projection-chart").then(m => m.CostProjectionChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted/50" /> },
);
import { useTranslation } from "@/hooks/use-translation";
import { formatCost, exportComparisonCsv } from "@/lib/application/cost-calculator";
import type { Currency } from "@/lib/application/cost-calculator";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { PROVIDER_LABELS } from "@/config/ai-models";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { CostCalculation } from "@/types/cost-calculator";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
];

export default function CostCalculatorPage() {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<Currency>("USD");

  const {
    inputTokens,
    setInputTokens,
    outputTokens,
    setOutputTokens,
    dailyRequests,
    setDailyRequests,
    comparison,
    monthlyCost,
    reset,
    isSyncing,
    isUsingFallback,
    lastSync,
    syncPrices,
  } = useCostCalculator();

  const { adviseCostWithAI, aiResult, isAILoading, aiError } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);

  const [detailModel, setDetailModel] = useState<CostCalculation | null>(null);

  const providerOptions = useMemo(() =>
    Object.entries(PROVIDER_LABELS).map(([uid, p]) => ({ uid, name: `${p.emoji} ${p.label}` })),
    []
  );

  const cheapestId = comparison?.results[0]?.model.id;
  const bestValueId = useMemo(() => {
    if (!comparison) return null;
    return [...comparison.results].sort((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0))[0]?.model.id;
  }, [comparison]);

  const columns: ColumnConfig[] = [
    { name: t("costCalc.colModel"), uid: "model", sortable: true },
    { name: t("costCalc.colProvider"), uid: "provider", sortable: true },
    { name: t("costCalc.colTotalCost"), uid: "totalCost", sortable: true },
    { name: t("costCalc.colValueScore"), uid: "value", sortable: true },
    { name: t("costCalc.colActions"), uid: "actions" },
  ];

  const renderCell = useCallback((result: CostCalculation, columnKey: React.Key) => {
    const provider = PROVIDER_LABELS[result.model.provider];
    const isCheapest = result.model.id === cheapestId;
    const isBestValue = result.model.id === bestValueId;
    const key = columnKey.toString();

    switch (key) {
      case "model":
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm">{result.model.displayName}</span>
            {result.model.id !== result.model.displayName && (
              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{result.model.id}</span>
            )}
          </div>
        );
      case "provider":
        return (
          <Chip
            variant="primary"
            size="sm"
            className={cn("capitalize font-bold h-6", provider?.color)}
          >
            <div className="flex items-center gap-1">
              <span>{provider?.emoji}</span>
              {provider?.label}
            </div>
          </Chip>
        );
      case "totalCost":
        return (
          <div className="flex flex-col gap-1">
            <span className={cn("font-bold", isCheapest ? "text-success" : "text-foreground")}>
              {formatCost(result.totalCost, currency)}
            </span>
            {isCheapest && (
              <span className="text-[10px] text-success font-bold uppercase tracking-tighter flex items-center gap-0.5">
                <TrendingDown className="size-3" />
                {t("costCalc.cheapestLabel")}
              </span>
            )}
          </div>
        );
      case "value":
        return (
          <div className="flex flex-col">
            <span className={cn("font-medium", isBestValue ? "text-secondary" : "text-foreground")}>
              {result.valueScore
                ? (result.valueScore / 1000000).toFixed(2)
                : <span className="text-muted-foreground/50">&mdash;</span>
              }
            </span>
            {isBestValue && <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">{t("costCalc.bestValueLabel")}</span>}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={t("costCalc.detailTitle")}
              onPress={() => setDetailModel(result)}
            >
              <Eye className="size-4 text-muted-foreground" />
            </Button>
            <CopyButton
              text={JSON.stringify({ model: result.model.id, provider: result.model.provider, inputTokens, outputTokens, dailyRequests, totalCost: result.totalCost }, null, 2)}
              variant="ghost"
              size="sm"
            />
          </div>
        );
      default:
        return String(result[key as keyof typeof result] ?? "");
    }
  }, [cheapestId, bestValueId, inputTokens, outputTokens, dailyRequests, currency, t]);

  const chartData = useMemo(() => {
    if (!comparison || comparison.results.length === 0) return [];
    
    // Top 5 models for the chart
    const topModels = comparison.results.slice(0, 5);
    
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const dataPoint: Record<string, string | number> = { day: `Day ${day}` };
      
      topModels.forEach(result => {
        // Daily cost * number of days
        dataPoint[result.model.displayName] = Number((result.totalCost * dailyRequests * day).toFixed(2));
      });
      
      return dataPoint;
    });
  }, [comparison, dailyRequests]);

  const topModelNames = useMemo(() => {
    if (!comparison) return [];
    return comparison.results.slice(0, 5).map(r => r.model.displayName);
  }, [comparison]);


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Coins}
        gradient="from-emerald-500 to-teal-600"
        title={t("costCalc.title")}
        description={t("costCalc.description")}
        breadcrumb
        actions={
          <div className="flex items-center gap-2">
            {isUsingFallback && !isSyncing && (
              <Chip size="sm" variant="soft" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                {t("costCalc.cachedPrices")}
              </Chip>
            )}
            <Button
              variant="ghost"
              size="sm"
              onPress={syncPrices}
              isLoading={isSyncing}
              className="gap-2 text-primary"
            >
              <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? t("costCalc.syncing") : t("costCalc.syncPrices")}
            </Button>
            <Button variant="outline" size="sm" onPress={reset} className="gap-2">
              <RotateCcw className="size-4" />
              {t("common.reset")}
            </Button>
          </div>
        }
      />

      <ToolSuggestions toolId="cost-calculator" input={inputTokens.toString()} output={monthlyCost.toString()} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
              <Coins className="size-5 text-primary" />
              <h2 className="font-semibold">{t("common.configuration")}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Slider
                  minValue={0}
                  maxValue={100000}
                  step={1000}
                  value={inputTokens}
                  onChange={(v) => setInputTokens(typeof v === "number" ? v : 0)}
                  className="w-full"
                >
                  <Label>{t("costCalc.inputTokens")}</Label>
                  <Slider.Output />
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <NumberField
                  value={inputTokens}
                  onChange={(v) => setInputTokens(v)}
                  minValue={0}
                  maxValue={100000}
                  step={1000}
                  aria-label={t("costCalc.inputTokens")}
                  className="mt-2"
                >
                  <Input className="w-24 text-right font-mono text-sm" />
                </NumberField>
              </div>

              <div>
                <Slider
                  minValue={0}
                  maxValue={50000}
                  step={500}
                  value={outputTokens}
                  onChange={(v) => setOutputTokens(typeof v === "number" ? v : 0)}
                  className="w-full"
                >
                  <Label>{t("costCalc.outputTokens")}</Label>
                  <Slider.Output />
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <NumberField
                  value={outputTokens}
                  onChange={(v) => setOutputTokens(v)}
                  minValue={0}
                  maxValue={50000}
                  step={500}
                  aria-label={t("costCalc.outputTokens")}
                  className="mt-2"
                >
                  <Input className="w-24 text-right font-mono text-sm" />
                </NumberField>
              </div>

              <div>
                <Slider
                  minValue={1}
                  maxValue={10000}
                  step={100}
                  value={dailyRequests}
                  onChange={(v) => setDailyRequests(typeof v === "number" ? v : 1)}
                  className="w-full"
                >
                  <Label>{t("costCalc.dailyRequests")}</Label>
                  <Slider.Output />
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <NumberField
                  value={dailyRequests}
                  onChange={(v) => setDailyRequests(v)}
                  minValue={1}
                  maxValue={10000}
                  step={100}
                  aria-label={t("costCalc.dailyRequests")}
                  className="mt-2"
                >
                  <Input className="w-24 text-right font-mono text-sm" />
                </NumberField>
              </div>
            </div>
          </Card>

          {/* Result Card */}
          <Card className="p-6 bg-primary text-white shadow-lg shadow-primary/20 border-none">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">
                {t("costCalc.estimatedMonthlyCost")}
              </p>
              <div className="flex gap-1">
                {CURRENCIES.map((c) => (
                  <Button
                    key={c.value}
                    size="sm"
                    variant="ghost"
                    onPress={() => setCurrency(c.value)}
                    className={cn(
                      "min-w-0 px-2 text-xs font-bold",
                      currency === c.value ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
                    )}
                    aria-label={c.label}
                  >
                    {c.symbol}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">
              {formatCost(monthlyCost, currency)}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <ArrowRight className="size-4" />
              <span>{t("costCalc.reqPerDay", { count: dailyRequests.toLocaleString() })}</span>
            </div>
          </Card>

          <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1">
              {lastSync ? <Cloud className="size-3 text-emerald-500 dark:text-emerald-400" /> : <CloudOff className="size-3 text-amber-500 dark:text-amber-400" />}
              <span>{t("costCalc.pricingService")} {lastSync ? t("costCalc.pricingOnline") : t("costCalc.pricingStatic")}</span>
            </div>
            {lastSync && <span>{t("costCalc.lastSyncLabel")} {new Date(lastSync).toLocaleDateString()}</span>}
          </div>

          {isAIEnabled && (
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-500/20 dark:border-violet-500/10">
              <h3 className="text-xs font-black uppercase text-violet-600 dark:text-violet-400 mb-4 flex items-center gap-2 tracking-widest">
                <Bot className="size-3" /> {t("costCalc.aiAdvisor")}
              </h3>
              <Button
                size="sm"
                variant="primary"
                className="w-full font-bold bg-violet-600 hover:bg-violet-700 border-none shadow-lg shadow-violet-500/20 mb-4"
                onPress={() => {
                  const cheapest = comparison?.results[0];
                  const scenario = `Input tokens: ${inputTokens}, Output tokens: ${outputTokens}, Daily requests: ${dailyRequests}, Monthly cost estimate: $${monthlyCost.toFixed(4)}, Cheapest model: ${cheapest?.model.displayName ?? "unknown"} at $${cheapest?.totalCost.toFixed(6) ?? "?"}/req`;
                  void adviseCostWithAI(scenario);
                }}
                isLoading={isAILoading}
              >
                <Bot className="size-4 mr-2" /> {t("costCalc.aiAdviseBtn")}
              </Button>
              {isAILoading && (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-violet-500/20 rounded w-3/4" />
                  <div className="h-3 bg-violet-500/20 rounded w-1/2" />
                </div>
              )}
              {aiResult?.suggestions && aiResult.suggestions.length > 0 && !isAILoading && (
                <div className="space-y-3">
                  {aiResult.suggestions.map((s, i) => (
                    <div key={i} className="p-3 bg-background/80 rounded-xl border border-violet-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-violet-500">{t("costCalc.aiStrategy")} #{i + 1}</span>
                        <span className="text-[10px] font-bold text-violet-400">{s.score}/100</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">{s.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {isAIEnabled && aiError && (
            <Card className="p-3 border-danger/30 bg-danger/5" role="alert">
              <p className="text-xs text-danger font-bold flex items-center gap-2">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                {t("ai.errorOccurred", { message: aiError.message })}
              </p>
            </Card>
          )}
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingDown className="size-5 text-emerald-500 dark:text-emerald-400" />
                {t("costCalc.priceComparison")}
              </h2>
              <div className="flex items-center gap-2">
                {comparison && (
                  <>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      <span>
                        {t("costCalc.cheapest", { model: comparison.results[0]?.model.displayName ?? "" })}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        const csv = exportComparisonCsv(comparison, currency);
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `cost-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      aria-label={t("costCalc.exportCsv")}
                    >
                      <Download className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {comparison ? (
              <DataTable
                columns={columns}
                data={comparison.results}
                filterField="model.displayName"
                statusOptions={providerOptions}
                statusFilterField="model.provider"
                statusLabel={t("costCalc.colProvider")}
                initialVisibleColumns={["model", "provider", "totalCost", "value", "actions"]}
                renderCell={renderCell}
                placeholder={t("costCalc.search")}
                emptyContent={t("costCalc.noModels")}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
                <Coins className="size-10 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">{t("costCalc.emptyState")}</p>
              </div>
            )}
          </Card>

        </div>
      </div>

      {/* Projection Chart — full width, outside the grid */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Sparkles className="size-5 text-warning" />
          {t("costCalc.projectionTitle")}
        </h3>
        <div className="h-[350px] w-full">
          <CostProjectionChart chartData={chartData} topModelNames={topModelNames} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-4 italic text-center">
          {t("costCalc.projectionNote")}
        </p>
      </Card>

      {/* Detail Modal */}
      {(() => {
        const provider = detailModel ? PROVIDER_LABELS[detailModel.model.provider] : null;
        const isCheapest = detailModel?.model.id === cheapestId;
        const isBestValue = detailModel?.model.id === bestValueId;
        const monthlyCostModel = detailModel ? detailModel.totalCost * dailyRequests * 30 : 0;

        return (
          <Modal.Backdrop isOpen={!!detailModel} onOpenChange={(open) => { if (!open) setDetailModel(null); }}>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-lg">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon className="bg-primary/10 text-primary">
                    <Cpu className="size-5" />
                  </Modal.Icon>
                  <Modal.Heading>{detailModel?.model.displayName ?? ""}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {detailModel && (
                    <div className="space-y-4">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{detailModel.model.id}</span>
                        {isCheapest && (
                          <Chip size="sm" variant="primary" className="bg-success/20 text-success text-xs">
                            {t("costCalc.cheapestLabel")}
                          </Chip>
                        )}
                        {isBestValue && (
                          <Chip size="sm" variant="primary" className="bg-secondary/20 text-secondary text-xs">
                            {t("costCalc.bestValueLabel")}
                          </Chip>
                        )}
                      </div>

                      {/* Provider */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("costCalc.colProvider")}</span>
                        <Chip variant="primary" size="sm" className={cn("capitalize font-bold h-6", provider?.color)}>
                          <span className="mr-1">{provider?.emoji}</span>
                          {provider?.label}
                        </Chip>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Zap className="size-3" />
                            {t("costCalc.detailInputPrice")}
                          </div>
                          <p className="font-bold text-lg">${detailModel.model.inputPricePerMToken.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{t("costCalc.detailMTokens")}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Zap className="size-3" />
                            {t("costCalc.detailOutputPrice")}
                          </div>
                          <p className="font-bold text-lg">${detailModel.model.outputPricePerMToken.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{t("costCalc.detailMTokens")}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">{t("costCalc.detailContext")}</span>
                          <span className="font-mono font-bold">{detailModel.model.contextWindow.toLocaleString()} {t("costCalc.detailTokens")}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">{t("costCalc.detailMaxOutput")}</span>
                          <span className="font-mono font-bold">{detailModel.model.maxOutput.toLocaleString()} {t("costCalc.detailTokens")}</span>
                        </div>
                        {detailModel.model.benchmarkScore !== undefined && (
                          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <BarChart3 className="size-3" />
                              {t("costCalc.detailBenchmark")}
                            </span>
                            <span className="font-bold">{detailModel.model.benchmarkScore}%</span>
                          </div>
                        )}
                      </div>

                      {/* Cost Summary */}
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t("costCalc.detailPerRequest")}</span>
                          <span className="font-bold text-primary">{formatCost(detailModel.totalCost, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t("costCalc.detailMonthly")}</span>
                          <span className="font-bold text-xl text-primary">{formatCost(monthlyCostModel, currency)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {t("costCalc.reqPerDay", { count: dailyRequests.toLocaleString() })}
                        </p>
                      </div>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="ghost" slot="close">
                    {t("costCalc.close")}
                  </Button>
                  <CopyButton
                    text={detailModel ? JSON.stringify({
                      model: detailModel.model.id,
                      provider: detailModel.model.provider,
                      inputTokens,
                      outputTokens,
                      dailyRequests,
                      totalCost: detailModel.totalCost,
                      monthlyCost: monthlyCostModel,
                    }, null, 2) : ""}
                    label={t("costCalc.copyConfig")}
                  />
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        );
      })()}
    </div>
  );
}
