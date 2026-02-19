"use client";

import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

export function HelpLink() {
  const { t } = useTranslation();

  return (
    <Link
      href="/docs"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label={t("common.helpDocs")}
    >
      <HelpCircle className="size-4" />
      <span>{t("common.help")}</span>
    </Link>
  );
}
