// DTO-Matic: JSON to TypeScript Converter
// Generates Interfaces, Entities, and Mappers following Clean Architecture

import type {
  DtoMaticConfig,
  GeneratedFile,
  GenerationResult,
  GenerationStats,
  JsonField,
  JsonFieldType,
  ParsedJson,
  NamingConvention,
} from "@/types/dto-matic";

// --- JSON Parsing ---

export function parseJson(jsonString: string): ParsedJson {
  const parsed = JSON.parse(jsonString);

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { fields: [], rootType: "array" };
    }
    // Use first element as schema
    const firstElement = parsed[0];
    if (typeof firstElement === "object" && firstElement !== null) {
      return {
        fields: extractFields(firstElement as Record<string, unknown>),
        rootType: "array",
      };
    }
    return { fields: [], rootType: "array" };
  }

  if (typeof parsed === "object" && parsed !== null) {
    return {
      fields: extractFields(parsed as Record<string, unknown>),
      rootType: "object",
    };
  }

  throw new Error("El JSON debe ser un objeto o un array de objetos");
}

function extractFields(obj: Record<string, unknown>): JsonField[] {
  const fields: JsonField[] = [];

  for (const [key, value] of Object.entries(obj)) {
    fields.push(analyzeValue(key, value));
  }

  return fields;
}

function analyzeValue(name: string, value: unknown): JsonField {
  // Null
  if (value === null) {
    return {
      name,
      type: "null",
      isOptional: true,
      isArray: false,
      isDate: false,
      originalValue: value,
    };
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        name,
        type: "unknown",
        isOptional: false,
        isArray: true,
        isDate: false,
        originalValue: value,
      };
    }

    const firstElement = value[0];
    const elementAnalysis = analyzeValue("item", firstElement);

    const result: JsonField = {
      name,
      type: elementAnalysis.type,
      isOptional: false,
      isArray: true,
      isDate: elementAnalysis.isDate,
      originalValue: value,
    };

    if (elementAnalysis.children) {
      result.children = elementAnalysis.children;
    }

    return result;
  }

  // Object
  if (typeof value === "object") {
    return {
      name,
      type: "object",
      isOptional: false,
      isArray: false,
      isDate: false,
      children: extractFields(value as Record<string, unknown>),
      originalValue: value,
    };
  }

  // String (check for date and semantic types)
  if (typeof value === "string") {
    const isDate = isDateString(value);
    let semanticType: JsonField["semanticType"] = "none";

    if (!isDate) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        semanticType = "uuid";
      } else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        semanticType = "email";
      } else if (/^https?:\/\//.test(value)) {
        semanticType = "url";
      } else if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
        semanticType = "ipv4";
      }
    }

    return {
      name,
      type: isDate ? "date" : "string",
      isOptional: false,
      isArray: false,
      isDate,
      semanticType,
      originalValue: value,
    };
  }

  // Number
  if (typeof value === "number") {
    return {
      name,
      type: "number",
      isOptional: false,
      isArray: false,
      isDate: false,
      isFloat: !Number.isInteger(value),
      originalValue: value,
    };
  }

  // Boolean
  if (typeof value === "boolean") {
    return {
      name,
      type: "boolean",
      isOptional: false,
      isArray: false,
      isDate: false,
      originalValue: value,
    };
  }

  return {
    name,
    type: "unknown",
    isOptional: true,
    isArray: false,
    isDate: false,
    originalValue: value,
  };
}

// Date patterns: ISO 8601, common formats
const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
  /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY or MM/DD/YYYY
  /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
];

function isDateString(value: string): boolean {
  if (value.length < 8 || value.length > 30) return false;
  return DATE_PATTERNS.some((pattern) => pattern.test(value));
}

// --- Code Generation ---

export function generateCode(
  jsonString: string,
  config: DtoMaticConfig
): GenerationResult {
  const parsed = parseJson(jsonString);
  const files: GeneratedFile[] = [];
  const stats = calculateStats(parsed.fields);
  const rootName = toPascalCase(config.rootName);

  switch (config.targetLanguage) {
    case "java":
      files.push(...generateJava(parsed.fields, rootName, config));
      break;
    case "csharp":
      files.push(...generateCSharp(parsed.fields, rootName, config));
      break;
    case "go":
      files.push(...generateGo(parsed.fields, rootName, config));
      break;
    case "python":
      files.push(...generatePython(parsed.fields, rootName, config));
      break;
    case "typescript":
    default:
      files.push(...generateTypeScript(parsed.fields, rootName, config));
      break;
  }

  return {
    id: crypto.randomUUID(),
    inputJson: jsonString,
    config,
    files,
    stats,
    generatedAt: new Date().toISOString(),
  };
}

