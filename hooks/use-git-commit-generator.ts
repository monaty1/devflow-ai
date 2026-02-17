"use client";

import { useState, useCallback } from "react";
import type {
  CommitConfig,
  CommitResult,
  CommitType,
  ParsedCommit,
} from "@/types/git-commit-generator";
import { DEFAULT_COMMIT_CONFIG } from "@/types/git-commit-generator";
import {
  generateCommitMessage,
  parseCommitMessage,
  suggestScope,
  analyzeDiff,
  EXAMPLE_COMMITS,
} from "@/lib/application/git-commit-generator";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  message: string;
  type: CommitType;
  timestamp: string;
}

export function useGitCommitGenerator() {
  const [config, setConfig] = useState<CommitConfig>(DEFAULT_COMMIT_CONFIG);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [parseInput, setParseInput] = useState("");
  const [diffInput, setDiffInput] = useState("");
  const [parsedCommit, setParsedCommit] = useState<ParsedCommit | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-git-commit-generator-history", 10);

  const addToHistory = useCallback((commitResult: CommitResult) => {
    const newItem: HistoryItem = {
      id: commitResult.id,
      message: commitResult.message,
      type: commitResult.type,
      timestamp: commitResult.timestamp,
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

  const generate = useCallback(() => {
    if (!config.description.trim()) return;

    const commitResult = generateCommitMessage(config);
    setResult(commitResult);
    addToHistory(commitResult);
  }, [config, addToHistory]);

  const parse = useCallback(() => {
    if (!parseInput.trim()) {
      setParsedCommit(null);
      return;
    }
    const parsed = parseCommitMessage(parseInput);
    setParsedCommit(parsed);
  }, [parseInput]);

  const analyze = useCallback(() => {
    if (!diffInput.trim()) return;
    const analysis = analyzeDiff(diffInput);
    
    setConfig(prev => ({
      ...prev,
      type: analysis.suggestedType,
      scope: analysis.suggestedScope,
      breakingChange: analysis.isBreaking ? "Breaking change detected in diff" : "",
    }));
  }, [diffInput]);

  const loadExample = useCallback((type: CommitType) => {
    const example = EXAMPLE_COMMITS[type];
    setParseInput(example);
    const parsed = parseCommitMessage(example);
    setParsedCommit(parsed);
  }, []);

  const updateConfig = useCallback(
    <K extends keyof CommitConfig>(key: K, value: CommitConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const getSuggestions = useCallback((description: string) => {
    return suggestScope(description);
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_COMMIT_CONFIG);
    setResult(null);
    setParseInput("");
    setDiffInput("");
    setParsedCommit(null);
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setParseInput(item.message);
    const parsed = parseCommitMessage(item.message);
    setParsedCommit(parsed);
  }, []);

  return {
    // State
    config,
    result,
    parseInput,
    diffInput,
    parsedCommit,
    history,

    // Setters
    setParseInput,
    setDiffInput,
    updateConfig,

    // Actions
    generate,
    parse,
    analyze,
    loadExample,
    getSuggestions,
    reset,
    clearHistory,
    loadFromHistory,
  };
}
