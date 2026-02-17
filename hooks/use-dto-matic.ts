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
  parseJson,
  generateMockData,
  EXAMPLE_JSON,
} from "@/lib/application/dto-matic";
import { useToolHistory } from "@/hooks/use-tool-history";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { useEffect } from "react";

interface HistoryItem {
  id: string;
  rootName: string;
  mode: GenerationMode;
  timestamp: string;
  filesCount: number;
}

export function useDtoMatic() {
  const [jsonInput, setJsonInput] = useState("");
  const [config, setConfig] = useState<DtoMaticConfig>({
    mode: "clean-arch",
    targetLanguage: "typescript",
    rootName: "Data",
    naming: "camelCase",
    optionalFields: true,
    detectDates: true,
    detectSemanticTypes: true,
    exportTypes: true,
    readonlyEntities: true,
    generateMappers: true,
    generateZod: false,
    javaPackage: "com.example.dto",
    csharpNamespace: "App.Domain.Models",
    goPackage: "models",
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [mockData, setMockData] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-dto-matic-history", 10);
  
  const { getSharedData, clearSharedData } = useSmartNavigation();

  useEffect(() => {
    const shared = getSharedData();
    if (shared) {
      setJsonInput(shared);
      // Optional: clearSharedData(); // Keep it for now in case of refresh
    }
  }, [getSharedData]);

  const addToHistory = useCallback((genResult: GenerationResult) => {
    const newItem: HistoryItem = {
      id: genResult.id,
      rootName: genResult.config.rootName,
      mode: genResult.config.mode,
      timestamp: genResult.generatedAt,
      filesCount: genResult.files.length,
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

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
    setMockData(null);

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

  const generateMock = useCallback((count: number = 5) => {
    if (!isValidJson(jsonInput)) return;
    try {
      const parsed = parseJson(jsonInput);
      const mock = generateMockData(parsed.fields, count);
      setMockData(JSON.stringify(mock, null, 2));
    } catch (e) {
      console.error(e);
    }
  }, [jsonInput]);

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
    setMockData(null);
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

  const selectedFile = result?.files.find((f) => f.id === selectedFileId) ?? null;

  return {
    // State
    jsonInput,
    config,
    result,
    mockData,
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
    generateMock,
    formatInput,
    loadExample,
    reset,
    clearHistory,
    // Utilities
    isValidJson,
  };
}
