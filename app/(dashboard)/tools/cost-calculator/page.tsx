"use client";

import { useMemo } from "react";
import { Card, Button, Chip, User, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
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
} from "lucide-react";
import { useCostCalculator } from "@/hooks/use-cost-calculator";
import { useTranslation } from "@/hooks/use-translation";
import { formatCost } from "@/lib/application/cost-calculator";
import { ToolHeader } from "@/components/shared/tool-header";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { PROVIDER_LABELS } from "@/config/ai-models";
import { cn } from "@/lib/utils";
import type { CostCalculation } from "@/types/cost-calculator";

export default function CostCalculatorPage() {
  const { t } = useTranslation();

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

    switch (columnKey) {
      case "model":
        return (
          <User
            name={result.model.displayName}
            description={result.model.id}
            avatarProps={{
              radius: "lg",
              src: `https://avatar.vercel.sh/${result.model.provider}`,
              fallback: result.model.provider[0].toUpperCase()
            }}
          >
            {result.model.displayName}
          </User>
        );
      case "provider":
        return (
          <Chip
            variant="flat"
            size="sm"
            className={cn("capitalize", provider?.color)}
            startContent={<span>{provider?.emoji}</span>}
          >
            {provider?.label}
          </Chip>
        );
      case "totalCost":
        return (
          <div className="flex flex-col gap-1">
            <span className={cn("font-bold", isCheapest ? "text-success" : "text-foreground")}>
              {formatCost(result.totalCost)}
            </span>
            {isCheapest && <span className="text-[10px] text-success font-bold uppercase tracking-tighter">Cheapest</span>}
          </div>
        );
      case "value":
        return (
          <div className="flex flex-col">
            <span className={cn("font-medium", isBestValue ? "text-secondary" : "text-foreground")}>
              {result.valueScore ? (result.valueScore / 1000000).toFixed(2) : "N/A"}
            </span>
            {isBestValue && <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">Best Value</span>}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="text-default-300 size-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Action Menu">
                <DropdownItem key="details" startContent={<ExternalLink className="size-3" />}>View Stats</DropdownItem>
                <DropdownItem key="copy" startContent={<RotateCcw className="size-3" />}>Copy Config</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return (result as any)[columnKey];
    }
  }, [cheapestId, bestValueId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <ToolHeader
        title={t("costCalc.title")}
        description={t("costCalc.description")}
        breadcrumb
        actions={
          <div className="flex gap-2">
            <Button
              variant="flat"
              color="primary"
              size="sm"
              onPress={syncPrices}
              isLoading={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Prices"}
            </Button>
            <Button variant="outline" size="sm" onPress={reset} className="gap-2">
              <RotateCcw className="size-4" />
              {t("common.reset")}
            </Button>
          </div>
        }
      />

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
                    onChange={(e) => setInputTokens(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
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
                    onChange={(e) => setOutputTokens(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
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
                    onChange={(e) => setDailyRequests(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="number"
                    value={dailyRequests}
                    onChange={(e) => setDailyRequests(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1 text-sm text-right font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Result Card */}
          <Card className="p-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <p className="text-sm opacity-80 uppercase tracking-wider font-semibold mb-1">
              {t("costCalc.estimatedMonthlyCost")}
            </p>
            <p className="text-4xl font-bold mb-2">
              {formatCost(monthlyCost)}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <ArrowRight className="size-4" />
              <span>{t("costCalc.reqPerDay", { count: dailyRequests.toLocaleString() })}</span>
            </div>
          </Card>

          <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1">
              {lastSync ? <Cloud className="size-3 text-emerald-500" /> : <CloudOff className="size-3 text-amber-500" />}
              <span>Pricing Service: {lastSync ? "Online" : "Static Data"}</span>
            </div>
            {lastSync && <span>Last Sync: {new Date(lastSync).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingDown className="size-5 text-emerald-500" />
                {t("costCalc.priceComparison")}
              </h2>
              {comparison && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                  <span>
                    {t("costCalc.cheapest", { model: comparison.results[0]?.model.displayName ?? "" })}
                  </span>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
