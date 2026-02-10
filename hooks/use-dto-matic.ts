"use client";

import { useState, useCallback } from "react";
import type {
  DtoMaticConfig,
  GenerationResult,
  GenerationMode,
} from "@/types/dto-matic";
import {
  generateCode,
  isValidJson,
  formatJson,
  EXAMPLE_JSON,
} from "@/lib/application/dto-matic";

const HISTORY_KEY = "devflow-dto-matic-history";
const MAX_HISTORY = 10;

interface HistoryItem {
  id: string;
  rootName: string;
  mode: GenerationMode;
  timestamp: string;
  filesCount: number;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // Ignore storage errors
  }
}

export function useDtoMatic() {
  const [jsonInput, setJsonInput] = useState("");
  const [config, setConfig] = useState<DtoMaticConfig>({
    mode: "clean-arch",
    rootName: "Data",
    naming: "camelCase",
    optionalFields: true,
    detectDates: true,
    exportTypes: true,
    readonlyEntities: true,
    generateMappers: true,
    generateZod: false,
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const addToHistory = useCallback((genResult: GenerationResult) => {
    const newItem: HistoryItem = {
      id: genResult.id,
      rootName: genResult.config.rootName,
      mode: genResult.config.mode,
      timestamp: genResult.generatedAt,
      filesCount: genResult.files.length,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const generate = useCallback(() => {
    if (!jsonInput.trim()) {
      setError("Por favor, introduce un JSON válido");
      return;
    }

    if (!isValidJson(jsonInput)) {
      setError("El JSON no es válido. Verifica la sintaxis.");
      return;
    }

    if (!config.rootName.trim()) {
      setError("Por favor, introduce un nombre para el tipo raíz");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genResult = generateCode(jsonInput, config);
      setResult(genResult);
      setSelectedFileId(genResult.files[0]?.id ?? null);
      addToHistory(genResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar el código");
    } finally {
      setIsGenerating(false);
    }
  }, [jsonInput, config, addToHistory]);

  const formatInput = useCallback(() => {
    if (isValidJson(jsonInput)) {
      setJsonInput(formatJson(jsonInput));
      setError(null);
    } else {
      setError("El JSON no es válido. No se puede formatear.");
    }
  }, [jsonInput]);

  const loadExample = useCallback(() => {
    setJsonInput(EXAMPLE_JSON);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setJsonInput("");
    setResult(null);
    setSelectedFileId(null);
    setError(null);
  }, []);

  const updateConfig = useCallback(
    <K extends keyof DtoMaticConfig>(key: K, value: DtoMaticConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setMode = useCallback((mode: GenerationMode) => {
    updateConfig("mode", mode);
    // Adjust related settings based on mode
    if (mode === "quick") {
      updateConfig("generateMappers", false);
      updateConfig("generateZod", false);
    } else if (mode === "clean-arch") {
      updateConfig("generateMappers", true);
      updateConfig("generateZod", false);
    } else if (mode === "zod") {
      updateConfig("generateMappers", false);
      updateConfig("generateZod", true);
    }
  }, [updateConfig]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const copyAllFiles = useCallback(async () => {
    if (!result) return;

    const allContent = result.files
      .map((f) => `// === ${f.name} ===\n\n${f.content}`)
      .join("\n\n");

    await navigator.clipboard.writeText(allContent);
  }, [result]);

  const selectedFile = result?.files.find((f) => f.id === selectedFileId) ?? null;

  return {
    // State
    jsonInput,
    config,
    result,
    selectedFile,
    selectedFileId,
    isGenerating,
    error,
    history,

    // Setters
    setJsonInput,
    setSelectedFileId,
    updateConfig,
    setMode,

    // Actions
    generate,
    formatInput,
    loadExample,
    reset,
    clearHistory,
    copyToClipboard,
    copyAllFiles,

    // Utilities
    isValidJson,
  };
}
