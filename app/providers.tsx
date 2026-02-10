"use client";

import type { ReactNode } from "react";
import { FavoritesProvider } from "@/lib/context";
import { ToastProvider } from "@/components/shared/toast-container";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <FavoritesProvider>
      <ToastProvider>{children}</ToastProvider>
    </FavoritesProvider>
  );
}
