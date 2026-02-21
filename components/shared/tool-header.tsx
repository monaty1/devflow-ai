"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { HelpLink } from "./help-link";

interface ToolHeaderProps {
  /** Tool title */
  title: string;
  /** Short description */
  description: string;
  /** Lucide icon component (enables gradient icon box) */
  icon?: LucideIcon;
  /** Tailwind gradient classes, e.g. "from-indigo-500 to-blue-600" */
  gradient?: string;
  /** Optional action slot (buttons, toggles) rendered on the right */
  actions?: ReactNode;
  /** Show breadcrumb navigation (Tools > Current Page) */
  breadcrumb?: boolean;
}

export function ToolHeader({
  title,
  description,
  icon: Icon,
  gradient,
  actions,
  breadcrumb = false,
}: ToolHeaderProps) {
  const { t } = useTranslation();

  const breadcrumbNav = breadcrumb ? (
    <nav aria-label={t("common.breadcrumb")} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/tools" className="transition-colors hover:text-foreground">
        {t("common.tools")}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="text-foreground">{title}</span>
    </nav>
  ) : null;

  const actionsWithHelp = (
    <div className="flex items-center gap-3">
      {actions}
      <HelpLink />
    </div>
  );

  if (Icon && gradient) {
    return (
      <div>
        {breadcrumbNav}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
                gradient
              )}
            >
              <Icon className="size-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {actionsWithHelp}
        </div>
      </div>
    );
  }

  return (
    <div>
      {breadcrumbNav}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {actionsWithHelp}
      </div>
    </div>
  );
}