// --- TypeScript Generator ---

function generateTypeScript(
  fields: JsonField[],
  rootName: string,
  config: DtoMaticConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  // Generate DTO Interface
  const dtoContent = generateInterface(
    fields,
    `${rootName}Dto`,
    config,
    true
  );
  files.push({
    id: crypto.randomUUID(),
    name: `${toKebabCase(rootName)}.dto.ts`,
    type: "interface",
    content: dtoContent,
    language: "typescript",
  });

  // Generate Entity (Clean Arch mode)
  if (config.mode === "clean-arch") {
    const entityContent = generateEntity(fields, rootName, config);
    files.push({
      id: crypto.randomUUID(),
      name: `${toKebabCase(rootName)}.entity.ts`,
      type: "entity",
      content: entityContent,
      language: "typescript",
    });

    // Generate Mapper
    if (config.generateMappers) {
      const mapperContent = generateMapper(
        fields,
        rootName,
        config
      );
      files.push({
        id: crypto.randomUUID(),
        name: `${toKebabCase(rootName)}.mapper.ts`,
        type: "mapper",
        content: mapperContent,
        language: "typescript",
      });
    }
  }

  // Generate Zod Schema
  if (config.generateZod) {
    const zodContent = generateZodSchema(fields, rootName, config);
    files.push({
      id: crypto.randomUUID(),
      name: `${toKebabCase(rootName)}.schema.ts`,
      type: "zod",
      content: zodContent,
      language: "typescript",
    });
  }

  // Generate index file
  if (files.length > 1) {
    const indexContent = generateIndexFile(files);
    files.push({
      id: crypto.randomUUID(),
      name: "index.ts",
      type: "index",
      content: indexContent,
      language: "typescript",
    });
  }

  return files;
}

// --- Java Generator ---

function generateJava(
  fields: JsonField[],
  rootName: string,
  config: DtoMaticConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const nestedClasses: { name: string; fields: JsonField[] }[] = [];
  collectNestedObjects(fields, rootName, nestedClasses);

  const packageName = config.javaPackage || "com.example.dto";

  // Generate root class
  files.push({
    id: crypto.randomUUID(),
    name: `${rootName}.java`,
    type: "class",
    content: buildJavaClass(rootName, fields, packageName, config),
    language: "java",
  });

  // Generate nested classes as separate files
  for (const nested of nestedClasses) {
    files.push({
      id: crypto.randomUUID(),
      name: `${nested.name}.java`,
      type: "class",
      content: buildJavaClass(nested.name, nested.fields, packageName, config),
      language: "java",
    });
  }

  return files;
}

function buildJavaClass(
  className: string,
  fields: JsonField[],
  packageName: string,
  config: DtoMaticConfig
): string {
  const hasDate = fields.some(f => f.type === "date");
  const hasList = fields.some(f => f.isArray);

  const imports = [
    "import lombok.Data;",
    "import lombok.NoArgsConstructor;",
    "import lombok.AllArgsConstructor;",
  ];
  if (hasList) imports.push("import java.util.List;");
  if (hasDate) imports.push("import java.time.LocalDateTime;");

  return `package ${packageName};

${imports.join("\n")}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${className} {
${generateJavaFields(fields, className, config)}
}
`;
}

function generateJavaFields(fields: JsonField[], parentName: string, _config: DtoMaticConfig): string {
  return fields.map(field => {
    const type = getJavaType(field, parentName);
    const name = applyNaming(field.name, "camelCase");
    return `    private ${type} ${name};`;
  }).join("\n");
}

function getJavaType(field: JsonField, parentName: string): string {
  let baseType: string;

  switch (field.type) {
    case "string": baseType = "String"; break;
    case "number": baseType = field.isFloat ? "Double" : "Integer"; break;
    case "boolean": baseType = "Boolean"; break;
    case "date": baseType = "LocalDateTime"; break;
    case "object":
      baseType = (field.children && field.children.length > 0)
        ? `${parentName}${toPascalCase(field.name)}`
        : "Object";
      break;
    default: baseType = "Object";
  }

  return field.isArray ? `List<${baseType}>` : baseType;
}

