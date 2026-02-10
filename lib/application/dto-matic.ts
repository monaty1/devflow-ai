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

  // String (check for date)
  if (typeof value === "string") {
    const isDate = isDateString(value);
    return {
      name,
      type: isDate ? "date" : "string",
      isOptional: false,
      isArray: false,
      isDate,
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

  // Generate DTO Interface
  const dtoContent = generateInterface(
    parsed.fields,
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
    const entityContent = generateEntity(parsed.fields, rootName, config);
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
        parsed.fields,
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
    const zodContent = generateZodSchema(parsed.fields, rootName, config);
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

  return {
    id: crypto.randomUUID(),
    inputJson: jsonString,
    config,
    files,
    stats,
    generatedAt: new Date().toISOString(),
  };
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
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
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
