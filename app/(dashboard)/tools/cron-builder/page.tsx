"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Input,
  Tabs,
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
  Bot,
} from "lucide-react";
import { useCronBuilder } from "@/hooks/use-cron-builder";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { parseExpression } from "@/lib/application/cron-builder";
import type { ConfigFormat, NextExecution } from "@/types/cron-builder";

function MiniCalendar({ executions }: { executions: NextExecution[] }) {
  const { t } = useTranslation();
  const activeDays = useMemo(() => {
    const days = new Set<number>();
    for (const e of executions) {
      days.add(e.date.getDate());
    }
    return days;
  }, [executions]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayLabels = [t("cron.daySu"), t("cron.dayMo"), t("cron.dayTu"), t("cron.dayWe"), t("cron.dayTh"), t("cron.dayFr"), t("cron.daySa")];

  return (
    <div className="grid grid-cols-7 gap-1">
      {dayLabels.map(d => (
        <div key={d} className="text-[9px] font-bold text-center text-muted-foreground uppercase">{d}</div>
      ))}
      {Array.from({ length: firstDayOfWeek }, (_, i) => (
        <div key={`e-${i}`} />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isActive = activeDays.has(day);
        const isToday = day === now.getDate();
        return (
          <div
            key={day}
            className={cn(
              "text-center text-[10px] font-bold py-1 rounded-md transition-colors",
              isActive ? "bg-orange-500 text-white" : "text-muted-foreground",
              isToday && "ring-1 ring-primary"
            )}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export default function CronBuilderPage() {
  const { t } = useTranslation();
  const {
    expression,
    explanation,
    nextExecutions,
    validation,
    config,
    configFormat,
    setField,
    setExpression,
    setConfigFormat,
    reset,
  } = useCronBuilder();

  const { generateCronWithAI, aiResult: aiCronResult, isAILoading: isAICronLoading, aiError } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const { addToast } = useToast();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");

  const [activeTab, setActiveTab] = useState<"builder" | "infra" | string>("builder");

  const applyCronFromAI = useCallback((cronString: string) => {
    try {
      const parsed = parseExpression(cronString.trim());
      setExpression(parsed);
      addToast(t("cron.aiApplied"), "success");
    } catch {
      addToast(t("cron.aiParseError"), "error");
    }
  }, [setExpression, addToast, t]);

  const executionColumns: ColumnConfig[] = [
    { name: t("table.colLocalTime"), uid: "formatted", sortable: true },
    { name: t("table.colUtcTime"), uid: "utc" },
    { name: t("table.colRelative"), uid: "relative", sortable: true },
  ];

  const renderExecutionCell = useCallback((exec: NextExecution, columnKey: React.Key) => {
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
        return String(exec[key as keyof typeof exec] ?? "");
    }
  }, []);

  const INFRA_FORMATS: { id: ConfigFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "kubernetes", label: "Kubernetes CronJob", icon: Cloud },
    { id: "github-actions", label: "GitHub Actions", icon: Github },
    { id: "aws-eventbridge", label: "AWS EventBridge", icon: Box },
    { id: "linux-crontab", label: "Linux Crontab", icon: Terminal },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
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

      <ToolSuggestions toolId="cron-builder" input={Object.values(expression).join(" ")} output={explanation?.summary || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Builder Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <Tabs
              selectedKey={activeTab as string}
              onSelectionChange={(k) => setActiveTab(k as string)}
              variant="primary"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label={t("cron.ariaBuilderMode")}>
                  <Tabs.Tab id="builder">{t("cron.expressionBuilder")}</Tabs.Tab>
                  <Tabs.Tab id="infra">{t("cron.infrastructureTab")}</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="builder">
                <div className="space-y-6 mt-6">
                  {/* AI Cron Generator */}
                  {isAIEnabled && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Bot className="size-4 text-violet-500" aria-hidden="true" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("cron.aiSection")}</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          variant="primary"
                          value={naturalLanguageInput}
                          onChange={(e) => setNaturalLanguageInput(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                              e.preventDefault();
                              if (naturalLanguageInput.trim()) {
                                generateCronWithAI(naturalLanguageInput).catch(() => {
                                  addToast(t("ai.unavailableLocal"), "info");
                                });
                              }
                            }
                          }}
                          placeholder={t("cron.aiPlaceholder")}
                          className="flex-1 font-medium"
                          aria-label={t("cron.aiPlaceholder")}
                        />
                        <Button
                          variant="primary"
                          isLoading={isAICronLoading}
                          isDisabled={!naturalLanguageInput.trim()}
                          onPress={() => {
                            generateCronWithAI(naturalLanguageInput).catch(() => {
                              addToast(t("ai.unavailableLocal"), "info");
                            });
                          }}
                          className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 gap-2 shrink-0"
                        >
                          <Bot className="size-4" />
                          {t("cron.aiGenerateBtn")}
                        </Button>
                      </div>

                      {/* AI Results */}
                      {(isAICronLoading || aiCronResult) && (
                        <div className="space-y-2">
                          {isAICronLoading && (
                            <span className="text-xs text-muted-foreground animate-pulse">{t("ai.generating")}</span>
                          )}
                          {aiCronResult && aiCronResult.suggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <code className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">{s.value}</code>
                                <div className="flex gap-2">
                                  <CopyButton text={s.value} size="sm" variant="ghost" />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => applyCronFromAI(s.value)}
                                    className="text-violet-600 dark:text-violet-400 font-bold"
                                  >
                                    {t("cron.aiApplyBtn")}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isAIEnabled && aiError && (
                    <Card className="p-3 border-danger/30 bg-danger/5" role="alert">
                      <p className="text-xs text-danger font-bold flex items-center gap-2">
                        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                        {t("ai.errorOccurred", { message: aiError.message })}
                      </p>
                    </Card>
                  )}

                  <div className="bg-muted/50 p-6 rounded-2xl border border-divider text-center shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <p className="text-4xl font-black tracking-widest text-primary font-mono select-all">
                      {Object.values(expression).join(" ")}
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-[10px] uppercase font-black text-muted-foreground tracking-tighter">
                      <span>{t("cron.fieldMin")}</span><span>{t("cron.fieldHr")}</span><span>{t("cron.fieldDy")}</span><span>{t("cron.fieldMo")}</span><span>{t("cron.fieldWk")}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <CopyButton text={Object.values(expression).join(" ")} variant="ghost" size="sm" />
                    </div>
                  </div>

                  {!validation.isValid && validation.errors.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm">
                      <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" aria-hidden="true" />
                      <ul className="space-y-1">
                        {validation.errors.map((err, i) => (
                          <li key={i} className="text-danger font-medium text-xs">
                            <span className="font-bold">{err.field}:</span> {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    {[
                      { field: "minute", label: t("cron.minuteLabel"), range: "0-59" },
                      { field: "hour", label: t("cron.hourLabel"), range: "0-23" },
                      { field: "dayOfMonth", label: t("cron.dayLabel"), range: "1-31" },
                      { field: "month", label: t("cron.monthLabel"), range: "1-12" },
                      { field: "dayOfWeek", label: t("cron.weekdayLabel"), range: "0-6" },
                    ].map((f) => (
                      <div key={f.field} className="flex items-center gap-4">
                        <label className="w-16 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">{f.label}</label>
                        <Input
                          variant="primary"
                          value={expression[f.field as keyof typeof expression]}
                          onChange={(e) => setField(f.field as keyof typeof expression, e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                              e.preventDefault();
                              setExpression({ ...expression });
                            }
                          }}
                          className="flex-1 font-mono font-bold"
                          placeholder="*"
                          aria-label={f.label}
                        />
                        <span className="text-[10px] opacity-30 font-mono w-10" title={`Valid range: ${f.range}`}>{f.range}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-divider">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">{t("cron.commonPresets")}</p>
                    <div className="grid grid-cols-3 gap-2" role="group" aria-label={t("cron.commonPresets")}>
                      {[
                        { name: t("cron.every1m"), exp: { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                        { name: t("cron.hourlyPreset"), exp: { minute: "0", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                        { name: t("cron.dailyPreset"), exp: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
                        { name: t("cron.weeklyPreset"), exp: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "1" } },
                        { name: t("cron.monthlyPreset"), exp: { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" } },
                        { name: t("cron.weekdaysPreset"), exp: { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" } },
                      ].map((p) => (
                        <Button
                          key={p.name}
                          size="sm"
                          variant="ghost"
                          onPress={() => setExpression(p.exp)}
                          className="font-bold text-[10px] h-8"
                        >
                          {p.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="infra">
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label={t("cron.infraFormat")}>
                    {INFRA_FORMATS.map((f) => (
                      <Button
                        key={f.id}
                        variant={configFormat === f.id ? "primary" : "ghost"}
                        aria-pressed={configFormat === f.id}
                        onPress={() => setConfigFormat(f.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 h-auto rounded-xl gap-2",
                          configFormat === f.id
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <f.icon className="size-5" />
                        <span className="text-[10px] font-bold uppercase text-center">{f.label.split(" ")[0]}</span>
                      </Button>
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
              </Tabs.Panel>
            </Tabs>
          </Card>
        </div>

        {/* Intelligence Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Natural Explanation */}
          {explanation && (
            <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 shadow-lg">
              <h3 className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2 tracking-widest">
                <Sparkles className="size-4" aria-hidden="true" /> {t("cron.humanReadable")}
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

          {/* Mini Calendar */}
          {nextExecutions.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4">
                <Calendar className="size-4" />
                {t("cron.executionCalendar")}
              </h3>
              <MiniCalendar executions={nextExecutions} />
            </Card>
          )}

          {/* Execution Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Play className="size-4" />
                {t("cron.scheduleForecast")}
              </h3>
              <div className="flex items-center gap-2">
                <Globe className="size-3 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-mono text-muted-foreground">{t("cron.utcVsLocal")}</span>
              </div>
            </div>
            
            {!explanation ? (
              <div className="p-12 text-center border-2 border-dashed border-divider rounded-xl">
                <AlertTriangle className="size-8 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{t("cron.invalidExpression")}</p>
              </div>
            ) : (
              <DataTable
                columns={executionColumns}
                data={nextExecutions.map((e) => ({ ...e, id: e.formatted }))}
                filterField="formatted"
                renderCell={renderExecutionCell}
                initialVisibleColumns={["formatted", "utc", "relative"]}
                emptyContent={t("cron.noUpcomingExecutions")}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