// --- C# Generator ---

function generateCSharp(
  fields: JsonField[],
  rootName: string,
  config: DtoMaticConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const nestedClasses: { name: string; fields: JsonField[] }[] = [];
  collectNestedObjects(fields, rootName, nestedClasses);

  const namespace = config.csharpNamespace || "App.Domain.Models";

  // Generate root class
  files.push({
    id: crypto.randomUUID(),
    name: `${rootName}.cs`,
    type: "class",
    content: buildCSharpClass(rootName, fields, namespace, config),
    language: "csharp",
  });

  // Generate nested classes as separate files
  for (const nested of nestedClasses) {
    files.push({
      id: crypto.randomUUID(),
      name: `${nested.name}.cs`,
      type: "class",
      content: buildCSharpClass(nested.name, nested.fields, namespace, config),
      language: "csharp",
    });
  }

  return files;
}

function buildCSharpClass(
  className: string,
  fields: JsonField[],
  namespace: string,
  config: DtoMaticConfig
): string {
  return `using System;
using System.Collections.Generic;

namespace ${namespace}
{
    public class ${className}
    {
${generateCSharpFields(fields, className, config)}
    }
}
`;
}

function generateCSharpFields(fields: JsonField[], parentName: string, _config: DtoMaticConfig): string {
  return fields.map(field => {
    const type = getCSharpType(field, parentName);
    const name = applyNaming(field.name, "PascalCase");
    return `        public ${type} ${name} { get; set; }`;
  }).join("\n");
}

function getCSharpType(field: JsonField, parentName: string): string {
  let baseType: string;

  switch (field.type) {
    case "string": baseType = "string"; break;
    case "number": baseType = field.isFloat ? "double" : "int"; break;
    case "boolean": baseType = "bool"; break;
    case "date": baseType = "DateTime"; break;
    case "object":
      baseType = (field.children && field.children.length > 0)
        ? `${parentName}${toPascalCase(field.name)}`
        : "object";
      break;
    default: baseType = "object";
  }

  return field.isArray ? `List<${baseType}>` : baseType;
}

// --- Go Generator ---

function generateGo(
  fields: JsonField[],
  rootName: string,
  config: DtoMaticConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const nestedStructs: { name: string; fields: JsonField[] }[] = [];
  collectNestedObjects(fields, rootName, nestedStructs);

  const packageName = config.goPackage || "models";

  // Build all structs in one file (Go convention)
  const allStructs: string[] = [];
  allStructs.push(buildGoStruct(rootName, fields));
  for (const nested of nestedStructs) {
    allStructs.push(buildGoStruct(nested.name, nested.fields));
  }

  const hasTime = fields.some(f => f.type === "date") ||
    nestedStructs.some(n => n.fields.some(f => f.type === "date"));
  const imports = hasTime ? '\nimport "time"\n' : "";

  const content = `package ${packageName}
${imports}
${allStructs.join("\n\n")}
`;

  files.push({
    id: crypto.randomUUID(),
    name: `${toSnakeCase(rootName)}.go`,
    type: "struct",
    content,
    language: "go",
  });

  return files;
}

function buildGoStruct(structName: string, fields: JsonField[]): string {
  const goFields = fields.map(field => {
    const type = getGoType(field, structName);
    const name = applyNaming(field.name, "PascalCase");
    const jsonTag = field.name;
    return `\t${name} ${type} \`json:"${jsonTag}"\``;
  }).join("\n");

  return `type ${structName} struct {\n${goFields}\n}`;
}

function getGoType(field: JsonField, parentName: string): string {
  let baseType: string;

  switch (field.type) {
    case "string": baseType = "string"; break;
    case "number": baseType = field.isFloat ? "float64" : "int"; break;
    case "boolean": baseType = "bool"; break;
    case "date": baseType = "time.Time"; break;
    case "object":
      baseType = (field.children && field.children.length > 0)
        ? `${parentName}${toPascalCase(field.name)}`
        : "interface{}";
      break;
    default: baseType = "interface{}";
  }

  return field.isArray ? `[]${baseType}` : baseType;
}

// --- Python Generator ---

