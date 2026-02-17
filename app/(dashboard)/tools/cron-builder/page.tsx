"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  Clock,
  Calendar,
  RotateCcw,
  Sparkles,
  Info,
  Play,
  Copy,
  ChevronRight,
  Terminal,
  Zap,
  Cloud,
  Github,
  Code2,
  Box,
} from "lucide-react";
import { useCronBuilder } from "@/hooks/use-cron-builder";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { ConfigFormat, NextExecution } from "@/types/cron-builder";

export default function CronBuilderPage() {
  const { t } = useTranslation();
  const {
    expression,
    cron,
    explanation,
    nextExecutions,
    config,
    history,
    setField,
    setExpression,
    loadPreset,
    loadConfig,
    reset,
  } = useCronBuilder();

  const [activeTab, setActiveTab] = useState<"builder" | "history">("builder");
  const [configFormat, setConfigFormat] = useState<ConfigFormat>("kubernetes");

  const executionColumns: ColumnConfig[] = [
    { name: "DATE", uid: "formatted", sortable: true },
    { name: "RELATIVE", uid: "relative", sortable: true },
  ];

  const renderExecutionCell = (exec: NextExecution, columnKey: React.Key) => {
    switch (columnKey) {
      case "formatted":
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-3 text-primary" />
            <span className="font-mono text-sm font-bold">{exec.formatted}</span>
          </div>
        );
      case "relative":
        return (
          <Chip size="sm" variant="flat" color="secondary" className="font-black text-[10px] uppercase">
            {exec.relative}
          </Chip>
        );
      default:
        return (exec as any)[columnKey];
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Clock}
        gradient="from-orange-500 to-amber-600"
        title={t("cron.title")}
        description={t("cron.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Visual Builder Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="size-5 text-primary" />
                Expression Builder
              </h3>
              <CopyButton text={expression} />
            </div>

            <div className="bg-muted/50 p-6 rounded-2xl border border-divider mb-8 text-center shadow-inner">
              <p className="text-3xl font-black tracking-widest text-primary font-mono">
                {expression}
              </p>
              <p className="text-[10px] uppercase font-black text-muted-foreground mt-2 tracking-tighter">
                min · hour · day · month · week
              </p>
            </div>

            <div className="space-y-6">
              {[
                { field: "minute", label: "Minute", range: "0-59" },
                { field: "hour", label: "Hour", range: "0-23" },
                { field: "dayOfMonth", label: "Day", range: "1-31" },
                { field: "month", label: "Month", range: "1-12" },
                { field: "dayOfWeek", label: "Weekday", range: "0-6" },
              ].map((f) => (
                <div key={f.field} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{f.label}</label>
                    <span className="text-[10px] opacity-50 font-mono">{f.range}</span>
                  </div>
                  <Input
                    size="sm"
                    variant="bordered"
                    value={(cron as any)[f.field]}
                    onValueChange={(val) => setField(f.field as any, val)}
                    classNames={{ input: "font-mono font-bold" }}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Presets */}
          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="size-4 text-warning" />
              Standard Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Every Minute", exp: "* * * * *" },
                { name: "Every 5m", exp: "*/5 * * * *" },
                { name: "Hourly", exp: "0 * * * *" },
                { name: "Daily 00:00", exp: "0 0 * * *" },
                { name: "Weekly (Mon)", exp: "0 0 * * 1" },
                { name: "Monthly (1st)", exp: "0 0 1 * *" },
              ].map((p) => (
                <Button
                  key={p.name}
                  size="sm"
                  variant="flat"
                  onPress={() => setExpression(p.exp)}
                  className="font-bold text-[10px] h-8"
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Intelligence Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Natural Explanation */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-xs font-black uppercase text-primary mb-3 tracking-widest">
              Human-Readable Explanation
            </h3>
            <p className="text-xl font-bold leading-relaxed">
              “{explanation.summary}”
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {explanation.details.map((d, i) => (
                <Tooltip key={i} content={d.explanation}>
                  <Chip size="sm" variant="dot" color="primary" className="cursor-default font-medium">
                    {d.field}: {d.value}
                  </Chip>
                </Tooltip>
              ))}
            </div>
          </Card>

          {/* Infrastructure Snippets */}
          <Card className="p-0 overflow-hidden shadow-xl border-indigo-500/20">
            <div className="p-4 border-b border-divider flex items-center justify-between bg-muted/20">
              <h3 className="font-bold flex items-center gap-2 text-indigo-600">
                <Box className="size-4" />
                Infrastructure Deployment
              </h3>
              <div className="flex bg-muted p-1 rounded-xl">
                {[
                  { id: "kubernetes", icon: Cloud },
                  { id: "github-actions", icon: Github },
                  { id: "linux-crontab", icon: Terminal },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <Button
                      key={f.id}
                      isIconOnly
                      size="sm"
                      variant={configFormat === f.id ? "solid" : "light"}
                      color={configFormat === f.id ? "primary" : "default"}
                      onPress={() => {
                        setConfigFormat(f.id as ConfigFormat);
                        loadConfig(f.id as ConfigFormat);
                      }}
                      className="rounded-lg h-8 w-8"
                    >
                      <Icon className="size-3.5" />
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="p-0 flex flex-col">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                  {configFormat === "kubernetes" ? "k8s-cronjob.yaml" : configFormat === "github-actions" ? "workflow.yaml" : "crontab"}
                </span>
                <CopyButton text={config.code} />
              </div>
              <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto max-h-[300px] bg-background">
                <code>{config.code}</code>
              </pre>
            </div>
          </Card>

          {/* Execution Timeline */}
          <Card className="p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Play className="size-4 text-emerald-500" />
              Upcoming Executions (Next 10)
            </h3>
            <DataTable
              columns={executionColumns}
              data={nextExecutions.map((e, id) => ({ ...e, id }))}
              filterField="formatted"
              renderCell={renderExecutionCell}
              initialVisibleColumns={["formatted", "relative"]}
              emptyContent="No upcoming executions found within the next year."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
