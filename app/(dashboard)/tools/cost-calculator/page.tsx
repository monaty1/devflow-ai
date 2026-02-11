"use client";

import { useState, useMemo, useCallback } from "react";
import type { Selection, SortDescriptor, Key } from "@react-types/shared";
import { Card, Button, Chip } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import {
  RotateCcw,
  TrendingDown,
  Search,
  ChevronDown,
} from "lucide-react";
import { useCostCalculator } from "@/hooks/use-cost-calculator";
import { formatCost } from "@/lib/application/cost-calculator";
import { ToolHeader } from "@/components/shared/tool-header";
import { AI_MODELS, PROVIDER_LABELS } from "@/config/ai-models";
import type { CostCalculation } from "@/types/cost-calculator";

const columns = [
  { uid: "model", name: "Model", sortable: true },
  { uid: "provider", name: "Provider", sortable: true },
  { uid: "inputCost", name: "Input Cost", sortable: true },
  { uid: "outputCost", name: "Output Cost", sortable: true },
  { uid: "totalCost", name: "Total", sortable: true },
  { uid: "contextWindow", name: "Context", sortable: true },
] as const;

type ColumnUid = (typeof columns)[number]["uid"];

const providerOptions = [
  { uid: "openai", name: "OpenAI" },
  { uid: "anthropic", name: "Anthropic" },
  { uid: "google", name: "Google" },
  { uid: "meta", name: "Meta" },
] as const;

