"use client";

import { useScrollReveal } from "@/hooks/use-gsap";
import type { ReactNode } from "react";

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
}

export function GsapReveal({ children, className }: GsapRevealProps) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
