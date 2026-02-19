"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
  RotateCcw,
  TrendingDown,
  RefreshCw,
  Cloud,
  CloudOff,
  Coins,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  Sparkles,
  Download,
} from "lucide-react";
import { useCostCalculator } from "@/hooks/use-cost-calculator";

const CostProjectionChart = dynamic(
  () => import("@/components/tools/cost-projection-chart").then(m => m.CostProjectionChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted/50" /> },
);
import { useTranslation } from "@/hooks/use-translation";
import { formatCost, exportComparisonCsv } from "@/lib/application/cost-calculator";
import type { Currency } from "@/lib/application/cost-calculator";
import { ToolHeader } from "@/components/shared/tool-header";
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
    lastSync,
    syncPrices,
  } = useCostCalculator();

  const cheapestId = comparison?.results[0]?.model.id;
  const bestValueId = useMemo(() => {
    if (!comparison) return null;
    return [...comparison.results].sort((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0))[0]?.model.id;
  }, [comparison]);

  const columns: ColumnConfig[] = [
    { name: "MODEL", uid: "model", sortable: true },
    { name: "PROVIDER", uid: "provider", sortable: true },
    { name: "TOTAL COST", uid: "totalCost", sortable: true },
    { name: "VALUE SCORE", uid: "value", sortable: true },
    { name: "ACTIONS", uid: "actions" },
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
            <span className="text-[10px] text-muted-foreground font-mono">{result.model.id}</span>
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
            {isCheapest && <span className="text-[10px] text-success font-bold uppercase tracking-tighter">{t("costCalc.cheapestLabel")}</span>}
          </div>
        );
      case "value":
        return (
          <div className="flex flex-col">
            <span className={cn("font-medium", isBestValue ? "text-secondary" : "text-foreground")}>
              {result.valueScore ? (result.valueScore / 1000000).toFixed(2) : "N/A"}
            </span>
            {isBestValue && <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">{t("costCalc.bestValueLabel")}</span>}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="ghost" aria-label={t("costCalc.viewStats")}>
                  <MoreVertical className="text-default-300 size-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Action Menu">
                <DropdownItem key="details">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="size-3" />
                    <span>{t("costCalc.viewStats")}</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="copy" onPress={() => {
                  const configStr = JSON.stringify({ model: result.model.id, provider: result.model.provider, inputTokens, outputTokens, dailyRequests, totalCost: result.totalCost }, null, 2);
                  navigator.clipboard.writeText(configStr);
                }}>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-3" />
                    <span>{t("costCalc.copyConfig")}</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Coins}
        gradient="from-emerald-500 to-teal-600"
        title={t("costCalc.title")}
        description={t("costCalc.description")}
        breadcrumb
        actions={
          <div className="flex gap-2">
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
                <label className="mb-2 block text-sm font-medium">
                  {t("costCalc.inputTokens")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                    aria-label={t("costCalc.inputTokens")}
                  />
                  <input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
                    aria-label={t("costCalc.inputTokens")}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("costCalc.outputTokens")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                    aria-label={t("costCalc.outputTokens")}
                  />
                  <input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
                    aria-label={t("costCalc.outputTokens")}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("costCalc.dailyRequests")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10000"
                    step="100"
                    value={dailyRequests}
                    onChange={(e) => setDailyRequests(Number.isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                    aria-label={t("costCalc.dailyRequests")}
                  />
                  <input
                    type="number"
                    value={dailyRequests}
                    onChange={(e) => setDailyRequests(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
                    aria-label={t("costCalc.dailyRequests")}
                  />
                </div>
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
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCurrency(c.value)}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold transition-colors",
                      currency === c.value ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
                    )}
                    aria-label={c.label}
                  >
                    {c.symbol}
                  </button>
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
              {lastSync ? <Cloud className="size-3 text-emerald-500" /> : <CloudOff className="size-3 text-amber-500" />}
              <span>{t("costCalc.pricingService")} {lastSync ? t("costCalc.pricingOnline") : t("costCalc.pricingStatic")}</span>
            </div>
            {lastSync && <span>{t("costCalc.lastSyncLabel")} {new Date(lastSync).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingDown className="size-5 text-emerald-500" />
                {t("costCalc.priceComparison")}
              </h2>
              <div className="flex items-center gap-2">
                {comparison && (
                  <>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
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

          {/* Projection Chart */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Sparkles className="size-5 text-warning" />
              {t("costCalc.projectionTitle")}
            </h3>
            <div className="h-[300px] w-full">
              <CostProjectionChart chartData={chartData} topModelNames={topModelNames} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 italic text-center">
              {t("costCalc.projectionNote")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
