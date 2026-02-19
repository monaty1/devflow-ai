import { describe, it, expect } from "vitest";
import {
  calculateCost,
  compareAllModels,
  calculateMonthlyCost,
  formatCost,
  convertCost,
  exportComparisonCsv,
} from "@/lib/application/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";
import type { AIModel } from "@/types/cost-calculator";

describe("Cost Calculator", () => {
  const testModel: AIModel = {
    id: "test-model",
    provider: "openai",
    name: "test-model",
    displayName: "Test Model",
    inputPricePerMToken: 2.5,
    outputPricePerMToken: 10.0,
    contextWindow: 128000,
    maxOutput: 4096,
    isPopular: false,
    updatedAt: new Date().toISOString(),
    category: "general",
  };

  describe("calculateCost", () => {
    it("should calculate cost correctly", () => {
      const result = calculateCost(testModel, 1000000, 1000000);

      expect(result.inputCost).toBe(2.5);
      expect(result.outputCost).toBe(10.0);
      expect(result.totalCost).toBe(12.5);
    });

    it("should handle zero tokens", () => {
      const result = calculateCost(testModel, 0, 0);

      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it("should handle small token counts", () => {
      const result = calculateCost(testModel, 1000, 500);

      expect(result.inputCost).toBeCloseTo(0.0025, 6);
      expect(result.outputCost).toBeCloseTo(0.005, 6);
      expect(result.totalCost).toBeCloseTo(0.0075, 6);
    });

    it("should return correct structure", () => {
      const result = calculateCost(testModel, 10000, 5000);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("model");
      expect(result).toHaveProperty("inputTokens", 10000);
      expect(result).toHaveProperty("outputTokens", 5000);
      expect(result).toHaveProperty("calculatedAt");
      expect(result.model.id).toBe("test-model");
    });
  });

  describe("compareAllModels", () => {
    it("should compare all available models", () => {
      const comparison = compareAllModels(10000, 5000);

      expect(comparison.inputTokens).toBe(10000);
      expect(comparison.outputTokens).toBe(5000);
      expect(comparison.results.length).toBe(AI_MODELS.length);
    });

    it("should sort results by total cost ascending", () => {
      const comparison = compareAllModels(10000, 5000);

      for (let i = 1; i < comparison.results.length; i++) {
        const prev = comparison.results[i - 1];
        const curr = comparison.results[i];
        expect(prev).toBeDefined();
        expect(curr).toBeDefined();
        if (prev && curr) {
          expect(prev.totalCost).toBeLessThanOrEqual(curr.totalCost);
        }
      }
    });

    it("should have cheapest model first", () => {
      const comparison = compareAllModels(1000000, 500000);

      const firstResult = comparison.results[0];
      expect(firstResult).toBeDefined();

      const minCost = Math.min(...comparison.results.map((r) => r.totalCost));
      expect(firstResult?.totalCost).toBe(minCost);
    });
  });

  describe("calculateMonthlyCost", () => {
    it("should calculate monthly cost correctly", () => {
      const monthlyCost = calculateMonthlyCost(testModel, 100, 10000, 5000, 30);

      // Daily: 100 * ((10000/1M * 2.5) + (5000/1M * 10)) = 100 * (0.025 + 0.05) = 7.5
      // Monthly: 7.5 * 30 = 225
      expect(monthlyCost).toBeCloseTo(225, 2);
    });

    it("should handle default days per month", () => {
      const withDefault = calculateMonthlyCost(testModel, 10, 1000, 500);
      const with30Days = calculateMonthlyCost(testModel, 10, 1000, 500, 30);

      expect(withDefault).toBe(with30Days);
    });

    it("should scale linearly with daily requests", () => {
      const cost10 = calculateMonthlyCost(testModel, 10, 1000, 500);
      const cost20 = calculateMonthlyCost(testModel, 20, 1000, 500);

      expect(cost20).toBeCloseTo(cost10 * 2, 6);
    });
  });

  describe("convertCost", () => {
    it("should return same value for USD", () => {
      expect(convertCost(10, "USD")).toBe(10);
    });

    it("should convert to EUR", () => {
      expect(convertCost(10, "EUR")).toBeCloseTo(9.2, 5);
    });

    it("should convert to GBP", () => {
      expect(convertCost(10, "GBP")).toBeCloseTo(7.9, 5);
    });
  });

  describe("exportComparisonCsv", () => {
    it("should have correct CSV headers", () => {
      const comparison = compareAllModels(1000, 500);
      const csv = exportComparisonCsv(comparison);
      const firstLine = csv.split("\n")[0];
      expect(firstLine).toBe("Model,Provider,Input Cost,Output Cost,Total Cost,Value Score");
    });

    it("should produce one row per model", () => {
      const comparison = compareAllModels(1000, 500);
      const lines = exportComparisonCsv(comparison).split("\n");
      expect(lines.length).toBe(comparison.results.length + 1);
    });

    it("should apply EUR currency", () => {
      const comparison = compareAllModels(1000000, 500000);
      const csv = exportComparisonCsv(comparison, "EUR");
      expect(csv).toContain("€");
    });

    it("should apply GBP currency", () => {
      const comparison = compareAllModels(1000000, 500000);
      const csv = exportComparisonCsv(comparison, "GBP");
      expect(csv).toContain("£");
    });
  });

  describe("formatCost", () => {
    it("should format very small costs", () => {
      expect(formatCost(0.00001)).toBe("$0.00");
      expect(formatCost(0.00005)).toBe("$0.00");
    });

    it("should format small costs with 4 decimals", () => {
      expect(formatCost(0.0001)).toBe("$0.0001");
      expect(formatCost(0.0099)).toBe("$0.0099");
    });

    it("should format medium costs with 3 decimals", () => {
      expect(formatCost(0.01)).toBe("$0.010");
      expect(formatCost(0.999)).toBe("$0.999");
    });

    it("should format regular costs with 2 decimals", () => {
      expect(formatCost(1.5)).toBe("$1.50");
      expect(formatCost(99.99)).toBe("$99.99");
    });

    it("should format large costs with locale formatting", () => {
      const formatted = formatCost(1234.56);
      expect(formatted).toContain("1");
      expect(formatted).toContain("234");
    });
  });
});
