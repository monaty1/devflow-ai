// UUID Generator Application Logic

import type {
  UuidConfig,
  UuidResult,
  UuidVersion,
  UuidFormat,
  UuidValidation,
  UuidInfo,
  BinaryPart,
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
 * Generates a UUID v1-like (time-based)
 */
export function generateUuidV1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHiVersion = "1" + timeHex.slice(0, 3);
  const clockSeq = (0x80 | Math.floor(Math.random() * 0x3f)) << 8 | Math.floor(Math.random() * 0xff);
  const clockSeqHex = clockSeq.toString(16).padStart(4, "0");
  const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-${timeHiVersion}-${clockSeqHex}-${node}`;
}

/**
 * Generates a UUID v7 (Unix Epoch time-based)
 */
export function generateUuidV7(): string {
  const now = Date.now();
  const msHex = now.toString(16).padStart(12, "0");
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  random[0] = 0x70 | ((random[0] ?? 0) & 0x0f);
  random[2] = 0x80 | ((random[2] ?? 0) & 0x3f);
  const randomHex = random.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${msHex.slice(0, 8)}-${msHex.slice(8)}-7${randomHex.slice(1, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 20)}`;
}

/**
 * Generates a ULID (Universally Unique Lexicographically Sortable Identifier).
 * Format: 26 characters, Crockford's Base32, timestamp + randomness.
 */
export function generateUlid(): string {
  const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const now = Date.now();

  // Encode 48-bit timestamp (10 chars)
  let ts = now;
  const timePart: string[] = [];
  for (let i = 0; i < 10; i++) {
    timePart.unshift(CROCKFORD[ts % 32]!);
    ts = Math.floor(ts / 32);
  }

  // Encode 80 bits of randomness (16 chars)
  const randPart: string[] = [];
  for (let i = 0; i < 16; i++) {
    randPart.push(CROCKFORD[Math.floor(Math.random() * 32)]!);
  }

  return timePart.join("") + randPart.join("");
}

/**
 * Generates a NanoID (URL-friendly unique string identifier).
 * Default alphabet: A-Za-z0-9_- (64 chars), 21 characters long.
 */
export function generateNanoId(size: number = 21): string {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < size; i++) {
    id += ALPHABET[(bytes[i] ?? 0) & 63];
  }

  return id;
}

/**
 * Generates a single UUID based on version with optional prefix
 */
export function generateUuid(version: UuidVersion = "v4", prefix: string = ""): string {
  let uuid: string;
  switch (version) {
    case "v1": uuid = generateUuidV1(); break;
    case "v7": uuid = generateUuidV7(); break;
    case "nil": uuid = NIL_UUID; break;
    case "max": uuid = MAX_UUID; break;
    case "ulid": return generateUlid();
    case "nanoid": return generateNanoId();
    case "v4":
    default: uuid = generateUuidV4(); break;
  }

  if (prefix) {
    // Replace the first characters with the prefix (hex-safe)
    const cleanPrefix = prefix.replace(/[^a-f0-9]/gi, "").slice(0, 8);
    uuid = cleanPrefix + uuid.slice(cleanPrefix.length);
  }

  return uuid;
}

/**
 * Formats a UUID according to the specified format
 */
