// UUID Generator Types

export type UuidVersion = "v1" | "v4" | "v7" | "nil" | "max" | "ulid" | "nanoid";
export type UuidFormat = "standard" | "uppercase" | "no-hyphens" | "braces" | "urn" | "base64" | "base58";

export interface UuidConfig {
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
  exportFormat: "text" | "json" | "csv" | "sql";
  prefix: string;
}

export const DEFAULT_UUID_CONFIG: UuidConfig = {
  version: "v4",
  format: "standard",
  quantity: 1,
  exportFormat: "text",
  prefix: "",
};

export interface UuidResult {
  id: string;
  uuids: string[];
  version: UuidVersion;
  format: UuidFormat;
  timestamp: string;
  collisionStats?: CollisionStats;
}

export interface CollisionStats {
  attempts: number;
  collisions: number;
  probability: string;
}

export interface UuidValidation {
  isValid: boolean;
  version?: UuidVersion | "unknown";
  variant?: string;
  error?: string;
}

export interface BinaryPart {
  label: string;
  bits: string;
  color: string;
}

export interface UuidInfo {
  uuid: string;
  version: UuidVersion | "unknown";
  variant: string;
  isValid: boolean;
  timestamp?: Date;
  clockSeq?: number;
  node?: string;
  isExposed: boolean;
  entropyScore: number;
  binaryView?: BinaryPart[];
}
