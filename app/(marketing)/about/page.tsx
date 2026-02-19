"use client";

import { Card } from "@heroui/react";
import { useFadeIn, useStaggerIn } from "@/hooks/use-gsap";
import { Github, Linkedin, Mail, Code2, Heart, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function AboutPage() {
  const headerRef = useFadeIn();
  const cardsRef = useStaggerIn("> *", 0.15);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        ref={headerRef}
        className="container mx-auto max-w-3xl px-4 py-20 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold">{t("about.title")}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {t("about.description")}
        </p>
      </section>

      {/* Mission Cards */}
      <section ref={cardsRef} className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Code2 className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.builtForDevs")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.builtForDevsDesc")}
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <Heart className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.openTransparent")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.openTransparentDesc")}
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <Zap className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.speedFirst")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.speedFirstDesc")}
            </p>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">{t("about.techStack")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                name: "Next.js 16",
                category: t("about.techFramework"),
                color: "bg-gray-100 dark:bg-gray-800",
              },
              {
                name: "React 19",
                category: t("about.techUI"),
                color: "bg-blue-50 dark:bg-blue-900/30",
              },
              {
                name: "TypeScript 5.7",
                category: t("about.techLanguage"),
                color: "bg-purple-50 dark:bg-purple-900/30",
              },
              {
                name: "Tailwind v4",
                category: t("about.techStyling"),
                color: "bg-cyan-50 dark:bg-cyan-900/30",
              },
              {
                name: "HeroUI v3",
                category: t("about.techComponents"),
                color: "bg-pink-50 dark:bg-pink-900/30",
              },
              {
                name: "Vitest",
                category: t("about.techTesting"),
                color: "bg-emerald-50 dark:bg-emerald-900/30",
              },
              {
                name: "GSAP",
                category: t("about.techAnimations"),
                color: "bg-amber-50 dark:bg-amber-900/30",
              },
              {
                name: "Zustand",
                category: t("about.techState"),
                color: "bg-indigo-50 dark:bg-indigo-900/30",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`rounded-xl p-4 text-center ${tech.color}`}
              >
                <p className="font-semibold text-foreground">{tech.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tech.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">{t("about.connect")}</h2>
        <p className="mb-8 text-muted-foreground">
          {t("about.connectDesc")}
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-muted p-3 transition-colors hover:bg-muted/80"
            aria-label="GitHub"
          >
            <Github className="size-5 text-foreground" />
          </a>
          <a
            href="https://www.linkedin.com/in/albertoguindasevilla/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
            aria-label="LinkedIn"
          >
            <Linkedin className="size-5 text-blue-600 dark:text-blue-400" />
          </a>
          <a
            href="mailto:contact@devflow.ai"
            className="rounded-full bg-purple-50 p-3 transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            aria-label={t("about.email")}
          >
            <Mail className="size-5 text-purple-600 dark:text-purple-400" />
          </a>
        </div>
      </section>
    </div>
  );
}