function generatePython(
  fields: JsonField[],
  rootName: string,
  config: DtoMaticConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const nestedModels: { name: string; fields: JsonField[] }[] = [];
  collectNestedObjects(fields, rootName, nestedModels);

  // Build all models in one file (nested models first so forward refs are resolved)
  const allModels: string[] = [];
  for (const nested of nestedModels) {
    allModels.push(buildPythonModel(nested.name, nested.fields, config));
  }
  allModels.push(buildPythonModel(rootName, fields, config));

  const hasDate = fields.some(f => f.type === "date") ||
    nestedModels.some(n => n.fields.some(f => f.type === "date"));
  const dateImport = hasDate ? "\nfrom datetime import datetime" : "";

  const content = `from pydantic import BaseModel
from typing import List, Optional${dateImport}

${allModels.join("\n\n")}
`;

  files.push({
    id: crypto.randomUUID(),
    name: `${toSnakeCase(rootName)}.py`,
    type: "class",
    content,
    language: "python",
  });

  return files;
}

function buildPythonModel(className: string, fields: JsonField[], _config: DtoMaticConfig): string {
  const pyFields = fields.map(field => {
    const type = getPythonType(field, className);
    const name = applyNaming(field.name, "snake_case");
    const optional = field.isOptional ? `Optional[${type}]` : type;
    return `    ${name}: ${field.isOptional ? optional : type}`;
  }).join("\n");

  return `class ${className}(BaseModel):\n${pyFields || "    pass"}`;
}

function getPythonType(field: JsonField, parentName: string): string {
  let baseType: string;

  switch (field.type) {
    case "string": baseType = "str"; break;
    case "number": baseType = field.isFloat ? "float" : "int"; break;
    case "boolean": baseType = "bool"; break;
    case "date": baseType = "datetime"; break;
    case "object":
      baseType = (field.children && field.children.length > 0)
        ? `${parentName}${toPascalCase(field.name)}`
        : "Any";
      break;
    default: baseType = "Any";
  }

  return field.isArray ? `List[${baseType}]` : baseType;
}

function generateInterface(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig,
  isRoot: boolean
): string {
  const lines: string[] = [];
  const nestedInterfaces: string[] = [];

  if (isRoot) {
    lines.push("// Generated by DTO-Matic");
    lines.push("// https://devflowai.vercel.app/tools/dto-matic");
    lines.push("");
  }

  const exportKeyword = config.exportTypes ? "export " : "";
  lines.push(`${exportKeyword}interface ${name} {`);

  for (const field of fields) {
    const fieldName = applyNaming(field.name, config.naming);
    const optional = field.isOptional && config.optionalFields ? "?" : "";
    const tsType = getTsType(field, name, config, nestedInterfaces);

    lines.push(`  ${fieldName}${optional}: ${tsType};`);
  }

  lines.push("}");

  // Add nested interfaces at the end
  if (nestedInterfaces.length > 0) {
    lines.push("");
    lines.push(nestedInterfaces.join("\n\n"));
  }

  return lines.join("\n");
}

function generateEntity(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig
): string {
  const lines: string[] = [];
  const nestedEntities: string[] = [];

  lines.push("// Generated by DTO-Matic");
  lines.push("// Domain Entity - Clean Architecture");
  lines.push("");

  const exportKeyword = config.exportTypes ? "export " : "";
  const readonlyMod = config.readonlyEntities ? "readonly " : "";

  lines.push(`${exportKeyword}interface ${name} {`);

  for (const field of fields) {
    const fieldName = applyNaming(field.name, "camelCase"); // Entities always use camelCase
    const optional = field.isOptional && config.optionalFields ? "?" : "";
    const tsType = getEntityType(field, name, config, nestedEntities);

    lines.push(`  ${readonlyMod}${fieldName}${optional}: ${tsType};`);
  }

  lines.push("}");

  if (nestedEntities.length > 0) {
    lines.push("");
    lines.push(nestedEntities.join("\n\n"));
  }

  return lines.join("\n");
}

