"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Heavy below-the-fold sections loaded lazily to reduce main thread work
const StatsSection = dynamic(() => import("./sections/stats-section"), {
  ssr: false,
});
const FeaturesSection = dynamic(() => import("./sections/features-section"), {
  ssr: false,
});
const WhySection = dynamic(() => import("./sections/why-section"), {
  ssr: false,
});
const CtaSection = dynamic(() => import("./sections/cta-section"), {
  ssr: false,
});

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section — always critical, rendered immediately */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
              <Zap className="size-4" />
              {t("home.badge")}
            </span>

            {/* Title */}
            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t("home.title1")}
              <span className="block text-foreground bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("home.title2")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("home.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Link
                href="/tools"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                {t("home.getStarted")}
              </Link>
              <Link
                href="/tools"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-border px-8 text-base font-medium transition-colors hover:bg-muted"
              >
                {t("home.viewTools")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Below-the-fold sections — lazy loaded */}
      <StatsSection />
      <FeaturesSection />
      <WhySection />
      <CtaSection />

      {/* Footer — lightweight, no lazy load needed */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 DevFlow AI ·{" "}
          <Link
            href="https://www.linkedin.com/in/albertoguindasevilla/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Alberto Guinda
          </Link>
          {" "}· {t("home.footerFreeOS")} ·{" "}
          <Link
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            {t("home.starGithub")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
