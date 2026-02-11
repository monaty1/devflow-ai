"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
}

export function ToolHeader({
  title,
  description,
  icon: Icon,
  gradient,
  actions,
}: ToolHeaderProps) {
  if (Icon && gradient) {
    return (
      <div className={cn("flex items-center gap-3", actions && "justify-between")}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
              gradient
            )}
          >
            <Icon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className={cn(actions && "flex items-start justify-between")}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}