function generateMapper(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig
): string {
  const lines: string[] = [];
  const dtoName = `${name}Dto`;

  lines.push("// Generated by DTO-Matic");
  lines.push("// Mapper: DTO -> Entity");
  lines.push("");
  lines.push(`import type { ${dtoName} } from "./${toKebabCase(name)}.dto";`);
  lines.push(`import type { ${name} } from "./${toKebabCase(name)}.entity";`);
  lines.push("");

  // toDomain function
  lines.push(`export function ${toCamelCase(name)}ToDomain(dto: ${dtoName}): ${name} {`);
  lines.push("  return {");

  for (const field of fields) {
    const dtoField = applyNaming(field.name, config.naming);
    const entityField = applyNaming(field.name, "camelCase");
    const mapping = generateFieldMapping(field, dtoField, name, config);

    lines.push(`    ${entityField}: ${mapping},`);
  }

  lines.push("  };");
  lines.push("}");
  lines.push("");

  // toDto function
  lines.push(`export function ${toCamelCase(name)}ToDto(entity: ${name}): ${dtoName} {`);
  lines.push("  return {");

  for (const field of fields) {
    const dtoField = applyNaming(field.name, config.naming);
    const entityField = applyNaming(field.name, "camelCase");
    const mapping = generateReversedMapping(field, entityField, name, config);

    lines.push(`    ${dtoField}: ${mapping},`);
  }

  lines.push("  };");
  lines.push("}");

  return lines.join("\n");
}

function generateZodSchema(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig
): string {
  const lines: string[] = [];

  lines.push("// Generated by DTO-Matic");
  lines.push("// Zod Validation Schema");
  lines.push("");
  lines.push('import { z } from "zod";');
  lines.push("");

  const schemaName = `${toCamelCase(name)}Schema`;
  lines.push(`export const ${schemaName} = z.object({`);

  for (const field of fields) {
    const fieldName = applyNaming(field.name, config.naming);
    const zodType = getZodType(field, config);
    const optional = field.isOptional ? ".optional()" : "";

    lines.push(`  ${fieldName}: ${zodType}${optional},`);
  }

  lines.push("});");
  lines.push("");
  lines.push(`export type ${name}Validated = z.infer<typeof ${schemaName}>;`);

  return lines.join("\n");
}

function generateIndexFile(files: GeneratedFile[]): string {
  const lines: string[] = [];

  lines.push("// Generated by DTO-Matic");
  lines.push("// Barrel export file");
  lines.push("");

  for (const file of files) {
    if (file.type !== "index") {
      const fileName = file.name.replace(".ts", "");
      lines.push(`export * from "./${fileName}";`);
    }
  }

  return lines.join("\n");
}

// --- Type Helpers ---

function getTsType(
  field: JsonField,
  parentName: string,
  config: DtoMaticConfig,
  nestedInterfaces: string[]
): string {
  let baseType: string;

  switch (field.type) {
    case "string":
      baseType = "string";
      break;
    case "number":
      baseType = "number";
      break;
    case "boolean":
      baseType = "boolean";
      break;
    case "date":
      baseType = config.detectDates ? "string" : "string"; // DTOs keep dates as strings
      break;
    case "null":
      baseType = "null";
      break;
    case "object":
      if (field.children && field.children.length > 0) {
        const nestedName = `${parentName}${toPascalCase(field.name)}`;
        const nestedContent = generateNestedInterface(
          field.children,
          nestedName,
          config
        );
        nestedInterfaces.push(nestedContent);
        baseType = nestedName;
      } else {
        baseType = "Record<string, unknown>";
      }
      break;
    case "unknown":
    default:
      baseType = "unknown";
  }

  if (field.isArray) {
    return `${baseType}[]`;
  }

  return baseType;
}

function getEntityType(
  field: JsonField,
  parentName: string,
  config: DtoMaticConfig,
  nestedEntities: string[]
): string {
  let baseType: string;

  switch (field.type) {
    case "string":
      baseType = "string";
      break;
    case "number":
      baseType = "number";
      break;
    case "boolean":
      baseType = "boolean";
      break;
    case "date":
      baseType = config.detectDates ? "Date" : "string"; // Entities use Date objects
      break;
    case "null":
      baseType = "null";
      break;
    case "object":
      if (field.children && field.children.length > 0) {
        const nestedName = `${parentName}${toPascalCase(field.name)}`;
        const nestedContent = generateNestedEntity(
          field.children,
          nestedName,
          config
        );
        nestedEntities.push(nestedContent);
        baseType = nestedName;
      } else {
        baseType = "Record<string, unknown>";
      }
      break;
    case "unknown":
    default:
      baseType = "unknown";
  }

  if (field.isArray) {
    return `${baseType}[]`;
  }

  return baseType;
}

