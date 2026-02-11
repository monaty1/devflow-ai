"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatusBadgeVariant = "success" | "info" | "warning" | "error" | "neutral" | "purple";
type StatusBadgeSize = "sm" | "md";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  size?: StatusBadgeSize;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
  info: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  error: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-muted text-muted-foreground",
  purple: "bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
};

const SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function StatusBadge({
  variant,
  size = "sm",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
