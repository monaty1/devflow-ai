"use client";

import { useStaggerIn } from "@/hooks/use-gsap";
import type { ReactNode } from "react";

interface GsapStaggerProps {
  children: ReactNode;
  className?: string;
}

export function GsapStagger({ children, className }: GsapStaggerProps) {
  const ref = useStaggerIn("> *", 0.3);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
