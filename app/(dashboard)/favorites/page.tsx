"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/context";
import { TOOLS_DATA } from "@/config/tools-data";
import { ToolCard } from "@/components/tools";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  const favoritedTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) =>
      favorites.some((fav) => fav.toolId === tool.id)
    );
  }, [favorites]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Heart className="size-8 fill-red-500 text-red-500" />
          Favorites
        </h1>
        <p className="mt-2 text-muted-foreground">
          {favoritedTools.length} tool
          {favoritedTools.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {/* Favorites Grid */}
      {favoritedTools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoritedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
          <Heart className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Click the heart icon on any tool to add it here
          </p>
        </div>
      )}
    </div>
  );
}
