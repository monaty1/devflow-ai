"use client";

import { useState, useCallback } from "react";

interface WithId {
  id: string;
}

interface UseToolHistoryReturn<T extends WithId> {
  history: T[];
  addToHistory: (item: T) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

function loadFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, items: T[], max: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, max)));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

export function useToolHistory<T extends WithId>(
  storageKey: string,
  maxItems = 50,
): UseToolHistoryReturn<T> {
  const [history, setHistory] = useState<T[]>(() => loadFromStorage<T>(storageKey));

  const addToHistory = useCallback(
    (item: T) => {
      setHistory((prev) => {
        const updated = [item, ...prev].slice(0, maxItems);
        saveToStorage(storageKey, updated, maxItems);
        return updated;
      });
    },
    [storageKey, maxItems],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToStorage(storageKey, updated, maxItems);
        return updated;
      });
    },
    [storageKey, maxItems],
  );

  return { history, addToHistory, clearHistory, removeFromHistory };
}
