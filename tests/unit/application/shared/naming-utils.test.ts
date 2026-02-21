import { describe, it, expect } from "vitest";
import {
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
} from "@/lib/application/shared/naming-utils";

describe("Naming Utils", () => {
  describe("toCamelCase", () => {
    it("converts snake_case to camelCase", () => {
      expect(toCamelCase("user_name")).toBe("userName");
    });

    it("converts kebab-case to camelCase", () => {
      expect(toCamelCase("user-name")).toBe("userName");
    });

    it("converts PascalCase to camelCase", () => {
      expect(toCamelCase("UserName")).toBe("userName");
    });

    it("handles empty string", () => {
      expect(toCamelCase("")).toBe("");
    });

    it("handles spaces as separators", () => {
      expect(toCamelCase("user name")).toBe("userName");
    });

    it("handles multiple separators", () => {
      expect(toCamelCase("my-user_name")).toBe("myUserName");
    });

    it("handles trailing separator", () => {
      expect(toCamelCase("user_")).toBe("user");
    });
  });

  describe("toPascalCase", () => {
    it("converts snake_case to PascalCase", () => {
      expect(toPascalCase("user_name")).toBe("UserName");
    });

    it("converts kebab-case to PascalCase", () => {
      expect(toPascalCase("user-name")).toBe("UserName");
    });

    it("handles single word", () => {
      expect(toPascalCase("user")).toBe("User");
    });
  });

  describe("toSnakeCase", () => {
    it("converts camelCase to snake_case", () => {
      expect(toSnakeCase("userName")).toBe("user_name");
    });

    it("converts PascalCase to snake_case", () => {
      expect(toSnakeCase("UserName")).toBe("user_name");
    });

    it("converts kebab-case to snake_case", () => {
      expect(toSnakeCase("user-name")).toBe("user_name");
    });
  });

  describe("toKebabCase", () => {
    it("converts camelCase to kebab-case", () => {
      expect(toKebabCase("userName")).toBe("user-name");
    });

    it("converts PascalCase to kebab-case", () => {
      expect(toKebabCase("UserName")).toBe("user-name");
    });

    it("converts snake_case to kebab-case", () => {
      expect(toKebabCase("user_name")).toBe("user-name");
    });
  });
});
