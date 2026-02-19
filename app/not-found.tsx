"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <Sparkles className="mb-6 size-12 text-primary" aria-hidden="true" />
      <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
      <p className="mb-1 text-xl text-muted-foreground">
        {t("notFound.subtitle")}
      </p>
      <p className="mb-8 text-sm text-muted-foreground/70">
        {t("notFound.hint")}
      </p>
      <Link
        href="/tools"
        className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("notFound.backToTools")}
      </Link>
    </div>
  );
}
