"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { useToolRecommendations } from "@/hooks/use-tool-recommendations";
import { useTranslation } from "@/hooks/use-translation";

interface ToolSuggestionsProps {
  toolId: string;
  input: string;
  output: string;
}

export function ToolSuggestions({ toolId, input, output }: ToolSuggestionsProps) {
  const recommendations = useToolRecommendations(toolId, input, output);
  const router = useRouter();
  const { t } = useTranslation();

  if (recommendations.length === 0) return null;

  const handleNavigate = (slug: string, data?: string) => {
    if (data) {
      localStorage.setItem(
        "devflow-shared-data",
        JSON.stringify({
          data,
          sourceToolId: toolId,
          targetToolId: slug,
          timestamp: Date.now(),
        })
      );
    }
    router.push(`/tools/${slug}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3" aria-hidden="true" />
        {t("tools.suggestions") ?? "Next steps"}
      </span>
      {recommendations.map((rec) => (
        <Button
          key={rec.toolSlug}
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onPress={() => handleNavigate(rec.toolSlug, rec.dataToPass)}
        >
          {rec.toolName}
          <ArrowRight className="size-3" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
