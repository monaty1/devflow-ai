"use client";

import { useStaggerIn } from "@/hooks/use-gsap";
import { useTranslation } from "@/hooks/use-translation";
import { FeatureCard } from "@/components/ui/feature-card";
import { TOOLS_DATA } from "@/config/tools-data";
import { TOOL_ICON_MAP } from "@/config/tool-icon-map";

export function FeaturesSection() {
  const ref = useStaggerIn("> *", 0.3);
  const { t } = useTranslation();

  return (
    <section className="border-t border-border bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-bold">{t("home.powerfulTools")}</h2>
          <p className="text-muted-foreground">
            {t("home.powerfulToolsDesc")}
          </p>
        </div>

        <div
          ref={ref}
          className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TOOLS_DATA.map((tool) => {
            const Icon = TOOL_ICON_MAP[tool.icon];
            if (!Icon) return null;
            return (
              <FeatureCard
                key={tool.id}
                icon={Icon}
                title={tool.name}
                description={tool.description}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
