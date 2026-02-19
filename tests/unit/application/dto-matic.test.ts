import { describe, it, expect } from "vitest";
import {
  parseJson,
  generateCode,
  isValidJson,
  formatJson,
  generateMockData,
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

  describe("parseJson - uncovered branches", () => {
    it("should produce null type for a null field value", () => {
      const result = parseJson('{"deletedAt": null}');

      expect(result.fields[0]!.type).toBe("null");
      expect(result.fields[0]!.isOptional).toBe(true);
    });

    it("should produce Record<string, unknown> for an empty nested object", () => {
      const json = '{"metadata": {}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Item",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile).toBeDefined();
      expect(dtoFile!.content).toContain("Record<string, unknown>");
    });

    it("should produce Type[] for an array of objects", () => {
      const json = '{"users": [{"name": "Alice"}, {"name": "Bob"}]}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Response",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile).toBeDefined();
      // The array of objects should produce a nested interface name with []
      expect(dtoFile!.content).toContain("ResponseDtoUsers[]");
    });

    it("should use Date type in Entity when detectDates is true in clean-arch mode", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z", "updatedAt": "2024-06-01"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Event",
        detectDates: true,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile).toBeDefined();
      expect(entityFile!.content).toContain("Date");

      // DTO should keep string type (not Date)
      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile).toBeDefined();
      expect(dtoFile!.content).toContain("string");
    });

    it("should use string type in both DTO and Entity when detectDates is false", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Event",
        detectDates: false,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile).toBeDefined();
      // With detectDates false, entity should NOT use Date
      expect(entityFile!.content).not.toContain("Date");
      expect(entityFile!.content).toContain("string");

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile).toBeDefined();
      expect(dtoFile!.content).toContain("string");
    });

    it("should handle an empty array at root", () => {
      const result = parseJson("[]");

      expect(result.rootType).toBe("array");
      expect(result.fields.length).toBe(0);
    });

    it("should handle an array of primitives at root", () => {
      const result = parseJson("[1, 2, 3]");

      expect(result.rootType).toBe("array");
      expect(result.fields.length).toBe(0);
    });

    it("should handle empty arrays within objects", () => {
      const result = parseJson('{"tags": []}');

      expect(result.fields[0]!.isArray).toBe(true);
      expect(result.fields[0]!.type).toBe("unknown");
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

  describe("Java generator", () => {
    it("should generate Java class with Lombok annotations", () => {
      const json = '{"name": "John", "age": 30, "active": true}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "java",
        rootName: "User",
      });

      const javaFile = result.files.find((f) => f.language === "java");
      expect(javaFile).toBeDefined();
      expect(javaFile!.name).toBe("User.java");
      expect(javaFile!.content).toContain("package com.example.dto;");
      expect(javaFile!.content).toContain("@Data");
      expect(javaFile!.content).toContain("public class User");
      expect(javaFile!.content).toContain("private String name;");
      expect(javaFile!.content).toContain("private Integer age;");
      expect(javaFile!.content).toContain("private Boolean active;");
    });

    it("should use custom package name", () => {
      const json = '{"id": 1}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "java",
        rootName: "Item",
        javaPackage: "com.myapp.models",
      });

      const javaFile = result.files.find((f) => f.language === "java");
      expect(javaFile!.content).toContain("package com.myapp.models;");
    });

    it("should handle date and object field types in Java", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z", "meta": {}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "java",
        rootName: "Event",
      });

      const javaFile = result.files.find((f) => f.language === "java");
      expect(javaFile!.content).toContain("private LocalDateTime createdAt;");
      expect(javaFile!.content).toContain("private Object meta;");
    });

    it("should handle null field type in Java", () => {
      const json = '{"data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "java",
        rootName: "Response",
      });

      const javaFile = result.files.find((f) => f.language === "java");
      expect(javaFile!.content).toContain("private Object data;");
    });
  });

  describe("C# generator", () => {
    it("should generate C# class with properties", () => {
      const json = '{"name": "John", "age": 30, "active": true}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "csharp",
        rootName: "User",
      });

      const csFile = result.files.find((f) => f.language === "csharp");
      expect(csFile).toBeDefined();
      expect(csFile!.name).toBe("User.cs");
      expect(csFile!.content).toContain("namespace App.Domain.Models");
      expect(csFile!.content).toContain("public class User");
      expect(csFile!.content).toContain("public string Name { get; set; }");
      expect(csFile!.content).toContain("public int Age { get; set; }");
      expect(csFile!.content).toContain("public bool Active { get; set; }");
    });

    it("should use custom namespace", () => {
      const json = '{"id": 1}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "csharp",
        rootName: "Item",
        csharpNamespace: "MyApp.Core.Entities",
      });

      const csFile = result.files.find((f) => f.language === "csharp");
      expect(csFile!.content).toContain("namespace MyApp.Core.Entities");
    });

    it("should map date fields to DateTime in C#", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "csharp",
        rootName: "Event",
      });

      const csFile = result.files.find((f) => f.language === "csharp");
      expect(csFile!.content).toContain("public DateTime CreatedAt { get; set; }");
    });

    it("should handle unknown/null types as object in C#", () => {
      const json = '{"data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "csharp",
        rootName: "Response",
      });

      const csFile = result.files.find((f) => f.language === "csharp");
      expect(csFile!.content).toContain("public object Data { get; set; }");
    });
  });

  describe("Go generator", () => {
    it("should generate Go struct with json tags", () => {
      const json = '{"name": "John", "age": 30, "active": true}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "go",
        rootName: "User",
      });

      const goFile = result.files.find((f) => f.language === "go");
      expect(goFile).toBeDefined();
      expect(goFile!.name).toBe("user.go");
      expect(goFile!.content).toContain("package models");
      expect(goFile!.content).toContain("type User struct");
      expect(goFile!.content).toContain('Name string `json:"name"`');
      expect(goFile!.content).toContain('Age int `json:"age"`');
      expect(goFile!.content).toContain('Active bool `json:"active"`');
    });

    it("should use custom package name", () => {
      const json = '{"id": 1}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "go",
        rootName: "Item",
        goPackage: "entities",
      });

      const goFile = result.files.find((f) => f.language === "go");
      expect(goFile!.content).toContain("package entities");
    });

    it("should handle date and unknown types in Go", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z", "meta": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "go",
        rootName: "Event",
      });

      const goFile = result.files.find((f) => f.language === "go");
      expect(goFile!.content).toContain("time.Time");
      expect(goFile!.content).toContain("interface{}");
    });
  });

  describe("Python generator", () => {
    it("should generate Python Pydantic model", () => {
      const json = '{"name": "John", "age": 30, "active": true}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "python",
        rootName: "User",
      });

      const pyFile = result.files.find((f) => f.language === "python");
      expect(pyFile).toBeDefined();
      expect(pyFile!.name).toBe("user.py");
      expect(pyFile!.content).toContain("from pydantic import BaseModel");
      expect(pyFile!.content).toContain("class User(BaseModel):");
      expect(pyFile!.content).toContain("name: str");
      expect(pyFile!.content).toContain("age: int");
      expect(pyFile!.content).toContain("active: bool");
    });

    it("should handle date and unknown types in Python", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z", "data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        targetLanguage: "python",
        rootName: "Event",
      });

      const pyFile = result.files.find((f) => f.language === "python");
      expect(pyFile!.content).toContain("created_at: datetime");
      expect(pyFile!.content).toContain("from datetime import datetime");
    });
  });

  describe("Semantic type detection", () => {
    it("should detect UUID fields", () => {
      const result = parseJson('{"userId": "550e8400-e29b-41d4-a716-446655440000"}');
      expect(result.fields[0]!.semanticType).toBe("uuid");
    });

    it("should detect email fields", () => {
      const result = parseJson('{"email": "test@example.com"}');
      expect(result.fields[0]!.semanticType).toBe("email");
    });

    it("should detect URL fields", () => {
      const result = parseJson('{"website": "https://example.com"}');
      expect(result.fields[0]!.semanticType).toBe("url");
    });

    it("should detect IPv4 fields", () => {
      const result = parseJson('{"ip": "192.168.1.1"}');
      expect(result.fields[0]!.semanticType).toBe("ipv4");
    });

    it("should not detect semantic type for regular strings", () => {
      const result = parseJson('{"name": "John"}');
      expect(result.fields[0]!.semanticType).toBe("none");
    });

    it("should not set semantic type for date strings", () => {
      const result = parseJson('{"created": "2024-01-15T10:30:00Z"}');
      expect(result.fields[0]!.isDate).toBe(true);
      // Date strings don't go through semantic type detection
      expect(result.fields[0]!.type).toBe("date");
    });
  });

  describe("Date detection patterns", () => {
    it("should detect ISO 8601 dates", () => {
      const result = parseJson('{"d": "2024-01-15T10:30:00Z"}');
      expect(result.fields[0]!.isDate).toBe(true);
    });

    it("should detect YYYY-MM-DD dates", () => {
      const result = parseJson('{"d": "2024-01-15"}');
      expect(result.fields[0]!.isDate).toBe(true);
    });

    it("should detect DD/MM/YYYY dates", () => {
      const result = parseJson('{"d": "15/01/2024"}');
      expect(result.fields[0]!.isDate).toBe(true);
    });

    it("should detect YYYY/MM/DD dates", () => {
      const result = parseJson('{"d": "2024/01/15"}');
      expect(result.fields[0]!.isDate).toBe(true);
    });

    it("should not detect short strings as dates", () => {
      const result = parseJson('{"d": "hi"}');
      expect(result.fields[0]!.isDate).toBe(false);
    });

    it("should not detect very long strings as dates", () => {
      const result = parseJson('{"d": "this is a very long string that is not a date at all whatsoever"}');
      expect(result.fields[0]!.isDate).toBe(false);
    });
  });

  describe("Zod schema generation", () => {
    it("should generate Zod schema with all field types", () => {
      const json = '{"name": "John", "age": 30, "active": true, "data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
        generateZod: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile).toBeDefined();
      expect(zodFile!.content).toContain("z.string()");
      expect(zodFile!.content).toContain("z.number()");
      expect(zodFile!.content).toContain("z.boolean()");
      expect(zodFile!.content).toContain("z.null()");
    });

    it("should generate Zod datetime for date fields when detectDates is true", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Event",
        generateZod: true,
        detectDates: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain("z.string().datetime()");
    });

    it("should generate Zod string for date fields when detectDates is false", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Event",
        generateZod: true,
        detectDates: false,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain("z.string(),");
    });

    it("should generate nested Zod object for object fields with children", () => {
      const json = '{"profile": {"name": "John", "age": 30}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
        generateZod: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain("z.object(");
    });

    it("should generate z.record for empty object fields", () => {
      const json = '{"metadata": {}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Item",
        generateZod: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain("z.record(z.unknown())");
    });

    it("should generate z.unknown for unknown field types", () => {
      const json = '{"tags": []}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Item",
        generateZod: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain("z.unknown()");
    });

    it("should mark optional fields in Zod schema", () => {
      const json = '{"data": null}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Response",
        generateZod: true,
        optionalFields: true,
      });

      const zodFile = result.files.find((f) => f.type === "zod");
      expect(zodFile!.content).toContain(".optional()");
    });
  });

  describe("Mapper generation - additional branches", () => {
    it("should generate nested object mapper calls", () => {
      const json = '{"profile": {"name": "John"}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        generateMappers: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile).toBeDefined();
      expect(mapperFile!.content).toContain("ToDomain");
      expect(mapperFile!.content).toContain("ToDto");
    });

    it("should generate date array mapping in mapper", () => {
      const json = '{"dates": ["2024-01-15T10:30:00Z", "2024-02-20T08:00:00Z"]}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Schedule",
        generateMappers: true,
        detectDates: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile!.content).toContain(".map(d => new Date(d))");
      expect(mapperFile!.content).toContain(".map(d => d.toISOString())");
    });

    it("should generate array of nested object mapping", () => {
      const json = '{"items": [{"id": 1, "name": "test"}]}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Response",
        generateMappers: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile!.content).toContain(".map(response");
    });

    it("should generate simple field mapping for plain fields", () => {
      const json = '{"name": "John", "age": 30}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        generateMappers: true,
      });

      const mapperFile = result.files.find((f) => f.type === "mapper");
      expect(mapperFile!.content).toContain("dto.name");
      expect(mapperFile!.content).toContain("entity.name");
    });
  });

  describe("Entity generation - additional branches", () => {
    it("should handle nested objects with children in entity", () => {
      const json = '{"address": {"street": "123 Main St", "city": "NYC"}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        readonlyEntities: true,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile).toBeDefined();
      expect(entityFile!.content).toContain("UserAddress");
      expect(entityFile!.content).toContain("readonly");
    });

    it("should handle empty nested object in entity", () => {
      const json = '{"metadata": {}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Item",
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile!.content).toContain("Record<string, unknown>");
    });

    it("should handle array type in entity", () => {
      const json = '{"tags": ["a", "b"]}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Post",
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile!.content).toContain("string[]");
    });

    it("should use string for date when detectDates is false in entity", () => {
      const json = '{"createdAt": "2024-01-15T10:30:00Z"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Event",
        detectDates: false,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile!.content).toContain("string");
      expect(entityFile!.content).not.toContain("Date");
    });

    it("should handle null, boolean, and unknown types in entity", () => {
      const json = '{"data": null, "active": true, "tags": []}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "Item",
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile!.content).toContain("null");
      expect(entityFile!.content).toContain("boolean");
      expect(entityFile!.content).toContain("unknown");
    });
  });

  describe("DTO interface generation - additional branches", () => {
    it("should handle arrays of unknown type in DTO", () => {
      const json = '{"items": []}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "Response",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("unknown[]");
    });

    it("should handle boolean type in DTO", () => {
      const json = '{"active": true}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).toContain("boolean");
    });

    it("should not export types when exportTypes is false", () => {
      const json = '{"name": "John"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        rootName: "User",
        exportTypes: false,
      });

      const dtoFile = result.files.find((f) => f.type === "interface");
      expect(dtoFile!.content).not.toMatch(/^export interface/m);
    });
  });

  describe("generateMockData", () => {
    it("should generate a single mock item by default", () => {
      const parsed = parseJson('{"name": "John", "age": 30}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(mock).toBeDefined();
      expect(typeof mock["name"]).toBe("string");
      expect(typeof mock["age"]).toBe("number");
    });

    it("should generate multiple mock items when count > 1", () => {
      const parsed = parseJson('{"id": 1}');
      const mocks = generateMockData(parsed.fields, 3) as Record<string, unknown>[];
      expect(Array.isArray(mocks)).toBe(true);
      expect(mocks.length).toBe(3);
    });

    it("should generate mock data for nested objects", () => {
      const parsed = parseJson('{"profile": {"name": "John"}}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(typeof mock["profile"]).toBe("object");
    });

    it("should generate mock data for arrays of objects", () => {
      const parsed = parseJson('{"users": [{"id": 1, "name": "John"}]}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(Array.isArray(mock["users"])).toBe(true);
    });

    it("should generate mock data for arrays of primitives", () => {
      const parsed = parseJson('{"tags": ["a", "b"]}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(Array.isArray(mock["tags"])).toBe(true);
    });

    it("should generate UUIDs for fields with uuid semantic type", () => {
      const parsed = parseJson('{"userId": "550e8400-e29b-41d4-a716-446655440000"}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(typeof mock["userId"]).toBe("string");
      expect(String(mock["userId"])).toMatch(/^550e8400/);
    });

    it("should generate emails for email fields", () => {
      const parsed = parseJson('{"email": "test@example.com"}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(String(mock["email"])).toContain("@example.com");
    });

    it("should generate URLs for url fields", () => {
      const parsed = parseJson('{"website": "https://example.com"}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(String(mock["website"])).toContain("https://example.com");
    });

    it("should generate dates for date fields", () => {
      const parsed = parseJson('{"createdAt": "2024-01-15T10:30:00Z"}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(typeof mock["createdAt"]).toBe("string");
    });

    it("should generate booleans for boolean fields", () => {
      const parsed = parseJson('{"active": true}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(typeof mock["active"]).toBe("boolean");
    });

    it("should generate null for null-type fields", () => {
      const parsed = parseJson('{"data": null}');
      // Run multiple times since optional fields have 20% skip chance
      let gotNull = false;
      for (let i = 0; i < 20; i++) {
        const mock = generateMockData(parsed.fields) as Record<string, unknown>;
        if (mock["data"] === null || mock["data"] === undefined) {
          gotNull = true;
          break;
        }
      }
      expect(gotNull).toBe(true);
    });

    it("should generate smart values based on field name hints", () => {
      const parsed = parseJson('{"title": "Some Title", "description": "Some desc", "price": 99.99, "count": 5}');
      const mock = generateMockData(parsed.fields) as Record<string, unknown>;
      expect(typeof mock["title"]).toBe("string");
      expect(typeof mock["description"]).toBe("string");
      expect(typeof mock["price"]).toBe("number");
      expect(typeof mock["count"]).toBe("number");
    });
  });

  describe("Index file generation", () => {
    it("should not generate index file when only one file is produced", () => {
      const json = '{"name": "test"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "quick",
        rootName: "Simple",
        generateZod: false,
      });

      const indexFile = result.files.find((f) => f.type === "index");
      expect(indexFile).toBeUndefined();
    });

    it("should exclude index file from its own exports", () => {
      const json = '{"name": "test"}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
      });

      const indexFile = result.files.find((f) => f.type === "index");
      expect(indexFile).toBeDefined();
      expect(indexFile!.content).not.toContain("index");
    });
  });

  describe("Nested entity generation with readonly and detectDates", () => {
    it("should generate nested entity with readonly and Date type", () => {
      const json = '{"profile": {"updatedAt": "2024-06-01T00:00:00Z", "bio": "hello"}}';
      const result = generateCode(json, {
        ...DEFAULT_CONFIG,
        mode: "clean-arch",
        rootName: "User",
        readonlyEntities: true,
        detectDates: true,
      });

      const entityFile = result.files.find((f) => f.type === "entity");
      expect(entityFile).toBeDefined();
      expect(entityFile!.content).toContain("readonly");
      expect(entityFile!.content).toContain("Date");
    });
  });
});
