"use client";

import { useState, useCallback, useMemo } from "react";
import {
  createDocument,
  createContextWindow,
  addDocumentToWindow,
  removeDocumentFromWindow,
  reorderDocuments,
  exportContext,
  exportForAI,
} from "@/lib/application/context-manager";
import type {
  ContextWindow,
  DocumentType,
  Priority,
  ExportedContext,
} from "@/types/context-manager";

const STORAGE_KEY = "devflow-context-windows";

function getInitialWindows(): ContextWindow[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ContextWindow[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

interface UseContextManagerReturn {
  windows: ContextWindow[];
  activeWindow: ContextWindow | null;
  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;
  createWindow: (name: string) => string;
  deleteWindow: (id: string) => void;
  addDocument: (
    title: string,
    content: string,
    type: DocumentType,
    priority: Priority,
    tags: string[],
    filePath?: string,
    instructions?: string,
    targetWindowId?: string
  ) => void;
  removeDocument: (documentId: string) => void;
  changePriority: (documentId: string, priority: Priority) => void;
  setMaxTokens: (maxTokens: number) => void;
  exportWindow: (format: "xml" | "json" | "markdown") => ExportedContext | null;
  exportForAI: (options?: { stripComments?: boolean }) => string | null;
}

export function useContextManager(): UseContextManagerReturn {
  const [windows, setWindows] = useState<ContextWindow[]>(getInitialWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const saveWindows = useCallback(
    (updater: (prev: ContextWindow[]) => ContextWindow[]) => {
      setWindows((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
        return next;
      });
    },
    []
  );

  const activeWindow = useMemo(
    () => windows.find((w) => w.id === activeWindowId) ?? null,
    [windows, activeWindowId]
  );

  const createWindowHandler = useCallback(
    (name: string): string => {
      const newWindow = createContextWindow(name);
      saveWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(newWindow.id);
      return newWindow.id;
    },
    [saveWindows]
  );

  const deleteWindow = useCallback(
    (id: string) => {
      let fallbackId: string | null = null;
      saveWindows((prev) => {
        const next = prev.filter((w) => w.id !== id);
        fallbackId = next[0]?.id ?? null;
        return next;
      });
      setActiveWindowId((prevId) => (prevId === id ? fallbackId : prevId));
    },
    [saveWindows]
  );

  const addDocument = useCallback(
    (
      title: string,
      content: string,
      type: DocumentType,
      priority: Priority,
      tags: string[],
      filePath?: string,
      instructions?: string,
      targetWindowId?: string
    ) => {
      const doc = createDocument(title, content, type, priority, tags, filePath, instructions);
      saveWindows((prev) => {
        const wId = targetWindowId ?? activeWindowId;
        if (!wId) return prev;
        return prev.map((w) =>
          w.id === wId ? addDocumentToWindow(w, doc) : w
        );
      });
    },
    [activeWindowId, saveWindows]
  );

  const removeDocument = useCallback(
    (documentId: string) => {
      saveWindows((prev) => {
        if (!activeWindowId) return prev;
        return prev.map((w) =>
          w.id === activeWindowId ? removeDocumentFromWindow(w, documentId) : w
        );
      });
    },
    [activeWindowId, saveWindows]
  );

  const changePriority = useCallback(
    (documentId: string, priority: Priority) => {
      saveWindows((prev) => {
        if (!activeWindowId) return prev;
        return prev.map((w) =>
          w.id === activeWindowId ? reorderDocuments(w, documentId, priority) : w
        );
      });
    },
    [activeWindowId, saveWindows]
  );

  const setMaxTokens = useCallback(
    (maxTokens: number) => {
      saveWindows((prev) => {
        if (!activeWindowId) return prev;
        return prev.map((w) => {
          if (w.id !== activeWindowId) return w;
          const totalTokens = w.documents.reduce((sum, d) => sum + d.tokenCount, 0);
          return {
            ...w,
            maxTokens,
            utilizationPercentage: Math.round((totalTokens / maxTokens) * 100),
          };
        });
      });
    },
    [activeWindowId, saveWindows]
  );

  const exportWindowHandler = useCallback(
    (format: "xml" | "json" | "markdown"): ExportedContext | null => {
      if (!activeWindow) return null;
      return exportContext(activeWindow, format);
    },
    [activeWindow]
  );

  const exportForAIHandler = useCallback(
    (options?: { stripComments?: boolean }): string | null => {
      if (!activeWindow) return null;
      return exportForAI(activeWindow, options);
    },
    [activeWindow]
  );

  return {
    windows,
    activeWindow,
    activeWindowId,
    setActiveWindowId,
    createWindow: createWindowHandler,
    deleteWindow,
    addDocument,
    removeDocument,
    changePriority,
    setMaxTokens,
    exportWindow: exportWindowHandler,
    exportForAI: exportForAIHandler,
  };
}
