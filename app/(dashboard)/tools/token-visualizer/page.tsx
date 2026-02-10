"use client";

import { Card, Button } from "@heroui/react";
import { RotateCcw, Copy } from "lucide-react";
import { useTokenVisualizer } from "@/hooks/use-token-visualizer";
import { useToast } from "@/hooks/use-toast";
import { formatCost } from "@/lib/application/cost-calculator";

export default function TokenVisualizerPage() {
  const { input, setInput, visualization, reset } = useTokenVisualizer();
  const { addToast } = useToast();

  const handleCopy = () => {
    if (!visualization) return;
    navigator.clipboard.writeText(
      `Tokens: ${visualization.totalTokens}\nInput: ${visualization.input}\nGPT-4 Cost: ${formatCost(visualization.estimatedCost.gpt4)}\nClaude Cost: ${formatCost(visualization.estimatedCost.claude)}`
    );
    addToast("Copied to clipboard!", "success");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Token Visualizer
          </h1>
          <p className="mt-1 text-muted-foreground">
            See how AI models tokenize your text in real-time
          </p>
        </div>
        <div className="flex gap-2">
          {visualization && (
            <Button variant="outline" size="sm" onPress={handleCopy} className="gap-2">
              <Copy className="size-4" />
              Copy
            </Button>
          )}
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Input */}
      <Card className="p-6">
        <Card.Header className="mb-4 p-0">
          <Card.Title>Input Text</Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text here to see how it gets tokenized..."
            className="h-40 w-full resize-none rounded-lg border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Card.Content>
      </Card>

      {/* Stats Bar */}
      {visualization && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold text-blue-600">
                {visualization.totalTokens}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="text-2xl font-bold text-purple-600">
                {visualization.input.length}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">GPT-4o Cost</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCost(visualization.estimatedCost.gpt4)}
              </p>
            </Card.Content>
          </Card>
          <Card className="p-4">
            <Card.Content className="p-0 text-center">
              <p className="text-xs text-muted-foreground">Claude Cost</p>
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
            <Card.Title>Token Breakdown</Card.Title>
            <Card.Description>
              Each colored block = 1 token (approximate)
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
                Tokens are approximate. Real tokenization varies by model (BPE
                algorithm). Common words = 1 token. Rare/long words may split
                into multiple tokens.
              </p>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {!visualization && (
        <Card className="p-16">
          <Card.Content className="p-0 text-center">
            <p className="mb-4 text-5xl">✨</p>
            <p className="text-muted-foreground">
              Start typing to see tokenization in real-time
            </p>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
