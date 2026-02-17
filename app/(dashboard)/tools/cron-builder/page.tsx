"use client";

import { useState } from "react";
import {
  Input,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import {
  Clock,
  Calendar,
  RotateCcw,
  Sparkles,
  Play,
  Terminal,
  Cloud,
  Github,
  Box,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { useCronBuilder } from "@/hooks/use-cron-builder";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ConfigFormat, NextExecution } from "@/types/cron-builder";

export default function CronBuilderPage() {
  const { t } = useTranslation();
  const {
    expression,
    explanation,
    nextExecutions,
    config,
    setField,
    setExpression,
    reset,
  } = useCronBuilder();

  const [activeTab, setActiveTab] = useState<"builder" | "infra" | string>("builder");
  const [configFormat, setConfigFormat] = useState<ConfigFormat>("kubernetes");

  const executionColumns: ColumnConfig[] = [
    { name: "LOCAL TIME", uid: "formatted", sortable: true },
    { name: "UTC TIME", uid: "utc" },
    { name: "RELATIVE", uid: "relative", sortable: true },
  ];

  const renderExecutionCell = (exec: NextExecution, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "formatted":
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-3 text-primary" />
            <span className="font-mono text-sm font-bold">{exec.formatted}</span>
          </div>
        );
      case "utc":
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {exec.date.toISOString().replace("T", " ").slice(0, 16)} UTC
          </span>
        );
      case "relative":
        return (
          <Chip size="sm" variant="primary" color="default" className="font-black text-[10px] uppercase">
            {exec.relative}
          </Chip>
        );
      default:
        return (exec as any)[key];
    }
  };

  const INFRA_FORMATS: { id: ConfigFormat; label: string; icon: any }[] = [
    { id: "kubernetes", label: "Kubernetes CronJob", icon: Cloud },
    { id: "github-actions", label: "GitHub Actions", icon: Github },
    { id: "aws-eventbridge", label: "AWS EventBridge", icon: Box },
    { id: "linux-crontab", label: "Linux Crontab", icon: Terminal },
  ];

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
        {/* Builder Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <Tabs 
              selectedKey={activeTab as string} 
              onSelectionChange={(k) => setActiveTab(k as string)}
              variant="primary"
            >
              <Tab key="builder">Expression Builder</Tab>
              <Tab key="infra">Infrastructure</Tab>
            </Tabs>

            {activeTab === "builder" && (
              <div className="space-y-6 mt-6">
                <div className="bg-muted/50 p-6 rounded-2xl border border-divider text-center shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <p className="text-4xl font-black tracking-widest text-primary font-mono select-all">
                    {Object.values(expression).join(" ")}
                  </p>
                  <div className="flex justify-center gap-4 mt-2 text-[10px] uppercase font-black text-muted-foreground tracking-tighter">
                    <span>min</span><span>hour</span><span>day</span><span>month</span><span>week</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CopyButton text={Object.values(expression).join(" ")} variant="ghost" size="sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { field: "minute", label: "Minute", range: "0-59" },
                    { field: "hour", label: "Hour", range: "0-23" },
                    { field: "dayOfMonth", label: "Day", range: "1-31" },
                    { field: "month", label: "Month", range: "1-12" },
                    { field: "dayOfWeek", label: "Weekday", range: "0-6" },
                  ].map((f) => (
                    <div key={f.field} className="flex items-center gap-4">
                      <label className="w-16 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">{f.label}</label>
                      <Input
                        variant="primary"
                        value={(expression as any)[f.field]}
                        onChange={(e) => setField(f.field as any, e.target.value)}
                        className="flex-1 font-mono font-bold"
                        placeholder="*"
                      />
                      <span className="text-[10px] opacity-30 font-mono w-10">{f.range}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-divider">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Common Presets</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Every 1m", exp: { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                      { name: "Hourly", exp: { minute: "0", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                      { name: "Daily", exp: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                      { name: "Weekly", exp: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "1" } },
                      { name: "Monthly", exp: { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" } },
                      { name: "Weekdays", exp: { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" } },
                    ].map((p) => (
                      <Button
                        key={p.name}
                        size="sm"
                        variant="ghost"
                        onPress={() => setExpression(p.exp as any)}
                        className="font-bold text-[10px] h-8"
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "infra" && (
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-2">
                  {INFRA_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setConfigFormat(f.id);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                        configFormat === f.id 
                          ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      )}
                    >
                      <f.icon className="size-5" />
                      <span className="text-[10px] font-bold uppercase text-center">{f.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                {config && (
                  <Card className="p-0 overflow-hidden shadow-sm">
                    <div className="p-3 bg-muted/30 border-b border-divider flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">{config.label}</span>
                      <CopyButton text={config.code} size="sm" />
                    </div>
                    <pre className="p-4 font-mono text-xs leading-relaxed overflow-auto max-h-[300px] bg-background">
                      <code>{config.code}</code>
                    </pre>
                  </Card>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Intelligence Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Natural Explanation */}
          {explanation && (
            <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 shadow-lg">
              <h3 className="text-xs font-black uppercase text-orange-600 mb-4 flex items-center gap-2 tracking-widest">
                <Sparkles className="size-4" /> Human Readable
              </h3>
              <p className="text-2xl font-black leading-tight text-foreground">
                “{explanation.summary}”
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {explanation.details.map((d, i) => (
                  <Chip key={i} size="sm" variant="primary" className="font-bold border border-warning/20 text-warning">
                    {d.field}: {d.value}
                  </Chip>
                ))}
              </div>
            </Card>
          )}

          {/* Execution Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2 text-emerald-600">
                <Play className="size-4" />
                Schedule Forecast
              </h3>
              <div className="flex items-center gap-2">
                <Globe className="size-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">UTC vs Local</span>
              </div>
            </div>
            
            {explanation?.humanReadable.includes("inválida") ? (
              <div className="p-12 text-center border-2 border-dashed border-divider rounded-xl">
                <AlertTriangle className="size-8 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Invalid cron expression</p>
              </div>
            ) : (
              <DataTable
                columns={executionColumns}
                data={nextExecutions.map((e, id) => ({ ...e, id }))}
                filterField="formatted"
                renderCell={renderExecutionCell}
                initialVisibleColumns={["formatted", "utc", "relative"]}
                emptyContent="No upcoming executions found."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
