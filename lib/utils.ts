import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GLOW_MAP: Record<string, string> = {
  blue: "border-blue-500/25 shadow-[0_0_20px_-5px] shadow-blue-500/15 hover:shadow-blue-500/25 hover:border-blue-500/40",
  emerald: "border-emerald-500/25 shadow-[0_0_20px_-5px] shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:border-emerald-500/40",
  amber: "border-amber-500/25 shadow-[0_0_20px_-5px] shadow-amber-500/15 hover:shadow-amber-500/25 hover:border-amber-500/40",
  purple: "border-purple-500/25 shadow-[0_0_20px_-5px] shadow-purple-500/15 hover:shadow-purple-500/25 hover:border-purple-500/40",
  rose: "border-rose-500/25 shadow-[0_0_20px_-5px] shadow-rose-500/15 hover:shadow-rose-500/25 hover:border-rose-500/40",
  cyan: "border-cyan-500/25 shadow-[0_0_20px_-5px] shadow-cyan-500/15 hover:shadow-cyan-500/25 hover:border-cyan-500/40",
  green: "border-green-500/25 shadow-[0_0_20px_-5px] shadow-green-500/15 hover:shadow-green-500/25 hover:border-green-500/40",
  violet: "border-violet-500/25 shadow-[0_0_20px_-5px] shadow-violet-500/15 hover:shadow-violet-500/25 hover:border-violet-500/40",
  sky: "border-sky-500/25 shadow-[0_0_20px_-5px] shadow-sky-500/15 hover:shadow-sky-500/25 hover:border-sky-500/40",
  fuchsia: "border-fuchsia-500/25 shadow-[0_0_20px_-5px] shadow-fuchsia-500/15 hover:shadow-fuchsia-500/25 hover:border-fuchsia-500/40",
  yellow: "border-yellow-500/25 shadow-[0_0_20px_-5px] shadow-yellow-500/15 hover:shadow-yellow-500/25 hover:border-yellow-500/40",
  indigo: "border-indigo-500/25 shadow-[0_0_20px_-5px] shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:border-indigo-500/40",
  teal: "border-teal-500/25 shadow-[0_0_20px_-5px] shadow-teal-500/15 hover:shadow-teal-500/25 hover:border-teal-500/40",
  orange: "border-orange-500/25 shadow-[0_0_20px_-5px] shadow-orange-500/15 hover:shadow-orange-500/25 hover:border-orange-500/40",
};

/**
 * Format an ISO timestamp or Date as a relative time string.
 * Returns "just now", "2m ago", "3h ago", "yesterday", or a short date.
 */
export function formatRelativeTime(date: string | Date, locale: string = "en"): string {
  const now = Date.now();
  const then = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isEs = locale === "es";

  if (diffSec < 60) return isEs ? "ahora mismo" : "just now";
  if (diffMin < 60) return isEs ? `hace ${diffMin}m` : `${diffMin}m ago`;
  if (diffHour < 24) return isEs ? `hace ${diffHour}h` : `${diffHour}h ago`;
  if (diffDay === 1) return isEs ? "ayer" : "yesterday";
  if (diffDay < 7) return isEs ? `hace ${diffDay}d` : `${diffDay}d ago`;

  return new Date(then).toLocaleDateString(isEs ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get decorative glow border classes from a tool's gradient color string.
 * Parses "from-{color}-500" and returns matching border + shadow classes.
 */
export function getToolGlowClass(color: string): string {
  const match = color.match(/from-(\w+)-\d+/);
  const base = match?.[1] ?? "gray";
  return GLOW_MAP[base] ?? "border-border";
}
