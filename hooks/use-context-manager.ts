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
  createWindow: (name: string) => void;
  deleteWindow: (id: string) => void;
  addDocument: (
    title: string,
    content: string,
    type: DocumentType,
    priority: Priority,
    tags: string[],
    filePath?: string,
    instructions?: string
  ) => void;
  removeDocument: (documentId: string) => void;
  changePriority: (documentId: string, priority: Priority) => void;
  exportWindow: (format: "xml" | "json" | "markdown") => ExportedContext | null;
  exportForAI: () => string | null;
}

export function useContextManager(): UseContextManagerReturn {
  const [windows, setWindows] = useState<ContextWindow[]>(getInitialWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const saveWindows = useCallback((newWindows: ContextWindow[]) => {
    setWindows(newWindows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWindows));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const activeWindow = useMemo(
    () => windows.find((w) => w.id === activeWindowId) ?? null,
    [windows, activeWindowId]
  );

  const createWindowHandler = useCallback(
    (name: string) => {
      const newWindow = createContextWindow(name);
      const updated = [...windows, newWindow];
      saveWindows(updated);
      setActiveWindowId(newWindow.id);
    },
    [windows, saveWindows]
  );

  const deleteWindow = useCallback(
    (id: string) => {
      const updated = windows.filter((w) => w.id !== id);
      saveWindows(updated);
      if (activeWindowId === id) {
        setActiveWindowId(updated[0]?.id ?? null);
      }
    },
    [windows, activeWindowId, saveWindows]
  );

  const addDocument = useCallback(
    (
      title: string,
      content: string,
      type: DocumentType,
      priority: Priority,
      tags: string[],
      filePath?: string,
      instructions?: string
    ) => {
      if (!activeWindow) return;

      const doc = createDocument(title, content, type, priority, tags, filePath, instructions);
      const updated = windows.map((w) =>
        w.id === activeWindowId ? addDocumentToWindow(w, doc) : w
      );
      saveWindows(updated);
    },
    [activeWindow, activeWindowId, windows, saveWindows]
  );

  const removeDocument = useCallback(
    (documentId: string) => {
      if (!activeWindow) return;

      const updated = windows.map((w) =>
        w.id === activeWindowId ? removeDocumentFromWindow(w, documentId) : w
      );
      saveWindows(updated);
    },
    [activeWindow, activeWindowId, windows, saveWindows]
  );

  const changePriority = useCallback(
    (documentId: string, priority: Priority) => {
      if (!activeWindow) return;

      const updated = windows.map((w) =>
        w.id === activeWindowId ? reorderDocuments(w, documentId, priority) : w
      );
      saveWindows(updated);
    },
    [activeWindow, activeWindowId, windows, saveWindows]
  );

  const exportWindowHandler = useCallback(
    (format: "xml" | "json" | "markdown"): ExportedContext | null => {
      if (!activeWindow) return null;
      return exportContext(activeWindow, format);
    },
    [activeWindow]
  );

  const exportForAIHandler = useCallback((): string | null => {
    if (!activeWindow) return null;
    return exportForAI(activeWindow);
  }, [activeWindow]);

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
    exportWindow: exportWindowHandler,
    exportForAI: exportForAIHandler,
  };
}
