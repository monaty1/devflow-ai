"use client";

import { useRef, useEffect } from "react";
import { useScrollReveal } from "@/hooks/use-gsap";
import { useTranslation } from "@/hooks/use-translation";
import { Zap, Monitor, LockOpen, Star } from "lucide-react";
import gsap from "gsap";

function CounterDisplay({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      ref.current.textContent = Math.round(target).toLocaleString();
      return;
    }

    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value).toLocaleString();
        }
      },
    });
  }, [target]);

  return (
    <span ref={ref} className="block text-3xl font-bold text-foreground">
      0
    </span>
  );
}

export default function StatsSection() {
  const statsRef = useScrollReveal();
  const { t } = useTranslation();

  const stats = [
    { label: t("home.freeTools"), value: 15, icon: <Zap className="size-6" /> },
    { label: t("home.openSource"), value: 100, icon: <Monitor className="size-6" /> },
    { label: t("home.noApiKey"), value: 0, icon: <LockOpen className="size-6" /> },
    { label: t("home.githubStars"), value: 500, icon: <Star className="size-6" /> },
  ];

  return (
    <section ref={statsRef} className="container mx-auto px-4 py-16">
      <h2 className="sr-only">Project Stats</h2>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-muted/50 p-6 text-center">
            <div className="mb-2 flex justify-center text-muted-foreground">{stat.icon}</div>
            <CounterDisplay target={stat.value} />
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