const INITIAL_VISIBLE_COLUMNS: ColumnUid[] = [
  "model",
  "provider",
  "inputCost",
  "outputCost",
  "totalCost",
];

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
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set<Key>([])
  );
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set<Key>(INITIAL_VISIBLE_COLUMNS)
  );
  const [providerFilter, setProviderFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "totalCost",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const cheapestId = comparison?.results[0]?.model.id;
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return [...columns];
    return columns.filter((col) => visibleColumns.has(col.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!comparison) return [];
    let filtered = [...comparison.results];

    if (hasSearchFilter) {
      filtered = filtered.filter(
        (r) =>
          r.model.displayName
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          r.model.provider
            .toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    if (providerFilter !== "all" && providerFilter.size !== providerOptions.length) {
      filtered = filtered.filter((r) => providerFilter.has(r.model.provider));
    }

    return filtered;
  }, [comparison, filterValue, providerFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...paginatedItems].sort((a, b) => {
      const col = sortDescriptor.column as string;
      let first: number | string;
      let second: number | string;

      switch (col) {
        case "model":
          first = a.model.displayName;
          second = b.model.displayName;
          break;
        case "provider":
          first = a.model.provider;
          second = b.model.provider;
          break;
        case "inputCost":
          first = a.inputCost;
          second = b.inputCost;
          break;
        case "outputCost":
          first = a.outputCost;
          second = b.outputCost;
          break;
        case "totalCost":
          first = a.totalCost;
          second = b.totalCost;
          break;
        case "contextWindow":
          first = a.model.contextWindow;
          second = b.model.contextWindow;
          break;
        default:
          return 0;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, paginatedItems]);

  const renderCell = useCallback(
    (result: CostCalculation, columnKey: Key) => {
      const provider = PROVIDER_LABELS[result.model.provider];
      const isCheapest = result.model.id === cheapestId;

      switch (columnKey) {
        case "model":
          return (
            <div className="flex items-center gap-2">
              {isCheapest && (
                <Chip size="sm" color="success" variant="soft">
                  Best
                </Chip>
              )}
              <span className="font-medium">{result.model.displayName}</span>
              {result.model.isPopular && (
                <Chip size="sm" color="warning" variant="soft">
                  Popular
                </Chip>
              )}
            </div>
          );
        case "provider":
          return (
            <Chip size="sm" variant="soft" className={provider?.color ?? ""}>
              {provider?.emoji} {provider?.label}
            </Chip>
          );
        case "inputCost":
          return (
            <span className="text-sm">{formatCost(result.inputCost)}</span>
          );
        case "outputCost":
          return (
            <span className="text-sm">{formatCost(result.outputCost)}</span>
          );
        case "totalCost":
          return (
            <span
              className={`font-semibold ${isCheapest ? "text-emerald-600" : ""}`}
            >
              {formatCost(result.totalCost)}
            </span>
          );
        case "contextWindow":
          return (
            <span className="text-sm text-muted-foreground">
              {result.model.contextWindow.toLocaleString()}
            </span>
          );
        default:
          return null;
      }
    },
    [cheapestId]
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div className="relative w-full sm:max-w-[44%]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search by model or provider..."
              value={filterValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {filterValue && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <span className="text-xs">&#x2715;</span>
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                className="hidden appearance-none rounded-lg border border-default-200 bg-default-100 px-3 py-2 pr-8 text-sm sm:block"
                multiple
                value={
                  providerFilter === "all"
                    ? providerOptions.map((p) => p.uid)
                    : Array.from(providerFilter).map(String)
                }
                onChange={(e) => {
                  const selected = new Set<Key>(
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  );
                  setProviderFilter(
                    selected.size === providerOptions.length
                      ? "all"
                      : selected
                  );
                }}
              >
                {providerOptions.map((p) => (
                  <option key={p.uid} value={p.uid}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative hidden sm:block">
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-1 rounded-lg border border-default-200 bg-default-100 px-3 py-2 text-sm">
                  Columns
                  <ChevronDown className="size-4" />
                </summary>
                <div className="absolute right-0 z-10 mt-1 min-w-[160px] rounded-lg border border-default-200 bg-background p-2 shadow-lg">
                  {columns.map((col) => (
                    <label
                      key={col.uid}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-default-100"
                    >
                      <input
                        type="checkbox"
                        checked={
                          visibleColumns === "all" || visibleColumns.has(col.uid)
                        }
                        onChange={(e) => {
                          const current =
                            visibleColumns === "all"
                              ? new Set<Key>(columns.map((c) => c.uid))
                              : new Set(visibleColumns);
                          if (e.target.checked) {
                            current.add(col.uid);
                          } else {
                            current.delete(col.uid);
                          }
                          setVisibleColumns(current);
                        }}
                        className="rounded"
                      />
                      {col.name}
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            {filteredItems.length} of {comparison?.results.length ?? 0} models
          </span>
          <label className="flex items-center gap-1 text-small text-default-400">
            Rows per page:
            <select
              className="rounded bg-transparent text-small text-default-400 outline-none"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      filterValue,
      visibleColumns,
      onSearchChange,
      onClear,
      filteredItems.length,
      comparison,
      onRowsPerPageChange,
      rowsPerPage,
      providerFilter,
    ]
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="ghost"
            onPress={() => page > 1 && setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="ghost"
            onPress={() => page < pages && setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    ),
    [selectedKeys, filteredItems.length, page, pages]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <ToolHeader
        title="API Cost Calculator"
        description="Compare costs across AI providers"
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        }
      />

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
                <label
                  htmlFor="input-tokens"
                  className="text-sm font-medium text-muted-foreground"
                >
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
                <label
                  htmlFor="output-tokens"
                  className="text-sm font-medium text-muted-foreground"
                >
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
                    <label
                      htmlFor="daily-requests"
                      className="text-sm font-medium text-muted-foreground"
                    >
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
                    <label
                      htmlFor="model-select"
                      className="text-sm font-medium text-muted-foreground"
                    >
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
                  {dailyRequests} req/day x 30 days
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
                  <span>
                    Cheapest: {comparison.results[0]?.model.displayName}
                  </span>
                </div>
              )}
            </Card.Header>
            <Card.Content className="p-0">
              {comparison ? (
                <Table
                  isHeaderSticky
                  aria-label="AI model cost comparison"
                  bottomContent={bottomContent}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[400px]",
                  }}
                  selectedKeys={selectedKeys}
                  selectionMode="multiple"
                  sortDescriptor={sortDescriptor}
                  topContent={topContent}
                  topContentPlacement="outside"
                  onSelectionChange={setSelectedKeys}
                  onSortChange={setSortDescriptor}
                >
                  <TableHeader columns={headerColumns}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody
                    emptyContent="No models match your search"
                    items={sortedItems}
                  >
                    {(item) => (
                      <TableRow key={item.model.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
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
