// DTO-Matic Types
// Converts JSON to TypeScript Interface + Mapper + Entity

export type GenerationMode = "quick" | "clean-arch" | "zod";

export type TargetLanguage = "typescript" | "java" | "csharp" | "go" | "python";

export type NamingConvention = "camelCase" | "PascalCase" | "snake_case";

export interface DtoMaticConfig {
  mode: GenerationMode;
  targetLanguage: TargetLanguage;
  rootName: string;
  naming: NamingConvention;
  optionalFields: boolean;
  detectDates: boolean;
  detectSemanticTypes: boolean;
  exportTypes: boolean;
  readonlyEntities: boolean;
  generateMappers: boolean;
  generateZod: boolean;
  javaPackage?: string;
  csharpNamespace?: string;
  goPackage?: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  type: "interface" | "entity" | "mapper" | "zod" | "index" | "class" | "struct" | "record";
  content: string;
  language: TargetLanguage;
}

export interface GenerationResult {
  id: string;
  inputJson: string;
  config: DtoMaticConfig;
  files: GeneratedFile[];
  stats: GenerationStats;
  generatedAt: string;
}

export interface GenerationStats {
  totalTypes: number;
  nestedObjects: number;
  arrays: number;
  optionalFields: number;
  dateFields: number;
}

export interface JsonField {
  name: string;
  type: JsonFieldType;
  isOptional: boolean;
  isArray: boolean;
  isDate: boolean;
  isFloat?: boolean;
  semanticType?: "uuid" | "email" | "url" | "ipv4" | "none";
  children?: JsonField[];
  originalValue: unknown;
}

export type JsonFieldType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array"
  | "date"
  | "unknown";

export interface ParsedJson {
  fields: JsonField[];
  rootType: "object" | "array";
}

export const DEFAULT_CONFIG: DtoMaticConfig = {
  mode: "clean-arch",
  targetLanguage: "typescript",
  rootName: "Data",
  naming: "camelCase",
  optionalFields: true,
  detectDates: true,
  detectSemanticTypes: true,
  exportTypes: true,
  readonlyEntities: true,
  generateMappers: true,
  generateZod: false,
  javaPackage: "com.example.dto",
  csharpNamespace: "App.Domain.Models",
  goPackage: "models",
};
