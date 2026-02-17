// UUID Generator Application Logic

import type {
  UuidConfig,
  UuidResult,
  UuidVersion,
  UuidFormat,
  UuidValidation,
  UuidInfo,
} from "@/types/uuid-generator";
import { DEFAULT_UUID_CONFIG } from "@/types/uuid-generator";

// UUID constants
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

/**
 * Generates a UUID v4 (random)
 */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Generates a UUID v1-like (time-based) - simplified implementation
 * Note: True v1 requires MAC address, this is a timestamp-based variant
 */
export function generateUuidV1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");

  // Construct UUID with timestamp in first segments
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHiVersion = "1" + timeHex.slice(0, 3);

  // Random clock seq and node
  const clockSeq =
    (0x80 | (Math.random() * 0x3f)) << 8 | (Math.random() * 0xff);
  const clockSeqHex = clockSeq.toString(16).padStart(4, "0");

  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");

  return `${timeLow}-${timeMid}-${timeHiVersion}-${clockSeqHex}-${node}`;
}

/**
 * Generates a UUID v7 (Unix Epoch time-based)
 */
export function generateUuidV7(): string {
  const now = Date.now();

  // 48 bits for milliseconds since Unix epoch
  const msHex = now.toString(16).padStart(12, "0");

  // Random bits for the rest
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
  );

  // Set version (7) in bits 48-51
  random[0] = 0x70 | ((random[0] ?? 0) & 0x0f);

  // Set variant (10xx) in bits 64-65
  random[2] = 0x80 | ((random[2] ?? 0) & 0x3f);

  const randomHex = random.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${msHex.slice(0, 8)}-${msHex.slice(8)}-7${randomHex.slice(1, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 20)}`;
}

/**
 * Generates a single UUID based on version
 */
export function generateUuid(version: UuidVersion = "v4"): string {
  switch (version) {
    case "v1":
      return generateUuidV1();
    case "v4":
      return generateUuidV4();
    case "v7":
      return generateUuidV7();
    case "nil":
      return NIL_UUID;
    case "max":
      return MAX_UUID;
    default:
      return generateUuidV4();
  }
}

/**
 * Formats a UUID according to the specified format
 */
export function formatUuid(uuid: string, format: UuidFormat): string {
  // Normalize to lowercase with hyphens first
  const normalized = uuid.toLowerCase().replace(/[^a-f0-9]/g, "");
  const standard = `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;

  switch (format) {
    case "standard":
      return standard;
    case "uppercase":
      return standard.toUpperCase();
    case "no-hyphens":
      return normalized;
    case "braces":
      return `{${standard}}`;
    case "urn":
      return `urn:uuid:${standard}`;
    default:
      return standard;
  }
}

/**
 * Generates multiple UUIDs
 */
export function generateUuids(
  config: UuidConfig = DEFAULT_UUID_CONFIG
): string[] {
  const { version, format, quantity } = config;
  const uuids: string[] = [];

  for (let i = 0; i < Math.min(quantity, 1000); i++) {
    const uuid = generateUuid(version);
    uuids.push(formatUuid(uuid, format));
  }

  return uuids;
}

/**
 * Validates a UUID string
 */
export function validateUuid(input: string): UuidValidation {
  if (!input.trim()) {
    return { isValid: false, error: "Empty input" };
  }

  // Remove braces, urn prefix, and normalize
  let normalized = input.trim();
  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    normalized = normalized.slice(1, -1);
  }
  if (normalized.toLowerCase().startsWith("urn:uuid:")) {
    normalized = normalized.slice(9);
  }

  // Check format
  const uuidRegex =
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

  if (!uuidRegex.test(normalized)) {
    return { isValid: false, error: "Invalid UUID format" };
  }

  // Normalize to standard format for analysis
  const hex = normalized.replace(/-/g, "").toLowerCase();

  // Check for nil UUID
  if (hex === "0".repeat(32)) {
    return { isValid: true, version: "nil", variant: "nil" };
  }

  // Check for max UUID
  if (hex === "f".repeat(32)) {
    return { isValid: true, version: "max", variant: "max" };
  }

  // Extract version (bits 48-51)
  const versionChar = hex[12] ?? "0";
  let version: UuidVersion | "unknown" = "unknown";

  switch (versionChar) {
    case "1":
      version = "v1";
      break;
    case "4":
      version = "v4";
      break;
    case "7":
      version = "v7";
      break;
  }

  // Extract variant (bits 64-65)
  const variantChar = parseInt(hex[16] ?? "0", 16);
  let variant = "unknown";

  if ((variantChar & 0x8) === 0) {
    variant = "NCS (reserved)";
  } else if ((variantChar & 0xc) === 0x8) {
    variant = "RFC 4122";
  } else if ((variantChar & 0xe) === 0xc) {
    variant = "Microsoft";
  } else {
    variant = "Future (reserved)";
  }

  return { isValid: true, version, variant };
}

