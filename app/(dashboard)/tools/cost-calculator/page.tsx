"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { RotateCcw, TrendingDown } from "lucide-react";
import { useCostCalculator } from "@/hooks/use-cost-calculator";
import { formatCost } from "@/lib/application/cost-calculator";
import { AI_MODELS, PROVIDER_LABELS } from "@/config/ai-models";

export default function CostCalculatorPage() {
  const {
    inputTokens,
    setInputTokens,
    outputTokens,
    setOutputTokens,
    dailyRequests,
    setDailyRequests,
    selectedModelId,
    setSelectedModelId,
    comparison,
    monthlyCost,
    reset,
  } = useCostCalculator();

  const [view, setView] = useState<"comparison" | "monthly">("comparison");

  const cheapestId = comparison?.results[0]?.model.id;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            API Cost Calculator
          </h1>
          <p className="mt-1 text-muted-foreground">
            Compare costs across AI providers
          </p>
        </div>
        <Button variant="outline" size="sm" onPress={reset} className="gap-2">
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "comparison" ? "secondary" : "outline"}
          onPress={() => setView("comparison")}
        >
          Per Request
        </Button>
        <Button
          size="sm"
          variant={view === "monthly" ? "secondary" : "outline"}
          onPress={() => setView("monthly")}
        >
          Monthly Estimate
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <Card.Header className="mb-4 p-0">
              <Card.Title>Configuration</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4 p-0">
              {/* Input Tokens */}
              <div>
                <label htmlFor="input-tokens" className="text-sm font-medium text-muted-foreground">
                  Input Tokens
                </label>
                <input
                  id="input-tokens"
                  type="number"
                  min={0}
                  value={inputTokens}
                  onChange={(e) =>
                    setInputTokens(Math.max(0, Number(e.target.value)))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Output Tokens */}
              <div>
                <label htmlFor="output-tokens" className="text-sm font-medium text-muted-foreground">
                  Output Tokens
                </label>
                <input
                  id="output-tokens"
                  type="number"
                  min={0}
                  value={outputTokens}
                  onChange={(e) =>
                    setOutputTokens(Math.max(0, Number(e.target.value)))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Monthly View Extra Fields */}
              {view === "monthly" && (
                <>
                  <div>
                    <label htmlFor="daily-requests" className="text-sm font-medium text-muted-foreground">
                      Daily Requests
                    </label>
                    <input
                      id="daily-requests"
                      type="number"
                      min={1}
                      value={dailyRequests}
                      onChange={(e) =>
                        setDailyRequests(Math.max(1, Number(e.target.value)))
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="model-select" className="text-sm font-medium text-muted-foreground">
                      Model
                    </label>
                    <select
                      id="model-select"
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {AI_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.displayName} (
                          {PROVIDER_LABELS[model.provider]?.label})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Quick Presets */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Presets
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "Chat", input: 500, output: 200 },
                    { label: "Code", input: 2000, output: 1000 },
                    { label: "Analysis", input: 5000, output: 500 },
                    { label: "Summary", input: 10000, output: 300 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setInputTokens(preset.input);
                        setOutputTokens(preset.output);
                      }}
                      className="rounded-full bg-muted px-3 py-1 text-xs transition-colors hover:bg-muted/80"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Monthly Cost Card */}
          {view === "monthly" && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-950/30 dark:to-indigo-950/30">
              <Card.Content className="p-0 text-center">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Estimated Monthly Cost
                </p>
                <p className="mt-1 text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCost(monthlyCost)}
                </p>
                <p className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                  {dailyRequests} req/day × 30 days
                </p>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Card.Header className="mb-4 flex items-center justify-between p-0">
              <Card.Title>
                {view === "comparison" ? "Price Comparison" : "All Models"}
              </Card.Title>
              {comparison && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <TrendingDown className="size-4" />
                  <span>Cheapest: {comparison.results[0]?.model.displayName}</span>
                </div>
              )}
            </Card.Header>
            <Card.Content className="p-0">
              {comparison ? (
                <Table aria-label="Cost comparison" className="min-w-full">
                  <TableHeader>
                    <TableColumn>Model</TableColumn>
                    <TableColumn>Provider</TableColumn>
                    <TableColumn>Input</TableColumn>
                    <TableColumn>Output</TableColumn>
                    <TableColumn>Total</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {comparison.results.map((result) => {
                      const provider = PROVIDER_LABELS[result.model.provider];
                      const isCheapest = result.model.id === cheapestId;

                      return (
                        <TableRow
                          key={result.model.id}
                          className={isCheapest ? "bg-emerald-50 dark:bg-emerald-950/20" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isCheapest && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                                  Best
                                </span>
                              )}
                              <span className="font-medium">
                                {result.model.displayName}
                              </span>
                              {result.model.isPopular && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                                  Popular
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${provider?.color}`}
                            >
                              {provider?.emoji} {provider?.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCost(result.inputCost)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCost(result.outputCost)}
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${isCheapest ? "text-emerald-600" : ""}`}
                          >
                            {formatCost(result.totalCost)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Enter token counts to see comparison
                </p>
              )}
            </Card.Content>
          </Card>

          {/* Context Windows Info */}
          <Card className="mt-4 p-6">
            <Card.Header className="mb-4 p-0">
              <Card.Title className="text-sm text-muted-foreground">
                Context Windows
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3 p-0">
              {AI_MODELS.filter((m) => m.isPopular).map((model) => {
                const provider = PROVIDER_LABELS[model.provider];
                const percentage = Math.min(
                  (model.contextWindow / 1_000_000) * 100,
                  100
                );

                return (
                  <div key={model.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>
                        {provider?.emoji} {model.displayName}
                      </span>
                      <span className="text-muted-foreground">
                        {model.contextWindow.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
