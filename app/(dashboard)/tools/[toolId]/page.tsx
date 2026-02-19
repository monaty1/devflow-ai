"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import { Card, Button } from "@heroui/react";
import {
  Heart,
  ArrowLeft,
  Star,
  Users,
  Check,
} from "lucide-react";
import { useFavorites } from "@/lib/context";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/hooks/use-translation";
import { getToolBySlug } from "@/config/tools-data";
import { TOOL_ICON_MAP } from "@/config/tool-icon-map";
import { cn } from "@/lib/utils";

interface ToolDetailPageProps {
  params: Promise<{ toolId: string }>;
}

export default function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { toolId } = use(params);
  const tool = getToolBySlug(toolId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useTranslation();

  if (!tool) {
    return notFound();
  }

  const favorited = isFavorite(tool.id);
  const IconComponent = TOOL_ICON_MAP[tool.icon];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Button */}
      <NextLink
        href="/tools"
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("common.backToTools")}
      </NextLink>

      {/* Header Card */}
      <div className={cn("h-2 rounded-t-xl bg-gradient-to-r", tool.color)} />
      <Card className="-mt-6 rounded-t-none">
        <div className="p-6">
          {/* Title Row */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-xl bg-gradient-to-r text-white",
                  tool.color
                )}
              >
                {IconComponent ? (
                  <IconComponent className="size-8" />
                ) : (
                  <span className="text-3xl">{tool.icon}</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t(`tool.${tool.slug}.name`)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    {tool.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {t("tools.users", { count: tool.usersCount.toLocaleString() })}
                  </span>
                  {tool.isFree && (
                    <StatusBadge variant="success">{t("tools.free")}</StatusBadge>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Button */}
            <Button
              isIconOnly
              variant="outline"
              onPress={() => toggleFavorite(tool.id)}
              aria-label={
                favorited ? t("favorites.remove") : t("favorites.add")
              }
            >
              <Heart
                className={cn(
                  "size-5",
                  favorited
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          </div>

          {/* Description */}
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {t(`tool.${tool.slug}.longDescription`)}
          </p>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Features List */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {t("common.features")}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {tool.features.map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3"
                >
                  <Check className="size-5 shrink-0 text-green-500" />
                  <span className="text-sm text-foreground">{t(`tool.${tool.slug}.feature.${String(idx)}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button size="lg" className="w-full">
            {t("common.launch", { name: t(`tool.${tool.slug}.name`) })}
          </Button>
        </div>
      </Card>
    </div>
  );
}
