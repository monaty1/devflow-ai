"use client";

import NextLink from "next/link";
import { Card, Button } from "@heroui/react";
import {
  Heart,
  FileSearch,
  Code2,
  Calculator,
  Eye,
  FolderKanban,
  Regex,
  FileJson,
  Clock,
  Palette,
  Wand2,
  Braces,
  Binary,
  Fingerprint,
  GitCommitHorizontal,
  Globe,
} from "lucide-react";
import { useFavorites } from "@/lib/context";
import type { Tool } from "@/types/tools";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSearch,
  Code2,
  Calculator,
  Eye,
  FolderKanban,
  Regex,
  FileJson,
  Clock,
  Palette,
  Wand2,
  Braces,
  Binary,
  Fingerprint,
  GitCommitHorizontal,
  Globe,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.id);
  const IconComponent = ICON_MAP[tool.icon];

  return (
    <Card className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Color Banner */}
      <div className={cn("h-2 bg-gradient-to-r", tool.color)} />

      <div className="p-5">
        {/* Header: Icon + Like Button */}
        <div className="mb-3 flex items-start justify-between">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-lg bg-gradient-to-r text-white",
              tool.color
            )}
          >
            {IconComponent ? (
              <IconComponent className="size-6" />
            ) : (
              <span className="text-2xl">{tool.icon}</span>
            )}
          </div>

          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => toggleFavorite(tool.id)}
            className="relative z-10 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>

        {/* Title & Description */}
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          {tool.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {tool.description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer: Category */}
        <div className="flex items-center">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
            {tool.category}
          </span>
        </div>
      </div>

      {/* Full card is clickable */}
      <NextLink
        href={`/tools/${tool.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${tool.name}`}
      />
    </Card>
  );
}
