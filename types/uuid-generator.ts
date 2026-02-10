// UUID Generator Types

export type UuidVersion = "v1" | "v4" | "v7" | "nil" | "max";
export type UuidFormat = "standard" | "uppercase" | "no-hyphens" | "braces" | "urn";

export interface UuidConfig {
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
}

export const DEFAULT_UUID_CONFIG: UuidConfig = {
  version: "v4",
  format: "standard",
  quantity: 1,
};

export interface UuidResult {
  id: string;
  uuids: string[];
  version: UuidVersion;
  format: UuidFormat;
  timestamp: string;
}

export interface UuidValidation {
  isValid: boolean;
  version?: UuidVersion | "unknown";
  variant?: string;
  error?: string;
}

export interface UuidInfo {
  uuid: string;
  version: UuidVersion | "unknown";
  variant: string;
  isValid: boolean;
  timestamp?: Date;
  clockSeq?: number;
  node?: string;
}
