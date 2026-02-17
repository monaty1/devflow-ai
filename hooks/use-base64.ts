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
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  mode: Base64Mode;
  timestamp: string;
}

export function useBase64() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [config, setConfig] = useState<Base64Config>(DEFAULT_BASE64_CONFIG);
  const [result, setResult] = useState<Base64Result | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-base64-history", 10);

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
    addItemToHistory(newItem);
  }, [addItemToHistory]);

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

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInput(item.input.replace("...", ""));
    setMode(item.mode);
    setResult(null);
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

  const handleFileSelect = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        if (base64) {
          setInput(base64);
          setMode("decode");
          setResult(null);
          // Manually process to get stats/detection
          const res = processBase64(base64, "decode", config);
          res.fileInfo = {
            name: file.name,
            mimeType: file.type,
            size: file.size
          };
          setResult(res);
        }
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [config]);

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
    applyOutput,
    toDataUrl,
    fromDataUrl,
    handleFileSelect,
  };
}
