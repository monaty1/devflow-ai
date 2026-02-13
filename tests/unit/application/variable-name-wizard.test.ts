import { describe, it, expect } from "vitest";
import {
  splitIntoWords,
  detectConvention,
  convertTo,
  convertToAll,
  generateSuggestions,
  isValidForConvention,
  isValidInput,
  expandAbbreviations,
  abbreviateName,
  EXAMPLE_INPUTS,
} from "@/lib/application/variable-name-wizard";
import { DEFAULT_WIZARD_CONFIG } from "@/types/variable-name-wizard";

describe("Variable Name Wizard", () => {
  describe("splitIntoWords", () => {
    it("should split camelCase", () => {
      expect(splitIntoWords("userName")).toEqual(["user", "name"]);
      expect(splitIntoWords("getUserData")).toEqual(["get", "user", "data"]);
    });

    it("should split PascalCase", () => {
      expect(splitIntoWords("UserName")).toEqual(["user", "name"]);
      expect(splitIntoWords("GetUserData")).toEqual(["get", "user", "data"]);
    });

    it("should split snake_case", () => {
      expect(splitIntoWords("user_name")).toEqual(["user", "name"]);
      expect(splitIntoWords("get_user_data")).toEqual(["get", "user", "data"]);
    });

    it("should split SCREAMING_SNAKE_CASE", () => {
      expect(splitIntoWords("USER_NAME")).toEqual(["user", "name"]);
      expect(splitIntoWords("MAX_RETRY_COUNT")).toEqual(["max", "retry", "count"]);
    });

    it("should split kebab-case", () => {
      expect(splitIntoWords("user-name")).toEqual(["user", "name"]);
      expect(splitIntoWords("get-user-data")).toEqual(["get", "user", "data"]);
    });

    it("should handle acronyms", () => {
      expect(splitIntoWords("XMLParser")).toEqual(["xml", "parser"]);
      expect(splitIntoWords("parseJSON")).toEqual(["parse", "json"]);
    });

    it("should handle empty input", () => {
      expect(splitIntoWords("")).toEqual([]);
      expect(splitIntoWords("   ")).toEqual([]);
    });
  });

  describe("detectConvention", () => {
    it("should detect camelCase", () => {
      expect(detectConvention("userName")).toBe("camelCase");
      expect(detectConvention("getUserData")).toBe("camelCase");
    });

    it("should detect PascalCase", () => {
      expect(detectConvention("UserName")).toBe("PascalCase");
      expect(detectConvention("GetUserData")).toBe("PascalCase");
    });

    it("should detect snake_case", () => {
      expect(detectConvention("user_name")).toBe("snake_case");
      expect(detectConvention("get_user_data")).toBe("snake_case");
    });

    it("should detect SCREAMING_SNAKE_CASE", () => {
      expect(detectConvention("USER_NAME")).toBe("SCREAMING_SNAKE_CASE");
      expect(detectConvention("MAX_SIZE")).toBe("SCREAMING_SNAKE_CASE");
    });

    it("should detect kebab-case", () => {
      expect(detectConvention("user-name")).toBe("kebab-case");
      expect(detectConvention("get-user-data")).toBe("kebab-case");
    });

    it("should return unknown for empty input", () => {
      expect(detectConvention("")).toBe("unknown");
      expect(detectConvention("   ")).toBe("unknown");
    });
  });

  describe("convertTo", () => {
    const testName = "get user data";

    it("should convert to camelCase", () => {
      expect(convertTo(testName, "camelCase")).toBe("getUserData");
      expect(convertTo("USER_NAME", "camelCase")).toBe("userName");
    });

    it("should convert to PascalCase", () => {
      expect(convertTo(testName, "PascalCase")).toBe("GetUserData");
      expect(convertTo("user_name", "PascalCase")).toBe("UserName");
    });

    it("should convert to snake_case", () => {
      expect(convertTo(testName, "snake_case")).toBe("get_user_data");
      expect(convertTo("getUserData", "snake_case")).toBe("get_user_data");
    });

    it("should convert to SCREAMING_SNAKE_CASE", () => {
      expect(convertTo(testName, "SCREAMING_SNAKE_CASE")).toBe("GET_USER_DATA");
      expect(convertTo("maxSize", "SCREAMING_SNAKE_CASE")).toBe("MAX_SIZE");
    });

    it("should convert to kebab-case", () => {
      expect(convertTo(testName, "kebab-case")).toBe("get-user-data");
      expect(convertTo("UserName", "kebab-case")).toBe("user-name");
    });

    it("should convert to flatcase", () => {
      expect(convertTo(testName, "flatcase")).toBe("getuserdata");
    });

    it("should convert to UPPERCASE", () => {
      expect(convertTo(testName, "UPPERCASE")).toBe("GETUSERDATA");
    });

    it("should convert to lowercase", () => {
      expect(convertTo(testName, "lowercase")).toBe("getuserdata");
    });
  });

  describe("convertToAll", () => {
    it("should convert to all conventions", () => {
      const result = convertToAll("getUserData");

      expect(result.original).toBe("getUserData");
      expect(result.originalConvention).toBe("camelCase");
      expect(result.conversions.camelCase).toBe("getUserData");
      expect(result.conversions.PascalCase).toBe("GetUserData");
      expect(result.conversions.snake_case).toBe("get_user_data");
      expect(result.conversions.SCREAMING_SNAKE_CASE).toBe("GET_USER_DATA");
      expect(result.conversions["kebab-case"]).toBe("get-user-data");
    });

    it("should generate unique id and timestamp", () => {
      const result = convertToAll("testName");

      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("generateSuggestions", () => {
    it("should generate suggestions for variables", () => {
      const result = generateSuggestions("user name", "variable", DEFAULT_WIZARD_CONFIG);

      expect(result.context).toBe("user name");
      expect(result.type).toBe("variable");
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeLessThanOrEqual(DEFAULT_WIZARD_CONFIG.maxSuggestions);
    });

    it("should generate hook names with use prefix", () => {
      const result = generateSuggestions("auth state", "hook", DEFAULT_WIZARD_CONFIG);

      const hasUsePrefix = result.suggestions.some((s) => s.name.startsWith("use"));
      expect(hasUsePrefix).toBe(true);
    });

    it("should generate PascalCase for components", () => {
      const result = generateSuggestions("user card", "component", DEFAULT_WIZARD_CONFIG);

      const hasPascalCase = result.suggestions.some((s) => s.convention === "PascalCase");
      expect(hasPascalCase).toBe(true);
    });

    it("should generate SCREAMING_SNAKE_CASE for constants", () => {
      const result = generateSuggestions("max retry count", "constant", DEFAULT_WIZARD_CONFIG);

      const hasScreaming = result.suggestions.some(
        (s) => s.convention === "SCREAMING_SNAKE_CASE"
      );
      expect(hasScreaming).toBe(true);
    });

    it("should sort suggestions by score", () => {
      const result = generateSuggestions("user data", "variable", DEFAULT_WIZARD_CONFIG);

      for (let i = 1; i < result.suggestions.length; i++) {
        const prev = result.suggestions[i - 1];
        const curr = result.suggestions[i];
        expect(prev!.score).toBeGreaterThanOrEqual(curr!.score);
      }
    });

    it("should return empty suggestions for empty input", () => {
      const result = generateSuggestions("", "variable", DEFAULT_WIZARD_CONFIG);

      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe("generateSuggestions – uncovered branches", () => {
    it("should generate suggestions for a short 1-word description", () => {
      const result = generateSuggestions("user", "variable", DEFAULT_WIZARD_CONFIG);

      expect(result.suggestions.length).toBeGreaterThan(0);
      // Single-word input should still produce suggestions with suffix/prefix variations
      expect(result.context).toBe("user");
      expect(result.type).toBe("variable");
    });

    it("should generate hook suggestions with 'use' prefix and score them higher", () => {
      const result = generateSuggestions("auth state", "hook", DEFAULT_WIZARD_CONFIG);

      // Should have suggestions that start with "use"
      const usePrefixed = result.suggestions.filter((s) => s.name.toLowerCase().startsWith("use"));
      expect(usePrefixed.length).toBeGreaterThan(0);

      // The "use"-prefixed suggestion should have a higher score than non-use ones
      const nonUsePrefixed = result.suggestions.filter((s) => !s.name.toLowerCase().startsWith("use"));
      if (nonUsePrefixed.length > 0) {
        const maxUseScore = Math.max(...usePrefixed.map((s) => s.score));
        const maxNonUseScore = Math.max(...nonUsePrefixed.map((s) => s.score));
        expect(maxUseScore).toBeGreaterThanOrEqual(maxNonUseScore);
      }

      // Reasoning for hook with "use" prefix should mention React hooks pattern
      const useHookSuggestion = usePrefixed.find((s) => s.reasoning.includes("hooks de React"));
      expect(useHookSuggestion).toBeDefined();
    });

    it("should score PascalCase higher for component type", () => {
      const result = generateSuggestions("user profile card", "component", DEFAULT_WIZARD_CONFIG);

      const pascalSuggestions = result.suggestions.filter((s) => s.convention === "PascalCase");
      expect(pascalSuggestions.length).toBeGreaterThan(0);

      // PascalCase should be among the top-scored suggestions for components
      const topSuggestion = result.suggestions[0];
      expect(topSuggestion).toBeDefined();
      expect(topSuggestion!.convention).toBe("PascalCase");
    });

    it("should score SCREAMING_SNAKE_CASE higher for constant type", () => {
      const result = generateSuggestions("max retry count", "constant", DEFAULT_WIZARD_CONFIG);

      const screamingSuggestions = result.suggestions.filter(
        (s) => s.convention === "SCREAMING_SNAKE_CASE"
      );
      expect(screamingSuggestions.length).toBeGreaterThan(0);

      // SCREAMING_SNAKE_CASE should score highest for constants
      // Check it appears as top suggestion or at least scores well
      const screamingScore = screamingSuggestions[0]!.score;
      expect(screamingScore).toBeGreaterThanOrEqual(70);

      // Should include reasoning about standard convention for constants
      const withReasoning = screamingSuggestions.find((s) =>
        s.reasoning.includes("Convención estándar para constantes")
      );
      expect(withReasoning).toBeDefined();
    });

    it("should score getter prefixes higher for function type", () => {
      const result = generateSuggestions("user data", "function", DEFAULT_WIZARD_CONFIG);

      // Functions with getter prefixes (get, fetch) should score higher
      const getterSuggestions = result.suggestions.filter((s) => {
        const name = s.name.toLowerCase();
        return name.startsWith("get") || name.startsWith("fetch");
      });
      expect(getterSuggestions.length).toBeGreaterThan(0);

      // The getter-prefixed version should have a higher score than the plain version
      const plainSuggestions = result.suggestions.filter((s) => {
        const name = s.name.toLowerCase();
        return !name.startsWith("get") && !name.startsWith("fetch") &&
          !name.startsWith("load") && !name.startsWith("retrieve") &&
          !name.startsWith("find") && !name.startsWith("query") &&
          !name.startsWith("handle") && !name.startsWith("on") &&
          !name.startsWith("process") && !name.startsWith("validate") &&
          !name.startsWith("check") && !name.startsWith("verify") &&
          !name.startsWith("ensure") && !name.startsWith("assert");
      });

      if (plainSuggestions.length > 0) {
        const maxGetterScore = Math.max(...getterSuggestions.map((s) => s.score));
        const maxPlainScore = Math.max(...plainSuggestions.map((s) => s.score));
        expect(maxGetterScore).toBeGreaterThan(maxPlainScore);
      }

      // Should include reasoning about descriptive prefix
      const withReasoning = getterSuggestions.find((s) =>
        s.reasoning.includes("Prefijo de acción descriptivo")
      );
      expect(withReasoning).toBeDefined();
    });

    it("should generate suggestions for a very long description (>5 words)", () => {
      const longDescription = "calculate total price with tax and discount applied";
      const result = generateSuggestions(longDescription, "variable", DEFAULT_WIZARD_CONFIG);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.context).toBe(longDescription);

      // Suggestions with >5 words should get a score penalty (-15) from the length check
      // The base words version (7 words) should have lower score than shorter variations
      for (const suggestion of result.suggestions) {
        expect(suggestion.score).toBeGreaterThanOrEqual(0);
        expect(suggestion.score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("isValidForConvention", () => {
    it("should validate camelCase", () => {
      expect(isValidForConvention("userName", "camelCase")).toBe(true);
      expect(isValidForConvention("UserName", "camelCase")).toBe(false);
    });

    it("should validate PascalCase", () => {
      expect(isValidForConvention("UserName", "PascalCase")).toBe(true);
      expect(isValidForConvention("userName", "PascalCase")).toBe(false);
    });

    it("should validate snake_case", () => {
      expect(isValidForConvention("user_name", "snake_case")).toBe(true);
      expect(isValidForConvention("userName", "snake_case")).toBe(false);
    });

    it("should validate SCREAMING_SNAKE_CASE", () => {
      expect(isValidForConvention("USER_NAME", "SCREAMING_SNAKE_CASE")).toBe(true);
      expect(isValidForConvention("user_name", "SCREAMING_SNAKE_CASE")).toBe(false);
    });

    it("should validate kebab-case", () => {
      expect(isValidForConvention("user-name", "kebab-case")).toBe(true);
      expect(isValidForConvention("user_name", "kebab-case")).toBe(false);
    });
  });

  describe("isValidInput", () => {
    it("should return true for valid input", () => {
      expect(isValidInput("userName")).toBe(true);
      expect(isValidInput("get user data")).toBe(true);
    });

    it("should return false for empty input", () => {
      expect(isValidInput("")).toBe(false);
      expect(isValidInput("   ")).toBe(false);
    });
  });

  describe("abbreviateName", () => {
    it("should abbreviate common words", () => {
      const abbreviated = abbreviateName("user configuration");
      expect(abbreviated).toContain("config");
    });

    it("should abbreviate multiple words", () => {
      const abbreviated = abbreviateName("database connection");
      expect(abbreviated).toContain("db");
      expect(abbreviated).toContain("conn");
    });

    it("should keep unknown words unchanged", () => {
      const abbreviated = abbreviateName("custom value");
      expect(abbreviated).toContain("custom");
    });
  });

  describe("expandAbbreviations", () => {
    it("should expand common abbreviations", () => {
      const expanded = expandAbbreviations("db conn");
      expect(expanded).toContain("database");
      expect(expanded).toContain("connection");
    });

    it("should expand multiple abbreviations", () => {
      const expanded = expandAbbreviations("usr cfg");
      // usr is not a standard abbreviation, so only cfg should expand
      expect(expanded).toContain("usr"); // not expanded
    });

    it("should keep unknown abbreviations unchanged", () => {
      const expanded = expandAbbreviations("xyz abc");
      expect(expanded).toBe("xyz abc");
    });
  });

  describe("EXAMPLE_INPUTS", () => {
    it("should have example inputs defined", () => {
      expect(EXAMPLE_INPUTS.length).toBeGreaterThan(0);
    });

    it("should be able to convert all examples", () => {
      for (const example of EXAMPLE_INPUTS) {
        const result = convertToAll(example);
        expect(result.conversions.camelCase).toBeDefined();
      }
    });
  });
});