function getZodType(field: JsonField, config: DtoMaticConfig): string {
  switch (field.type) {
    case "string":
      return "z.string()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "date":
      return config.detectDates ? "z.string().datetime()" : "z.string()";
    case "null":
      return "z.null()";
    case "object":
      if (field.children && field.children.length > 0) {
        const nested = field.children
          .map((f) => {
            const name = applyNaming(f.name, config.naming);
            const type = getZodType(f, config);
            const opt = f.isOptional ? ".optional()" : "";
            return `${name}: ${type}${opt}`;
          })
          .join(", ");
        return `z.object({ ${nested} })`;
      }
      return "z.record(z.unknown())";
    case "unknown":
    default:
      return "z.unknown()";
  }
}

function generateNestedInterface(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig
): string {
  const lines: string[] = [];
  const exportKeyword = config.exportTypes ? "export " : "";

  lines.push(`${exportKeyword}interface ${name} {`);

  for (const field of fields) {
    const fieldName = applyNaming(field.name, config.naming);
    const optional = field.isOptional && config.optionalFields ? "?" : "";
    const tsType = getSimpleTsType(field);

    lines.push(`  ${fieldName}${optional}: ${tsType};`);
  }

  lines.push("}");

  return lines.join("\n");
}

function generateNestedEntity(
  fields: JsonField[],
  name: string,
  config: DtoMaticConfig
): string {
  const lines: string[] = [];
  const exportKeyword = config.exportTypes ? "export " : "";
  const readonlyMod = config.readonlyEntities ? "readonly " : "";

  lines.push(`${exportKeyword}interface ${name} {`);

  for (const field of fields) {
    const fieldName = applyNaming(field.name, "camelCase");
    const optional = field.isOptional && config.optionalFields ? "?" : "";
    const tsType = getSimpleEntityType(field, config);

    lines.push(`  ${readonlyMod}${fieldName}${optional}: ${tsType};`);
  }

  lines.push("}");

  return lines.join("\n");
}

function getSimpleTsType(field: JsonField): string {
  const typeMap: Record<JsonFieldType, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    date: "string",
    null: "null",
    object: "Record<string, unknown>",
    array: "unknown[]",
    unknown: "unknown",
  };

  const baseType = typeMap[field.type];
  return field.isArray ? `${baseType}[]` : baseType;
}

function getSimpleEntityType(field: JsonField, config: DtoMaticConfig): string {
  const typeMap: Record<JsonFieldType, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    date: config.detectDates ? "Date" : "string",
    null: "null",
    object: "Record<string, unknown>",
    array: "unknown[]",
    unknown: "unknown",
  };

  const baseType = typeMap[field.type];
  return field.isArray ? `${baseType}[]` : baseType;
}

function generateFieldMapping(
  field: JsonField,
  dtoField: string,
  parentName: string,
  config: DtoMaticConfig
): string {
  if (field.isDate && config.detectDates) {
    if (field.isArray) {
      return `dto.${dtoField}.map(d => new Date(d))`;
    }
    return `new Date(dto.${dtoField})`;
  }

  if (field.type === "object" && field.children && field.children.length > 0) {
    const nestedMapper = `${toCamelCase(parentName)}${toPascalCase(field.name)}ToDomain`;
    if (field.isArray) {
      return `dto.${dtoField}.map(${nestedMapper})`;
    }
    return `${nestedMapper}(dto.${dtoField})`;
  }

  return `dto.${dtoField}`;
}

function generateReversedMapping(
  field: JsonField,
  entityField: string,
  parentName: string,
  config: DtoMaticConfig
): string {
  if (field.isDate && config.detectDates) {
    if (field.isArray) {
      return `entity.${entityField}.map(d => d.toISOString())`;
    }
    return `entity.${entityField}.toISOString()`;
  }

  if (field.type === "object" && field.children && field.children.length > 0) {
    const nestedMapper = `${toCamelCase(parentName)}${toPascalCase(field.name)}ToDto`;
    if (field.isArray) {
      return `entity.${entityField}.map(${nestedMapper})`;
    }
    return `${nestedMapper}(entity.${entityField})`;
  }

  return `entity.${entityField}`;
}

// --- Nested Object Collection ---

/**
 * Recursively collects all nested object fields into a flat list of
 * { name, fields } pairs. Used by Java/C#/Go/Python generators to
 * produce separate class/struct definitions for nested objects.
 */
