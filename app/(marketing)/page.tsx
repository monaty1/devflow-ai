import Link from "next/link";
import { Zap, Monitor, LockOpen, Star, Shield, TrendingUp } from "lucide-react";
import { t } from "@/lib/i18n-server";
import { GsapReveal } from "@/components/marketing/gsap-reveal";
import { GitHubStarsServer } from "@/components/marketing/github-stars-server";
import { FeaturesSection } from "@/components/marketing/features-section";

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/albertoguinda/devflow-ai",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data: { stargazers_count?: number } = await res.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const stars = await getGitHubStars();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section — fully server-rendered */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
              <Zap className="size-4" />
              {t("home.badge")}
            </span>

            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t("home.title1")}
              <span className="block text-foreground bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("home.title2")}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("home.subtitle")}
            </p>

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

      {/* Stats Section — server-rendered with real stars */}
      <GsapReveal className="container mx-auto px-4 py-16">
        <h2 className="sr-only">Project Stats</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: t("home.freeTools"), value: "15", icon: <Zap className="size-6" /> },
            { label: t("home.openSource"), value: "100%", icon: <Monitor className="size-6" /> },
            { label: t("home.noApiKey"), value: "0", icon: <LockOpen className="size-6" /> },
            { label: t("home.githubStars"), value: null, icon: <Star className="size-6" /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-muted/50 p-6 text-center"
            >
              <div className="mb-2 flex justify-center text-muted-foreground">{stat.icon}</div>
              {stat.value !== null ? (
                <span className="block h-9 text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
              ) : (
                <GitHubStarsServer stars={stars} />
              )}
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </GsapReveal>

      {/* Features Section — client island (GSAP stagger + icon mapping) */}
      <FeaturesSection />

      {/* Why DevFlow Section — server-rendered */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold">{t("home.whyTitle")}</h2>
            <p className="text-muted-foreground">
              {t("home.whySubtitle")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
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
            ].map((item) => (
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

      {/* CTA Section — client island (GSAP scroll reveal) */}
      <GsapReveal className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            {t("home.ctaTitle")}
          </h2>
          <p className="mb-8 text-white/90">
            {t("home.ctaSubtitle")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/tools"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-white px-8 font-semibold text-blue-900 transition-colors hover:bg-blue-50"
            >
              {t("home.startUsing")}
            </Link>
            <Link
              href="https://github.com/albertoguinda/devflow-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border-2 border-white px-8 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("home.starGithub")}
            </Link>
          </div>
        </div>
      </GsapReveal>

      {/* Footer — server-rendered */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 DevFlow AI &middot;{" "}
          <Link
            href="https://www.linkedin.com/in/albertoguindasevilla/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Alberto Guinda
          </Link>
          {" "}&middot; {t("home.footerFreeOS")} &middot;{" "}
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
