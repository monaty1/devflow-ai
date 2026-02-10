import { describe, it, expect } from "vitest";
import {
  parseJson,
  generateCode,
  isValidJson,
  formatJson,
  EXAMPLE_JSON,
} from "@/lib/application/dto-matic";
import { DEFAULT_CONFIG } from "@/types/dto-matic";

describe("DTO-Matic", () => {
  describe("parseJson", () => {
    it("should parse a simple object", () => {
      const result = parseJson('{"name": "test", "age": 25}');

      expect(result.rootType).toBe("object");
      expect(result.fields.length).toBe(2);
      expect(result.fields[0]!.name).toBe("name");
      expect(result.fields[0]!.type).toBe("string");
      expect(result.fields[1]!.name).toBe("age");
      expect(result.fields[1]!.type).toBe("number");
    });

    it("should parse an array of objects", () => {
      const result = parseJson('[{"id": 1}, {"id": 2}]');

      expect(result.rootType).toBe("array");
      expect(result.fields.length).toBe(1);
      expect(result.fields[0]!.name).toBe("id");
      expect(result.fields[0]!.type).toBe("number");
    });

    it("should detect date strings", () => {
      const result = parseJson('{"createdAt": "2024-01-15T10:30:00Z"}');

      expect(result.fields[0]!.isDate).toBe(true);
      expect(result.fields[0]!.type).toBe("date");
    });

    it("should handle nested objects", () => {
      const result = parseJson('{"user": {"name": "test", "email": "test@test.com"}}');

      expect(result.fields[0]!.type).toBe("object");
      expect(result.fields[0]!.children).toBeDefined();
      expect(result.fields[0]!.children!.length).toBe(2);
    });

    it("should handle arrays", () => {
      const result = parseJson('{"tags": ["a", "b", "c"]}');

      expect(result.fields[0]!.isArray).toBe(true);
      expect(result.fields[0]!.type).toBe("string");
    });

    it("should handle null values", () => {
      const result = parseJson('{"data": null}');

      expect(result.fields[0]!.type).toBe("null");
      expect(result.fields[0]!.isOptional).toBe(true);
    });

    it("should handle boolean values", () => {
      const result = parseJson('{"isActive": true}');

      expect(result.fields[0]!.type).toBe("boolean");
    });

    it("should throw error for non-object/array root", () => {
      expect(() => parseJson('"just a string"')).toThrow();
    });
  });

  describe("generateCode", () => {
    const simpleJson = '{"id": 1, "name": "test"}';

    it("should generate DTO interface in quick mode", () => {
      const result = generateCode(simpleJson, {
        ...DEFAULT_CONFIG,
        mode: "quick",
        rootName: "User",
      });

      expect(result.files.length).toBeGreaterThanOrEqual(1);
      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile).toBeDefined();
      expect(dtoFile!.content).toContain("interface UserDto");
      expect(dtoFile!.content).toContain("id:");
      expect(dtoFile!.content).toContain("name:");
    });

    it("should generate DTO, Entity and Mapper in clean-arch mode", () => {
      const result = generateCode(simpleJson, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        generateMappers: true,
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      const entityFile = result.files.find((f) => f.type === "entity");
      const mapperFile = result.files.find((f) => f.type === "mapper");

      expect(dtoFile).toBeDefined();
      expect(entityFile).toBeDefined();
      expect(mapperFile).toBeDefined();

      expect(entityFile!.content).toContain("interface User");
      expect(mapperFile!.content).toContain("userToDomain");
      expect(mapperFile!.content).toContain("userToDto");
    });

    it("should generate Zod schema when enabled", () => {
      const result = generateCode(simpleJson, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        generateZod: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile).toBeDefined();
      expect(zodFile!.content).toContain('import { z } from "zod"');
      expect(zodFile!.content).toContain("userSchema = z.object");
    });

    it("should generate index file for multiple files", () => {
      const result = generateCode(simpleJson, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
      });

      const indexFile = result.files.find((f) => f.type === "index");
      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain("export * from");
    });

    it("should apply camelCase naming convention", () => {
      const json = '{"user_name": "test", "user_email": "test@test.com"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
        naming: "camelCase",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("userName:");
      expect(dtoFile!.content).toContain("userEmail:");
    });

    it("should apply PascalCase naming convention", () => {
      const json = '{"user_name": "test"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
        naming: "PascalCase",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("UserName:");
    });

    it("should mark fields as optional when enabled", () => {
      const json = '{"data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Response",
        optionalFields: true,
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("data?:");
    });

    it("should add readonly modifier to entities when enabled", () => {
      const result = generateCode(simpleJson, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        readonlyEntities: true,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile!.content).toContain("readonly id:");
      expect(entityFile!.content).toContain("readonly name:");
    });

    it("should convert date strings to Date type in entities", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        detectDates: true,
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      const entityFile = result.files.find((f) => f.type === "entity");

      expect(dtoFile!.content).toContain("createdAt:"); // string in DTO
      expect(entityFile!.content).toContain("Date"); // Date in Entity
    });

    it("should handle nested objects correctly", () => {
      const json = '{"user": {"name": "test", "profile": {"avatar": "url"}}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Response",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("interface ResponseDtoUser");
    });

    it("should calculate stats correctly", () => {
      const json = '{"id": 1, "tags": ["a"], "user": {"name": "test"}, "created": "2024-01-01T00:00:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Data",
      });

      expect(result.stats.totalTypes).toBe(2); // Root + nested
      expect(result.stats.nestedObjects).toBe(1);
      expect(result.stats.arrays).toBe(1);
      expect(result.stats.dateFields).toBe(1);
    });
  });

  describe("isValidJson", () => {
    it("should return true for valid JSON", () => {
      expect(isValidJson('{"name": "test"}')).toBe(true);
      expect(isValidJson("[1, 2, 3]")).toBe(true);
      expect(isValidJson('"string"')).toBe(true);
    });

    it("should return false for invalid JSON", () => {
      expect(isValidJson("{invalid}")).toBe(false);
      expect(isValidJson("not json")).toBe(false);
      expect(isValidJson("{name: 'test'}")).toBe(false); // single quotes
    });
  });

  describe("formatJson", () => {
    it("should format minified JSON", () => {
      const result = formatJson('{"name":"test","age":25}');

      expect(result).toContain("\n");
      expect(result).toContain("  ");
    });

    it("should return original string for invalid JSON", () => {
      const invalid = "not json";
      expect(formatJson(invalid)).toBe(invalid);
    });
  });

  describe("EXAMPLE_JSON", () => {
    it("should be valid JSON", () => {
      expect(isValidJson(EXAMPLE_JSON)).toBe(true);
    });

    it("should contain expected fields", () => {
      const parsed = JSON.parse(EXAMPLE_JSON);
      expect(parsed.id).toBeDefined();
      expect(parsed.name).toBeDefined();
      expect(parsed.profile).toBeDefined();
      expect(parsed.createdAt).toBeDefined();
    });
  });

  describe("Mapper generation", () => {
    it("should generate date conversion in mapper", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        detectDates: true,
        generateMappers: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile!.content).toContain("new Date(dto.createdAt)");
      expect(mapperFile!.content).toContain(".toISOString()");
    });

    it("should generate array mapping in mapper", () => {
      const json = '{"items": [{"id": 1}]}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Response",
        generateMappers: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile!.content).toContain(".map(");
    });
  });

  describe("Naming convention branches", () => {
    it("should generate code with snake_case naming", () => {
      const json = '{"firstName": "John", "lastName": "Doe"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        naming: "snake_case",
        rootName: "User",
      });

      const interfaceFile = result.files.find((f) => f.type === "interface");
      expect(interfaceFile).toBeDefined();
      expect(interfaceFile!.content).toContain("first_name");
    });

    it("should generate code with PascalCase naming", () => {
      const json = '{"first_name": "John"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        naming: "PascalCase",
        rootName: "User",
      });

      const interfaceFile = result.files.find((f) => f.type === "interface");
      expect(interfaceFile).toBeDefined();
      expect(interfaceFile!.content).toContain("User");
    });

    it("should generate code with camelCase naming (default)", () => {
      const json = '{"user_name": "John"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        naming: "camelCase",
        rootName: "User",
      });

      const interfaceFile = result.files.find((f) => f.type === "interface");
      expect(interfaceFile).toBeDefined();
      expect(interfaceFile!.content).toBeTruthy();
    });
  });

  describe("toSnakeCase conversion", () => {
    it("should convert camelCase to snake_case in fields", () => {
      const json = '{"camelCaseField": "value", "anotherField": 123}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        naming: "snake_case",
        rootName: "Test",
      });

      const interfaceFile = result.files.find((f) => f.type === "interface");
      expect(interfaceFile).toBeDefined();
      expect(interfaceFile!.content).toContain("camel_case_field");
      expect(interfaceFile!.content).toContain("another_field");
    });
  });
});
