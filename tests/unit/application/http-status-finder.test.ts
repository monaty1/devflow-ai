import { describe, it, expect } from "vitest";
import {
  HTTP_STATUS_CODES,
  searchByCode,
  searchByKeyword,
  getByCategory,
  getCommonCodes,
  isValidStatusCode,
  getCategoryInfo,
  processSearch,
} from "@/lib/application/http-status-finder";
import type { HttpStatusCategory } from "@/types/http-status-finder";

describe("HTTP Status Code Finder", () => {
  describe("HTTP_STATUS_CODES database", () => {
    it("should have at least 50 status codes", () => {
      expect(HTTP_STATUS_CODES.length).toBeGreaterThanOrEqual(50);
    });

    it("should have unique codes", () => {
      const codes = HTTP_STATUS_CODES.map((s) => s.code);
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });

    it("should have all required fields for each code", () => {
      HTTP_STATUS_CODES.forEach((status) => {
        expect(status.code).toBeGreaterThan(0);
        expect(status.name).toBeTruthy();
        expect(status.description).toBeTruthy();
        expect(status.category).toBeTruthy();
        expect(status.whenToUse).toBeTruthy();
        expect(status.example).toBeTruthy();
        expect(typeof status.isCommon).toBe("boolean");
      });
    });

    it("should have codes in all 5 categories", () => {
      const categories = new Set(HTTP_STATUS_CODES.map((s) => s.category));
      expect(categories.has("1xx")).toBe(true);
      expect(categories.has("2xx")).toBe(true);
      expect(categories.has("3xx")).toBe(true);
      expect(categories.has("4xx")).toBe(true);
      expect(categories.has("5xx")).toBe(true);
    });

    it("should have correct category for each code", () => {
      HTTP_STATUS_CODES.forEach((status) => {
        const expectedPrefix = status.category.slice(0, 1);
        expect(status.code.toString()[0]).toBe(expectedPrefix);
      });
    });

    it("should include well-known codes", () => {
      const codes = HTTP_STATUS_CODES.map((s) => s.code);
      expect(codes).toContain(200);
      expect(codes).toContain(201);
      expect(codes).toContain(301);
      expect(codes).toContain(400);
      expect(codes).toContain(401);
      expect(codes).toContain(403);
      expect(codes).toContain(404);
      expect(codes).toContain(500);
    });

    it("should include fun codes like 418", () => {
      const codes = HTTP_STATUS_CODES.map((s) => s.code);
      expect(codes).toContain(418);
      expect(codes).toContain(451);
    });
  });

  describe("searchByCode", () => {
    it("should find 200 OK", () => {
      const result = searchByCode(200);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("OK");
    });

    it("should find 404 Not Found", () => {
      const result = searchByCode(404);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Not Found");
    });

    it("should find 500 Internal Server Error", () => {
      const result = searchByCode(500);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Internal Server Error");
    });

    it("should return null for non-existent code", () => {
      const result = searchByCode(999);
      expect(result).toBeNull();
    });

    it("should return null for code 0", () => {
      const result = searchByCode(0);
      expect(result).toBeNull();
    });

    it("should return null for negative code", () => {
      const result = searchByCode(-1);
      expect(result).toBeNull();
    });
  });

  describe("searchByKeyword", () => {
    it("should find codes by name", () => {
      const results = searchByKeyword("Not Found");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.code === 404)).toBe(true);
    });

    it("should find codes by description keyword", () => {
      const results = searchByKeyword("autenticación");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", () => {
      const results1 = searchByKeyword("not found");
      const results2 = searchByKeyword("NOT FOUND");
      expect(results1.length).toBe(results2.length);
    });

    it("should return empty for empty query", () => {
      const results = searchByKeyword("");
      expect(results).toHaveLength(0);
    });

    it("should search in whenToUse field", () => {
      const results = searchByKeyword("Rate limiting");
      expect(results.some((r) => r.code === 429)).toBe(true);
    });

    it("should find partial matches", () => {
      const results = searchByKeyword("redirect");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getByCategory", () => {
    it("should return 1xx codes", () => {
      const results = getByCategory("1xx");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe("1xx"));
    });

    it("should return 2xx codes", () => {
      const results = getByCategory("2xx");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe("2xx"));
    });

    it("should return 3xx codes", () => {
      const results = getByCategory("3xx");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe("3xx"));
    });

    it("should return 4xx codes", () => {
      const results = getByCategory("4xx");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe("4xx"));
    });

    it("should return 5xx codes", () => {
      const results = getByCategory("5xx");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe("5xx"));
    });

    it("should return only codes from the specified category", () => {
      const categories: HttpStatusCategory[] = ["1xx", "2xx", "3xx", "4xx", "5xx"];
      categories.forEach((cat) => {
        const results = getByCategory(cat);
        results.forEach((r) => expect(r.category).toBe(cat));
      });
    });
  });

  describe("getCommonCodes", () => {
    it("should return common codes only", () => {
      const results = getCommonCodes();
      results.forEach((r) => expect(r.isCommon).toBe(true));
    });

    it("should include 200", () => {
      const results = getCommonCodes();
      expect(results.some((r) => r.code === 200)).toBe(true);
    });

    it("should include 404", () => {
      const results = getCommonCodes();
      expect(results.some((r) => r.code === 404)).toBe(true);
    });

    it("should include 500", () => {
      const results = getCommonCodes();
      expect(results.some((r) => r.code === 500)).toBe(true);
    });

    it("should have at least 15 common codes", () => {
      const results = getCommonCodes();
      expect(results.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("isValidStatusCode", () => {
    it("should return true for 200", () => {
      expect(isValidStatusCode(200)).toBe(true);
    });

    it("should return true for 404", () => {
      expect(isValidStatusCode(404)).toBe(true);
    });

    it("should return true for 418 (teapot)", () => {
      expect(isValidStatusCode(418)).toBe(true);
    });

    it("should return false for 0", () => {
      expect(isValidStatusCode(0)).toBe(false);
    });

    it("should return false for 999", () => {
      expect(isValidStatusCode(999)).toBe(false);
    });

    it("should return false for -1", () => {
      expect(isValidStatusCode(-1)).toBe(false);
    });

    it("should return false for non-standard code like 600", () => {
      expect(isValidStatusCode(600)).toBe(false);
    });
  });

  describe("getCategoryInfo", () => {
    it("should return info for all categories", () => {
      const categories: HttpStatusCategory[] = ["1xx", "2xx", "3xx", "4xx", "5xx"];
      categories.forEach((cat) => {
        const info = getCategoryInfo(cat);
        expect(info.category).toBe(cat);
        expect(info.label).toBeTruthy();
        expect(info.description).toBeTruthy();
        expect(info.color).toBeTruthy();
      });
    });

    it("should return correct colors", () => {
      expect(getCategoryInfo("1xx").color).toBe("blue");
      expect(getCategoryInfo("2xx").color).toBe("green");
      expect(getCategoryInfo("3xx").color).toBe("yellow");
      expect(getCategoryInfo("4xx").color).toBe("orange");
      expect(getCategoryInfo("5xx").color).toBe("red");
    });
  });

  describe("processSearch", () => {
    it("should return common codes when no query", () => {
      const result = processSearch("");
      expect(result.codes.length).toBeGreaterThan(0);
      result.codes.forEach((c) => expect(c.isCommon).toBe(true));
    });

    it("should search by code number", () => {
      const result = processSearch("200");
      expect(result.codes).toHaveLength(1);
      expect(result.codes[0]?.code).toBe(200);
    });

    it("should search by partial code", () => {
      const result = processSearch("40");
      expect(result.codes.length).toBeGreaterThan(1);
      result.codes.forEach((c) => expect(c.code.toString().startsWith("40")).toBe(true));
    });

    it("should search by keyword", () => {
      const result = processSearch("not found");
      expect(result.codes.some((c) => c.code === 404)).toBe(true);
    });

    it("should filter by category", () => {
      const result = processSearch("", "4xx");
      result.codes.forEach((c) => expect(c.category).toBe("4xx"));
    });

    it("should combine keyword and category filter", () => {
      const result = processSearch("error", "5xx");
      result.codes.forEach((c) => expect(c.category).toBe("5xx"));
    });

    it("should include timestamp in result", () => {
      const result = processSearch("200");
      expect(result.timestamp).toBeTruthy();
    });

    it("should include query in result", () => {
      const result = processSearch("test query");
      expect(result.query).toBe("test query");
    });

    it("should return empty when no matches", () => {
      const result = processSearch("zzzznonexistent");
      expect(result.codes).toHaveLength(0);
    });
  });
});
