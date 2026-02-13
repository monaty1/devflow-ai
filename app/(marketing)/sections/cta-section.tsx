"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-gsap";
import { useTranslation } from "@/hooks/use-translation";

export default function CtaSection() {
  const ctaRef = useScrollReveal();
  const { t } = useTranslation();

  return (
    <section ref={ctaRef} className="container mx-auto px-4 py-24">
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
    </section>
  );
}
