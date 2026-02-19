import Link from "next/link";
import { Zap, Monitor, LockOpen, Star } from "lucide-react";
import { t, getServerLocale } from "@/lib/i18n-server";
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
  const [stars, locale] = await Promise.all([getGitHubStars(), getServerLocale()]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
              <Zap className="size-4" />
              {t("home.badge", locale)}
            </span>

            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t("home.title1", locale)}
              <span className="block text-foreground bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("home.title2", locale)}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("home.subtitle", locale)}
            </p>

            <div className="pt-4">
              <Link
                href="/tools"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                {t("home.getStarted", locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <GsapReveal className="container mx-auto px-4 py-16">
        <h2 className="sr-only">{t("home.statsLabel", locale)}</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: t("home.freeTools", locale), value: "15", icon: <Zap className="size-6" /> },
            { label: t("home.openSource", locale), value: "100%", icon: <Monitor className="size-6" /> },
            { label: t("home.noApiKey", locale), value: "0", icon: <LockOpen className="size-6" /> },
            { label: t("home.githubStars", locale), value: null, icon: <Star className="size-6" /> },
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

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
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
          {" "}&middot; {t("home.footerFreeOS", locale)} &middot;{" "}
          <Link
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            {t("home.starGithub", locale)}
          </Link>
        </div>
      </footer>
    </div>
  );
}
