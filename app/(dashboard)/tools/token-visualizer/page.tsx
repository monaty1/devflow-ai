"use client";

import { Card, Button } from "@heroui/react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useTokenVisualizer } from "@/hooks/use-token-visualizer";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { formatCost } from "@/lib/application/cost-calculator";

export default function TokenVisualizerPage() {
  const { t } = useTranslation();
  const { input, setInput, visualization, reset } = useTokenVisualizer();

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
                  `Tokens: ${visualization.totalTokens}\nInput: ${visualization.input}\nGPT-4 Cost: ${formatCost(visualization.estimatedCost.gpt4)}\nClaude Cost: ${formatCost(visualization.estimatedCost.claude)}`
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

      {/* Stats Bar */}
      {visualization && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">{t("tokenViz.totalTokens")}</p>
              <p className="text-2xl font-bold text-blue-600">
                {visualization.totalTokens}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">{t("tokenViz.characters")}</p>
              <p className="text-2xl font-bold text-purple-600">
                {visualization.input.length}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">{t("tokenViz.gpt4Cost")}</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCost(visualization.estimatedCost.gpt4)}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">{t("tokenViz.claudeCost")}</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCost(visualization.estimatedCost.claude)}
              </p>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Token Visualization */}
      {visualization && (
        <Card className="p-6">
          <Card.Header className="mb-4 p-0">
            <Card.Title>{t("tokenViz.tokenBreakdown")}</Card.Title>
            <Card.Description>
              {t("tokenViz.tokenDescription")}
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="flex flex-wrap gap-1.5">
              {visualization.segments.map((segment, i) => (
                <span
                  key={i}
                  className={`inline-flex cursor-default items-center rounded border px-2 py-1 font-mono text-xs transition-all duration-200 hover:scale-105 ${segment.color}`}
                  title={`Token #${segment.tokenId}`}
                >
                  {segment.text}
                  <span className="ml-1.5 text-[10px] opacity-50">
                    #{segment.tokenId}
                  </span>
                </span>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                {t("tokenViz.legend")}
              </p>
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
