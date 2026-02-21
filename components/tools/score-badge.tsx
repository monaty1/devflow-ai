"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { ScoreCategory } from "@/types/prompt-analyzer";

interface ScoreBadgeProps {
  score: number;
  category: ScoreCategory;
  /** Optional translated category label (falls back to raw category string) */
  categoryLabel?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const CATEGORY_COLORS: Record<ScoreCategory, string> = {
  excellent: "#22c55e", // green-500
  good: "#84cc16", // lime-500
  average: "#eab308", // yellow-500
  poor: "#f97316", // orange-500
  critical: "#ef4444", // red-500
};

const SIZES = {
  sm: { svg: 64, stroke: 4, fontSize: "text-lg" },
  md: { svg: 96, stroke: 6, fontSize: "text-2xl" },
  lg: { svg: 128, stroke: 8, fontSize: "text-3xl" },
};

export function ScoreBadge({
  score,
  category,
  categoryLabel,
  size = "md",
  animate = true,
}: ScoreBadgeProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const config = SIZES[size];
  const radius = (config.svg - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 10) * circumference;
  const color = CATEGORY_COLORS[category];

  useEffect(() => {
    if (!animate || !progressRef.current || !scoreRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const progressCircle = progressRef.current;
    const scoreElement = scoreRef.current;

    if (prefersReducedMotion) {
      // Skip animation, set final values immediately
      progressCircle.style.strokeDashoffset = String(targetOffset);
      scoreElement.textContent = String(score);
      return;
    }

    // Animate progress circle from 0 to target
    gsap.fromTo(
      progressCircle,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: targetOffset,
        duration: 1,
        ease: "power2.out",
      }
    );

    // Animate score number from 0 to target
    const obj = { value: 0 };
    gsap.to(obj, {
      value: score,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        scoreElement.textContent = Math.round(obj.value).toString();
      },
    });
  }, [score, circumference, targetOffset, animate]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.svg}
        height={config.svg}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={config.svg / 2}
          cy={config.svg / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          ref={progressRef}
          cx={config.svg / 2}
          cy={config.svg / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : targetOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          ref={scoreRef}
          className={`font-bold ${config.fontSize}`}
          style={{ color }}
        >
          {animate ? 0 : score}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {categoryLabel ?? category}
        </span>
      </div>
    </div>
  );
}