export function formatUuid(uuid: string, format: UuidFormat): string {
  const normalized = uuid.toLowerCase().replace(/[^a-f0-9]/g, "");
  const standard = `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;

  switch (format) {
    case "uppercase": return standard.toUpperCase();
    case "no-hyphens": return normalized;
    case "braces": return `{${standard}}`;
    case "urn": return `urn:uuid:${standard}`;
    default: return standard;
  }
}

/**
 * Generates multiple UUIDs
 */
export function generateUuids(config: UuidConfig = DEFAULT_UUID_CONFIG): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < Math.min(config.quantity, 1000); i++) {
    const uuid = generateUuid(config.version, config.prefix);
    uuids.push(formatUuid(uuid, config.format));
  }
  return uuids;
}

/**
 * Validates a UUID string
 */
export function validateUuid(input: string): UuidValidation {
  if (!input.trim()) return { isValid: false, error: "Empty input" };
  let normalized = input.trim();
  if (normalized.startsWith("{") && normalized.endsWith("}")) normalized = normalized.slice(1, -1);
  if (normalized.toLowerCase().startsWith("urn:uuid:")) normalized = normalized.slice(9);

  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  if (!uuidRegex.test(normalized)) return { isValid: false, error: "Invalid format" };

  const hex = normalized.replace(/-/g, "").toLowerCase();
  if (hex === "0".repeat(32)) return { isValid: true, version: "nil", variant: "nil" };
  if (hex === "f".repeat(32)) return { isValid: true, version: "max", variant: "max" };

  const versionChar = hex[12];
  let version: UuidVersion | "unknown" = "unknown";
  if (versionChar === "1") version = "v1";
  else if (versionChar === "4") version = "v4";
  else if (versionChar === "7") version = "v7";

  return { isValid: true, version, variant: "RFC 4122" };
}

/**
 * Parses a UUID and extracts detailed information including binary view
 */
export function parseUuid(input: string): UuidInfo {
  const validation = validateUuid(input);
  if (!validation.isValid) return { uuid: input, version: "unknown", variant: "unknown", isValid: false, isExposed: false, entropyScore: 0 };

  const hex = input.replace(/[^a-f0-9]/gi, "").toLowerCase();
  const binary = hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');

  const binaryView: BinaryPart[] = [
    { label: "Time Low", bits: binary.slice(0, 32), color: "text-blue-500" },
    { label: "Time Mid", bits: binary.slice(32, 48), color: "text-indigo-500" },
    { label: "Version", bits: binary.slice(48, 52), color: "text-rose-500" },
    { label: "Time High", bits: binary.slice(52, 64), color: "text-amber-500" },
    { label: "Variant", bits: binary.slice(64, 66), color: "text-emerald-500" },
    { label: "Clock/Node", bits: binary.slice(66), color: "text-purple-500" },
  ];

  const result: UuidInfo = {
    uuid: formatUuid(hex, "standard"),
    version: validation.version || "unknown",
    variant: validation.variant || "RFC 4122",
    isValid: true,
    isExposed: validation.version === "v1" || validation.version === "v7",
    entropyScore: validation.version === "v4" ? 99 : validation.version === "v7" ? 75 : 45,
    binaryView,
  };

  if (validation.version === "v7") {
    result.timestamp = new Date(parseInt(hex.slice(0, 12), 16));
  }

  return result;
}

/**
 * Main processing function with simulated collision stats
 */
export function processUuidGeneration(config: UuidConfig = DEFAULT_UUID_CONFIG): UuidResult {
  const uuids = generateUuids(config);
  return {
    id: crypto.randomUUID(),
    uuids,
    version: config.version,
    format: config.format,
    timestamp: new Date().toISOString(),
    collisionStats: {
      attempts: config.quantity,
      collisions: 0,
      probability: config.version === "v4" ? "< 0.000000000001%" : "0% (time-ordered)"
    }
  };
}

export function formatBulkExport(uuids: string[], format: "text" | "json" | "csv" | "sql"): string {
  switch (format) {
    case "json": return JSON.stringify(uuids, null, 2);
    case "csv": return "uuid\n" + uuids.join("\n");
    case "sql": return "INSERT INTO table_name (uuid_column) VALUES\n" + uuids.map(u => `('${u}')`).join(",\n") + ";";
    default: return uuids.join("\n");
  }
}

export interface CollisionResult {
  total: number;
  unique: number;
  duplicates: [string, number[]][];
}

export function checkCollisions(input: string): CollisionResult | null {
  if (!input.trim()) return null;
  const lines = input.split("\n").map(l => l.trim().toLowerCase()).filter(Boolean);
  const seen = new Map<string, number[]>();
  for (const [i, uuid] of lines.entries()) {
    const existing = seen.get(uuid);
    if (existing) { existing.push(i + 1); } else { seen.set(uuid, [i + 1]); }
  }
  const duplicates = [...seen.entries()].filter(([, indices]) => indices.length > 1);
  return { total: lines.length, unique: seen.size, duplicates };
}
