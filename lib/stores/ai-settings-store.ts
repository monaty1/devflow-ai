"use client";

import { create } from "zustand";
import type { AIProviderType } from "@/types/ai";

interface AISettingsState {
  /** BYOK key — in memory only, lost on tab close (secure by design) */
  byokKey: string;
  byokProvider: AIProviderType;
  isAIEnabled: boolean;
  setByokKey: (key: string) => void;
  setByokProvider: (provider: AIProviderType) => void;
  setAIEnabled: (enabled: boolean) => void;
  clearByok: () => void;
}

/**
 * AI settings store — NO persist middleware.
 * BYOK key stays in memory only, cleared when tab closes.
 */
export const useAISettingsStore = create<AISettingsState>((set) => ({
  byokKey: "",
  byokProvider: "gemini",
  isAIEnabled: true,
  setByokKey: (key) => set({ byokKey: key }),
  setByokProvider: (provider) => set({ byokProvider: provider }),
  setAIEnabled: (enabled) => set({ isAIEnabled: enabled }),
  clearByok: () => set({ byokKey: "", byokProvider: "gemini" }),
}));
