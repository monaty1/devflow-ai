"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  Base64Config,
  Base64Result,
  Base64Mode,
} from "@/types/base64";
import { DEFAULT_BASE64_CONFIG } from "@/types/base64";
import {
  processBase64,
  validateBase64,
  encodeBase64,
  decodeBase64,
  fileToDataUrl,
  dataUrlToBase64,
  EXAMPLE_BASE64,
} from "@/lib/application/base64";

const HISTORY_KEY = "devflow-base64-history";
const MAX_HISTORY = 10;

interface HistoryItem {
  id: string;
  input: string;
  mode: Base64Mode;
  timestamp: string;
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

export function useBase64() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [config, setConfig] = useState<Base64Config>(DEFAULT_BASE64_CONFIG);
  const [result, setResult] = useState<Base64Result | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  // Computed values
  const inputStats = useMemo(() => {
    return {
      characters: input.length,
      bytes: new Blob([input]).size,
      lines: input.split("\n").length,
    };
  }, [input]);

  const inputValidation = useMemo(() => {
    if (!input.trim()) {
      return { isValid: false, error: undefined };
    }
    if (mode === "decode") {
      return validateBase64(input, config.variant);
    }
    // For encode mode, any input is valid
    return { isValid: true };
  }, [input, mode, config.variant]);

  const addToHistory = useCallback((inputValue: string, inputMode: Base64Mode) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      input: inputValue.slice(0, 100) + (inputValue.length > 100 ? "..." : ""),
      mode: inputMode,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const process = useCallback(() => {
    if (!input.trim()) return;

    const formatResult = processBase64(input, mode, config);
    setResult(formatResult);
    if (formatResult.isValid) {
      addToHistory(input, mode);
    }
  }, [input, mode, config, addToHistory]);

  const encode = useCallback(() => {
    setMode("encode");
    if (!input.trim()) return;
    const formatResult = processBase64(input, "encode", config);
    setResult(formatResult);
    if (formatResult.isValid) {
      addToHistory(input, "encode");
    }
  }, [input, config, addToHistory]);

  const decode = useCallback(() => {
    setMode("decode");
    if (!input.trim()) return;
    const formatResult = processBase64(input, "decode", config);
    setResult(formatResult);
    if (formatResult.isValid) {
      addToHistory(input, "decode");
    }
  }, [input, config, addToHistory]);

  const quickEncode = useCallback(
    (text: string) => {
      return encodeBase64(text, config);
    },
    [config]
  );

  const quickDecode = useCallback(
    (base64: string) => {
      try {
        return decodeBase64(base64, config);
      } catch {
        return null;
      }
    },
    [config]
  );

  const updateConfig = useCallback(
    <K extends keyof Base64Config>(key: K, value: Base64Config[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const loadExample = useCallback((type: keyof typeof EXAMPLE_BASE64) => {
    setInput(EXAMPLE_BASE64[type]);
    setResult(null);
    // Auto-set mode based on example type
    if (type === "encoded" || type === "urlSafe") {
      setMode("decode");
    } else {
      setMode("encode");
    }
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInput(item.input.replace("...", ""));
    setMode(item.mode);
    setResult(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const applyOutput = useCallback(() => {
    if (result?.output) {
      setInput(result.output);
      // Toggle mode when applying output
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
      setResult(null);
    }
  }, [result]);

  const toDataUrl = useCallback(
    (mimeType: string = "text/plain") => {
      if (!result?.output || mode !== "encode") return "";
      return fileToDataUrl(result.output.replace(/\s/g, ""), mimeType);
    },
    [result, mode]
  );

  const fromDataUrl = useCallback(
    (dataUrl: string) => {
      const parsed = dataUrlToBase64(dataUrl);
      if (parsed) {
        setInput(parsed.base64);
        setMode("decode");
        setResult(null);
      }
    },
    []
  );

  return {
    // State
    input,
    mode,
    config,
    result,
    history,
    inputStats,
    inputValidation,

    // Setters
    setInput,
    setMode,
    updateConfig,

    // Actions
    process,
    encode,
    decode,
    quickEncode,
    quickDecode,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    copyToClipboard,
    applyOutput,
    toDataUrl,
    fromDataUrl,
  };
}
