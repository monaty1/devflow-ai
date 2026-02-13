"use client";

import { Shield, TrendingUp, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function WhySection() {
  const { t } = useTranslation();

  const items = [
    {
      icon: Shield,
      title: t("home.securityTitle"),
      description: t("home.securityDesc"),
    },
    {
      icon: TrendingUp,
      title: t("home.costTitle"),
      description: t("home.costDesc"),
    },
    {
      icon: Zap,
      title: t("home.dxTitle"),
      description: t("home.dxDesc"),
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-bold">{t("home.whyTitle")}</h2>
          <p className="text-muted-foreground">
            {t("home.whySubtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <item.icon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
