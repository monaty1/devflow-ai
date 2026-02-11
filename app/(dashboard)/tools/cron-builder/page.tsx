"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
  Clock,
  AlertCircle,
  Calendar,
  Zap,
  RotateCcw,
  Save,
  History,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useCronBuilder } from "@/hooks/use-cron-builder";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import type { CronField } from "@/types/cron-builder";
import { CRON_FIELD_LABELS, CRON_FIELD_RANGES } from "@/types/cron-builder";

const FIELD_ORDER: CronField[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

export default function CronBuilderPage() {
  const {
    expression,
    rawExpression,
    explanation,
    nextExecutions,
    validation,
    history,
    presets,
    setField,
    setRawExpression,
    loadPreset,
    saveToHistory,
    loadFromHistory,
    clearHistory,
    reset,
  } = useCronBuilder();

  const [showHistory, setShowHistory] = useState(false);

  const handleSave = () => {
    saveToHistory();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        icon={Clock}
        gradient="from-violet-500 to-purple-600"
        title="Cron Builder"
        description="Construye expresiones cron visualmente, sin memorizar sintaxis"
      />

      {/* Presets */}
      <Card className="p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Zap className="size-4" />
          Presets comunes
        </h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset.id)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder Panel */}
        <div className="space-y-4">
          {/* Visual Builder */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Constructor Visual</h2>

            <div className="space-y-4">
              {FIELD_ORDER.map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-muted-foreground">
                    {CRON_FIELD_LABELS[field]}
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={expression[field]}
                      onChange={(e) => setField(field, e.target.value)}
                      placeholder="*"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <span className="w-20 text-xs text-muted-foreground">
                    {CRON_FIELD_RANGES[field].min}-{CRON_FIELD_RANGES[field].max}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick reference */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Sintaxis:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span><code className="rounded bg-muted px-1">*</code> cada valor</span>
                <span><code className="rounded bg-muted px-1">*/n</code> cada n</span>
                <span><code className="rounded bg-muted px-1">n-m</code> rango</span>
                <span><code className="rounded bg-muted px-1">a,b,c</code> lista</span>
              </div>
            </div>
          </Card>

          {/* Raw Expression */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Expresión Cron</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onPress={handleSave}>
                  <Save className="mr-1 size-4" />
                  Guardar
                </Button>
                <CopyButton text={rawExpression} label="Copiar" />
              </div>
            </div>

            <input
              type="text"
              value={rawExpression}
              onChange={(e) => setRawExpression(e.target.value)}
              className={`w-full rounded-lg border bg-background px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                validation.isValid
                  ? "border-border focus:border-primary"
                  : "border-red-500 focus:border-red-500"
              }`}
            />

            {!validation.isValid && (
              <div className="mt-2 space-y-1">
                {validation.errors.map((error, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="size-4" />
                    {error.message}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onPress={reset}>
                <RotateCcw className="mr-1 size-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowHistory(!showHistory)}
              >
                <History className="mr-1 size-4" />
                Historial ({history.length})
              </Button>
            </div>
          </Card>

          {/* History */}
          {showHistory && history.length > 0 && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Historial</h4>
                <Button variant="ghost" size="sm" onPress={clearHistory}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-2 text-left transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <code className="text-sm font-medium">{item.expression}</code>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Explanation */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Explicación</h2>

            {explanation ? (
              <div className="space-y-4">
                {/* Human readable summary */}
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-lg font-medium text-primary">
                    {explanation.humanReadable}
                  </p>
                </div>

                {/* Field details */}
                <div className="space-y-2">
                  {explanation.details.map((detail) => (
                    <div
                      key={detail.field}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {detail.value}
                        </span>
                        <span className="text-sm font-medium">
                          {CRON_FIELD_LABELS[detail.field]}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {detail.explanation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  {validation.isValid
                    ? "Introduce una expresión cron"
                    : "Corrige los errores para ver la explicación"}
                </p>
              </div>
            )}
          </Card>

          {/* Next Executions */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calendar className="size-5" />
              Próximas ejecuciones
            </h2>

            {nextExecutions.length > 0 ? (
              <div className="space-y-2">
                {nextExecutions.map((execution, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {execution.formatted}
                      </span>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {execution.relative}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  {validation.isValid
                    ? "No hay ejecuciones próximas"
                    : "Corrige los errores para ver las ejecuciones"}
                </p>
              </div>
            )}
          </Card>

          {/* Cheat Sheet */}
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold">Referencia Rápida</h3>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded bg-muted p-2">
                <p className="font-mono font-bold">MIN</p>
                <p className="text-muted-foreground">0-59</p>
              </div>
              <div className="rounded bg-muted p-2">
                <p className="font-mono font-bold">HORA</p>
                <p className="text-muted-foreground">0-23</p>
              </div>
              <div className="rounded bg-muted p-2">
                <p className="font-mono font-bold">DÍA</p>
                <p className="text-muted-foreground">1-31</p>
              </div>
              <div className="rounded bg-muted p-2">
                <p className="font-mono font-bold">MES</p>
                <p className="text-muted-foreground">1-12</p>
              </div>
              <div className="rounded bg-muted p-2">
                <p className="font-mono font-bold">SEM</p>
                <p className="text-muted-foreground">0-6</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              0 = Domingo, 1 = Lunes, ..., 6 = Sábado
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