function collectNestedObjects(
  fields: JsonField[],
  parentName: string,
  result: { name: string; fields: JsonField[] }[]
): void {
  for (const field of fields) {
    if (field.type === "object" && field.children && field.children.length > 0) {
      const nestedName = `${parentName}${toPascalCase(field.name)}`;
      result.push({ name: nestedName, fields: field.children });
      collectNestedObjects(field.children, nestedName, result);
    }
    // Also handle arrays of objects
    if (field.isArray && field.type === "object" && field.children && field.children.length > 0) {
      const nestedName = `${parentName}${toPascalCase(field.name)}`;
      // Avoid duplicates if already collected by the object check above
      if (!result.some(r => r.name === nestedName)) {
        result.push({ name: nestedName, fields: field.children });
        collectNestedObjects(field.children, nestedName, result);
      }
    }
  }
}

// --- Naming Utilities ---

function applyNaming(name: string, convention: NamingConvention): string {
  switch (convention) {
    case "camelCase":
      return toCamelCase(name);
    case "PascalCase":
      return toPascalCase(name);
    case "snake_case":
      return toSnakeCase(name);
    default:
      return name;
  }
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_: string, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (c: string) => c.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

// --- Stats ---

function calculateStats(fields: JsonField[]): GenerationStats {
  let totalTypes = 1; // Root type
  let nestedObjects = 0;
  let arrays = 0;
  let optionalFields = 0;
  let dateFields = 0;

  function countFields(fieldList: JsonField[]): void {
    for (const field of fieldList) {
      if (field.isOptional) optionalFields++;
      if (field.isArray) arrays++;
      if (field.isDate) dateFields++;
      if (field.type === "object" && field.children) {
        nestedObjects++;
        totalTypes++;
        countFields(field.children);
      }
    }
  }

  countFields(fields);

  return {
    totalTypes,
    nestedObjects,
    arrays,
    optionalFields,
    dateFields,
  };
}

// --- Validation ---

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

// --- Mock Data Generation ---

export function generateMockData(fields: JsonField[], count: number = 1): unknown {
  function generateItem(fieldList: JsonField[]): Record<string, unknown> {
    const item: Record<string, unknown> = {};
    
    for (const field of fieldList) {
      if (field.isOptional && Math.random() > 0.8) continue; // 20% chance of undefined

      if (field.isArray) {
        // Generate array of 1-3 items
        if (field.type === "object" && field.children) {
          item[field.name] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => generateItem(field.children!));
        } else {
          item[field.name] = Array.from({ length: 3 }, () => generateValue(field));
        }
      } else if (field.type === "object" && field.children) {
        item[field.name] = generateItem(field.children);
      } else {
        item[field.name] = generateValue(field);
      }
    }
    
    return item;
  }

  const data = Array.from({ length: count }, () => generateItem(fields));
  return count === 1 ? data[0] : data;
}

function generateValue(field: JsonField): unknown {
  const name = field.name.toLowerCase();
  
  if (field.semanticType === "uuid" || name.includes("id") || name.includes("uuid")) {
    return "550e8400-e29b-41d4-a716-44665544" + Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  }
  
  if (field.semanticType === "email" || name.includes("email")) {
    return `user${Math.floor(Math.random() * 1000)}@example.com`;
  }
  
  if (field.semanticType === "url" || name.includes("url") || name.includes("link") || name.includes("avatar")) {
    return `https://example.com/resource/${Math.floor(Math.random() * 100)}`;
  }

  if (field.isDate || name.includes("date") || name.includes("at")) {
    return new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
  }

  if (field.type === "string") {
    if (name.includes("name")) return ["Alice", "Bob", "Charlie", "David"][Math.floor(Math.random() * 4)];
    if (name.includes("title")) return "Lorem Ipsum Dolor Sit Amet";
    if (name.includes("desc")) return "This is a sample description for testing purposes.";
    return "sample_string";
  }

  if (field.type === "number") {
    if (name.includes("age")) return Math.floor(Math.random() * 60) + 18;
    if (name.includes("price") || name.includes("cost")) return parseFloat((Math.random() * 100).toFixed(2));
    if (name.includes("count") || name.includes("total")) return Math.floor(Math.random() * 100);
    return Math.floor(Math.random() * 1000);
  }

  if (field.type === "boolean") {
    return Math.random() > 0.5;
  }

  return null;
}

// --- Example JSON ---

export const EXAMPLE_JSON = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "profile": {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software Developer",
    "socialLinks": ["twitter", "github"]
  },
  "roles": ["admin", "user"],
  "metadata": null
}`;