/**
 * Parses a UUID and extracts detailed information
 */
export function parseUuid(input: string): UuidInfo {
  const validation = validateUuid(input);

  if (!validation.isValid) {
    return {
      uuid: input,
      version: "unknown",
      variant: "unknown",
      isValid: false,
    };
  }

  // Normalize
  let normalized = input.trim();
  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    normalized = normalized.slice(1, -1);
  }
  if (normalized.toLowerCase().startsWith("urn:uuid:")) {
    normalized = normalized.slice(9);
  }

  const hex = normalized.replace(/-/g, "").toLowerCase();
  const standardFormat = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

  const result: UuidInfo = {
    uuid: standardFormat,
    version: validation.version ?? "unknown",
    variant: validation.variant ?? "unknown",
    isValid: true,
    isExposed: false,
    entropyScore: 100,
  };

  // Entropy calculation (simplified)
  if (validation.version === "v1") {
    result.entropyScore = 40; // High deterministic part (time + node)
    result.isExposed = true; // Node (MAC) and exact time are leaked
  } else if (validation.version === "v7") {
    result.entropyScore = 70; // Time is deterministic, rest is random
    result.isExposed = true; // Exact time is leaked
  } else if (validation.version === "v4") {
    result.entropyScore = 98; // Almost fully random
  }

  // Extract timestamp for v1 and v7
  if (validation.version === "v1") {
    // v1 timestamp is in 100-nanosecond intervals since Oct 15, 1582
    const timeLow = hex.slice(0, 8);
    const timeMid = hex.slice(8, 12);
    const timeHi = hex.slice(13, 16);
    const timestamp = parseInt(timeHi + timeMid + timeLow, 16);

    // Convert from 100-ns intervals since 1582 to ms since 1970
    const epochDiff = 122192928000000000n; // Difference in 100-ns intervals
    const ms = Number((BigInt(timestamp) - epochDiff) / 10000n);

    if (ms > 0 && ms < Date.now() + 86400000 * 365 * 100) {
      result.timestamp = new Date(ms);
    }

    // Extract clock sequence
    result.clockSeq = parseInt(hex.slice(16, 20), 16) & 0x3fff;

    // Extract node (MAC address)
    const nodeMatch = hex.slice(20).match(/.{2}/g);
    if (nodeMatch) {
      result.node = nodeMatch.join(":").toUpperCase();
    }
  } else if (validation.version === "v7") {
    // v7 timestamp is Unix milliseconds in first 48 bits
    const msHex = hex.slice(0, 12);
    const ms = parseInt(msHex, 16);

    if (ms > 0 && ms < Date.now() + 86400000 * 365 * 100) {
      result.timestamp = new Date(ms);
    }
  }

  return result;
}

/**
 * Main processing function
 */
export function processUuidGeneration(
  config: UuidConfig = DEFAULT_UUID_CONFIG
): UuidResult {
  const uuids = generateUuids(config);

  return {
    id: crypto.randomUUID(),
    uuids,
    version: config.version,
    format: config.format,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compare two UUIDs for equality (ignoring format)
 */
export function compareUuids(uuid1: string, uuid2: string): boolean {
  const normalize = (uuid: string) =>
    uuid.toLowerCase().replace(/[^a-f0-9]/g, "");
  return normalize(uuid1) === normalize(uuid2);
}

/**
 * Bulk validate UUIDs
 */
export function validateUuids(
  inputs: string[]
): { uuid: string; validation: UuidValidation }[] {
  return inputs.map((uuid) => ({
    uuid,
    validation: validateUuid(uuid),
  }));
}

/**
 * Formats multiple UUIDs for bulk export
 */
export function formatBulkExport(uuids: string[], format: "text" | "json" | "csv" | "sql"): string {
  switch (format) {
    case "json":
      return JSON.stringify(uuids, null, 2);
    case "csv":
      return "uuid\n" + uuids.join("\n");
    case "sql":
      return "INSERT INTO table_name (uuid_column) VALUES\n" + 
             uuids.map(u => `('${u}')`).join(",\n") + ";";
    case "text":
    default:
      return uuids.join("\n");
  }
}

// Example UUIDs for demo
export const EXAMPLE_UUIDS = {
  v4: "550e8400-e29b-41d4-a716-446655440000",
  v1: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  v7: "01908f96-4200-7000-8000-000000000000",
  nil: NIL_UUID,
  max: MAX_UUID,
  invalid: "not-a-valid-uuid",
};
