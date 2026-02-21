import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock the application modules before importing hooks
vi.mock("@/lib/application/variable-name-wizard", () => ({
  convertToAll: vi.fn(),
  generateSuggestions: vi.fn(),
}));

vi.mock("@/lib/application/regex-humanizer", () => ({
  explainRegex: vi.fn(),
  generateRegex: vi.fn(),
  testRegex: vi.fn(),
}));

vi.mock("@/lib/application/dto-matic", () => ({
  generateCode: vi.fn(),
  isValidJson: vi.fn(),
  formatJson: vi.fn(),
  parseJson: vi.fn(),
  generateMockData: vi.fn(),
  EXAMPLE_JSON: '{"example": true}',
}));

// Mock zustand locale store
vi.mock("@/lib/stores/locale-store", () => ({
  useLocaleStore: vi.fn((selector: (state: { locale: string }) => string) =>
    selector({ locale: "en" })
  ),
}));

// Mock useTranslation
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useToolHistory
vi.mock("@/hooks/use-tool-history", () => ({
  useToolHistory: () => ({
    history: [],
    addToHistory: vi.fn(),
    clearHistory: vi.fn(),
  }),
}));

// Mock useSmartNavigation
vi.mock("@/hooks/use-smart-navigation", () => ({
  useSmartNavigation: () => ({
    getSharedData: vi.fn(() => null),
    clearSharedData: vi.fn(),
  }),
}));

import { useVariableNameWizard } from "@/hooks/use-variable-name-wizard";
import { useRegexHumanizer } from "@/hooks/use-regex-humanizer";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import { convertToAll, generateSuggestions } from "@/lib/application/variable-name-wizard";
import { explainRegex, generateRegex, testRegex } from "@/lib/application/regex-humanizer";
import { isValidJson, parseJson, generateMockData } from "@/lib/application/dto-matic";

describe("Hook Error Propagation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => store[key] ?? null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => { store[key] = value; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useVariableNameWizard", () => {
    it("should expose error when convertToAll throws", async () => {
      vi.mocked(convertToAll).mockImplementation(() => {
        throw new Error("Conversion failed");
      });

      const { result } = renderHook(() => useVariableNameWizard());

      await act(async () => {
        result.current.setInput("test_input");
      });
      await act(async () => {
        await result.current.convert();
      });

      expect(result.current.error).toBe("Conversion failed");
    });

    it("should expose error when generateSuggestions throws", async () => {
      vi.mocked(generateSuggestions).mockImplementation(() => {
        throw new Error("Generation failed");
      });

      const { result } = renderHook(() => useVariableNameWizard());

      await act(async () => {
        result.current.setInput("test input");
      });
      await act(async () => {
        await result.current.generate();
      });

      expect(result.current.error).toBe("Generation failed");
    });

    it("should clear error on reset", async () => {
      vi.mocked(convertToAll).mockImplementation(() => {
        throw new Error("Test error");
      });

      const { result } = renderHook(() => useVariableNameWizard());

      await act(async () => {
        result.current.setInput("input");
      });
      await act(async () => {
        await result.current.convert();
      });
      expect(result.current.error).toBe("Test error");

      await act(async () => {
        result.current.reset();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useRegexHumanizer", () => {
    it("should expose error when explainRegex throws", async () => {
      vi.mocked(explainRegex).mockImplementation(() => {
        throw new Error("Explain failed");
      });

      const { result } = renderHook(() => useRegexHumanizer());

      await act(async () => {
        await result.current.explain("^test$");
      });

      expect(result.current.error).toBe("Explain failed");
    });

    it("should expose error when generateRegex throws", async () => {
      vi.mocked(generateRegex).mockImplementation(() => {
        throw new Error("Generate regex failed");
      });

      const { result } = renderHook(() => useRegexHumanizer());

      await act(async () => {
        await result.current.generate("match emails");
      });

      expect(result.current.error).toBe("Generate regex failed");
    });

    it("should expose error when testRegex throws", async () => {
      vi.mocked(testRegex).mockImplementation(() => {
        throw new Error("Test regex failed");
      });

      const { result } = renderHook(() => useRegexHumanizer());

      await act(async () => {
        await result.current.test("^test$", "test string");
      });

      expect(result.current.error).toBe("Test regex failed");
    });

    it("should clear error on reset", async () => {
      vi.mocked(explainRegex).mockImplementation(() => {
        throw new Error("Error");
      });

      const { result } = renderHook(() => useRegexHumanizer());

      await act(async () => {
        await result.current.explain("test");
      });
      expect(result.current.error).toBe("Error");

      await act(async () => {
        result.current.reset();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useDtoMatic", () => {
    it("should expose error when generateMockData throws", async () => {
      vi.mocked(isValidJson).mockReturnValue(true);
      vi.mocked(parseJson).mockReturnValue({ fields: [], rootType: "object" });
      vi.mocked(generateMockData).mockImplementation(() => {
        throw new Error("Mock generation failed");
      });

      const { result } = renderHook(() => useDtoMatic());

      await act(async () => {
        result.current.setJsonInput('{"test": true}');
      });
      await act(async () => {
        result.current.generateMock(5);
      });

      expect(result.current.error).toBe("Mock generation failed");
    });
  });
});
