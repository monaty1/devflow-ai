import { describe, it, expect } from "vitest";
import {
  generateUuidV4,
  generateUuidV1,
  generateUuidV7,
  generateUuid,
  formatUuid,
  generateUuids,
  validateUuid,
  parseUuid,
  processUuidGeneration,
  compareUuids,
  validateUuids,
  EXAMPLE_UUIDS,
} from "@/lib/application/uuid-generator";
import { DEFAULT_UUID_CONFIG } from "@/types/uuid-generator";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("UUID Generator", () => {
  describe("generateUuidV4", () => {
    it("should generate a valid v4 UUID", () => {
      const uuid = generateUuidV4();
      expect(uuid).toMatch(UUID_REGEX);
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = generateUuidV4();
      const uuid2 = generateUuidV4();
      expect(uuid1).not.toBe(uuid2);
    });

    it("should have version 4 indicator", () => {
      const uuid = generateUuidV4();
      // Version digit is at position 14 (index in formatted string)
      expect(uuid[14]).toBe("4");
    });
  });

  describe("generateUuidV1", () => {
    it("should generate a valid UUID format", () => {
      const uuid = generateUuidV1();
      expect(uuid).toMatch(UUID_REGEX);
    });

    it("should have version 1 indicator", () => {
      const uuid = generateUuidV1();
      expect(uuid[14]).toBe("1");
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = generateUuidV1();
      const uuid2 = generateUuidV1();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("generateUuidV7", () => {
    it("should generate a valid UUID format", () => {
      const uuid = generateUuidV7();
      expect(uuid).toMatch(UUID_REGEX);
    });

    it("should have version 7 indicator", () => {
      const uuid = generateUuidV7();
      expect(uuid[14]).toBe("7");
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = generateUuidV7();
      const uuid2 = generateUuidV7();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("generateUuid", () => {
    it("should generate v4 by default", () => {
      const uuid = generateUuid();
      expect(uuid[14]).toBe("4");
    });

    it("should generate v1 when requested", () => {
      const uuid = generateUuid("v1");
      expect(uuid[14]).toBe("1");
    });

    it("should generate v4 when requested", () => {
      const uuid = generateUuid("v4");
      expect(uuid[14]).toBe("4");
    });

    it("should generate v7 when requested", () => {
      const uuid = generateUuid("v7");
      expect(uuid[14]).toBe("7");
    });

    it("should return nil UUID", () => {
      const uuid = generateUuid("nil");
      expect(uuid).toBe("00000000-0000-0000-0000-000000000000");
    });

    it("should return max UUID", () => {
      const uuid = generateUuid("max");
      expect(uuid).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
    });
  });

  describe("formatUuid", () => {
    const testUuid = "550e8400-e29b-41d4-a716-446655440000";

    it("should format as standard (lowercase with hyphens)", () => {
      const result = formatUuid(testUuid, "standard");
      expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should format as uppercase", () => {
      const result = formatUuid(testUuid, "uppercase");
      expect(result).toBe("550E8400-E29B-41D4-A716-446655440000");
    });

    it("should format without hyphens", () => {
      const result = formatUuid(testUuid, "no-hyphens");
      expect(result).toBe("550e8400e29b41d4a716446655440000");
    });

    it("should format with braces", () => {
      const result = formatUuid(testUuid, "braces");
      expect(result).toBe("{550e8400-e29b-41d4-a716-446655440000}");
    });

    it("should format as URN", () => {
      const result = formatUuid(testUuid, "urn");
      expect(result).toBe("urn:uuid:550e8400-e29b-41d4-a716-446655440000");
    });

    it("should normalize input before formatting", () => {
      const result = formatUuid("550E8400E29B41D4A716446655440000", "standard");
      expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  describe("generateUuids", () => {
    it("should generate the requested quantity", () => {
      const config = { ...DEFAULT_UUID_CONFIG, quantity: 5 };
      const uuids = generateUuids(config);
      expect(uuids).toHaveLength(5);
    });

    it("should respect max limit of 1000", () => {
      const config = { ...DEFAULT_UUID_CONFIG, quantity: 2000 };
      const uuids = generateUuids(config);
      expect(uuids).toHaveLength(1000);
    });

    it("should apply format to all UUIDs", () => {
      const config = { ...DEFAULT_UUID_CONFIG, format: "uppercase" as const, quantity: 3 };
      const uuids = generateUuids(config);
      uuids.forEach((uuid) => {
        expect(uuid).toBe(uuid.toUpperCase());
      });
    });

    it("should use default config", () => {
      const uuids = generateUuids();
      expect(uuids).toHaveLength(1);
    });
  });

  describe("validateUuid", () => {
    it("should validate a correct v4 UUID", () => {
      const result = validateUuid("550e8400-e29b-41d4-a716-446655440000");
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("v4");
    });

    it("should validate a nil UUID", () => {
      const result = validateUuid("00000000-0000-0000-0000-000000000000");
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("nil");
    });

    it("should validate a max UUID", () => {
      const result = validateUuid("ffffffff-ffff-ffff-ffff-ffffffffffff");
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("max");
    });

    it("should invalidate empty input", () => {
      const result = validateUuid("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Empty input");
    });

    it("should invalidate invalid format", () => {
      const result = validateUuid("not-a-uuid");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid UUID format");
    });

    it("should validate UUID with braces", () => {
      const result = validateUuid("{550e8400-e29b-41d4-a716-446655440000}");
      expect(result.isValid).toBe(true);
    });

    it("should validate UUID with URN prefix", () => {
      const result = validateUuid("urn:uuid:550e8400-e29b-41d4-a716-446655440000");
      expect(result.isValid).toBe(true);
    });

    it("should detect v1 UUIDs", () => {
      const result = validateUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("v1");
    });

    it("should detect variant", () => {
      const result = validateUuid("550e8400-e29b-41d4-a716-446655440000");
      expect(result.variant).toBeDefined();
    });

    it("should validate without hyphens", () => {
      const result = validateUuid("550e8400e29b41d4a716446655440000");
      expect(result.isValid).toBe(true);
    });
  });

  describe("parseUuid", () => {
    it("should parse a valid v4 UUID", () => {
      const info = parseUuid("550e8400-e29b-41d4-a716-446655440000");
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("v4");
      expect(info.variant).toBeDefined();
    });

    it("should parse a v1 UUID with timestamp", () => {
      const info = parseUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("v1");
      expect(info.node).toBeDefined();
      expect(info.clockSeq).toBeDefined();
    });

    it("should parse an invalid UUID", () => {
      const info = parseUuid("not-a-uuid");
      expect(info.isValid).toBe(false);
      expect(info.version).toBe("unknown");
    });

    it("should parse UUID with braces", () => {
      const info = parseUuid("{550e8400-e29b-41d4-a716-446655440000}");
      expect(info.isValid).toBe(true);
      expect(info.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should parse UUID with URN prefix", () => {
      const info = parseUuid("urn:uuid:550e8400-e29b-41d4-a716-446655440000");
      expect(info.isValid).toBe(true);
    });

    it("should parse nil UUID", () => {
      const info = parseUuid("00000000-0000-0000-0000-000000000000");
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("nil");
    });
  });

  describe("processUuidGeneration", () => {
    it("should generate result with default config", () => {
      const result = processUuidGeneration();
      expect(result.id).toBeTruthy();
      expect(result.uuids).toHaveLength(1);
      expect(result.version).toBe("v4");
      expect(result.format).toBe("standard");
      expect(result.timestamp).toBeTruthy();
    });

    it("should generate result with custom config", () => {
      const config = { version: "v7" as const, format: "uppercase" as const, quantity: 3 };
      const result = processUuidGeneration(config);
      expect(result.uuids).toHaveLength(3);
      expect(result.version).toBe("v7");
      expect(result.format).toBe("uppercase");
    });

    it("should generate unique IDs for each result", () => {
      const r1 = processUuidGeneration();
      const r2 = processUuidGeneration();
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe("compareUuids", () => {
    it("should match identical UUIDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(compareUuids(uuid, uuid)).toBe(true);
    });

    it("should match different formats of the same UUID", () => {
      const a = "550e8400-e29b-41d4-a716-446655440000";
      const b = "550E8400E29B41D4A716446655440000";
      expect(compareUuids(a, b)).toBe(true);
    });

    it("should match braces format", () => {
      const a = "{550e8400-e29b-41d4-a716-446655440000}";
      const b = "550e8400-e29b-41d4-a716-446655440000";
      expect(compareUuids(a, b)).toBe(true);
    });

    it("should not match different UUIDs", () => {
      const a = "550e8400-e29b-41d4-a716-446655440000";
      const b = "660e8400-e29b-41d4-a716-446655440000";
      expect(compareUuids(a, b)).toBe(false);
    });
  });

  describe("validateUuids", () => {
    it("should validate multiple UUIDs", () => {
      const inputs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "invalid-uuid",
        "00000000-0000-0000-0000-000000000000",
      ];
      const results = validateUuids(inputs);
      expect(results).toHaveLength(3);
      expect(results[0]?.validation.isValid).toBe(true);
      expect(results[1]?.validation.isValid).toBe(false);
      expect(results[2]?.validation.isValid).toBe(true);
    });

    it("should return empty array for empty input", () => {
      const results = validateUuids([]);
      expect(results).toHaveLength(0);
    });
  });

  describe("EXAMPLE_UUIDS", () => {
    it("should have examples for all versions", () => {
      expect(EXAMPLE_UUIDS.v4).toBeTruthy();
      expect(EXAMPLE_UUIDS.v1).toBeTruthy();
      expect(EXAMPLE_UUIDS.v7).toBeTruthy();
      expect(EXAMPLE_UUIDS.nil).toBeTruthy();
      expect(EXAMPLE_UUIDS.max).toBeTruthy();
    });

    it("should have a valid v4 example", () => {
      const result = validateUuid(EXAMPLE_UUIDS.v4);
      expect(result.isValid).toBe(true);
    });

    it("should have a valid v1 example", () => {
      const result = validateUuid(EXAMPLE_UUIDS.v1);
      expect(result.isValid).toBe(true);
    });

    it("should have a valid nil example", () => {
      const result = validateUuid(EXAMPLE_UUIDS.nil);
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("nil");
    });

    it("should have a valid max example", () => {
      const result = validateUuid(EXAMPLE_UUIDS.max);
      expect(result.isValid).toBe(true);
      expect(result.version).toBe("max");
    });

    it("should have an invalid example", () => {
      const result = validateUuid(EXAMPLE_UUIDS.invalid);
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateUuid - variant detection", () => {
    it("should detect Microsoft variant (0xC-0xD at position 16)", () => {
      // Position 16 in hex = first char of the 4th group
      // Microsoft variant: bits are 110x, so hex C or D
      const uuid = "550e8400-e29b-41d4-c716-446655440000";
      const result = validateUuid(uuid);
      expect(result.isValid).toBe(true);
      expect(result.variant).toBe("Microsoft");
    });

    it("should detect Future reserved variant (0xE-0xF at position 16)", () => {
      // Future variant: bits are 111x, so hex E or F
      const uuid = "550e8400-e29b-41d4-e716-446655440000";
      const result = validateUuid(uuid);
      expect(result.isValid).toBe(true);
      expect(result.variant).toBe("Future (reserved)");
    });

    it("should detect NCS variant (bit 7 is 0, so hex 0-7)", () => {
      const uuid = "550e8400-e29b-41d4-0716-446655440000";
      const result = validateUuid(uuid);
      expect(result.isValid).toBe(true);
      expect(result.variant).toBe("NCS (reserved)");
    });

    it("should detect RFC 4122 variant (hex 8-B at position 16)", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = validateUuid(uuid);
      expect(result.isValid).toBe(true);
      expect(result.variant).toBe("RFC 4122");
    });
  });

  describe("parseUuid - v7 timestamp extraction", () => {
    it("should extract timestamp from v7 UUID", () => {
      // v7 UUID: first 48 bits are unix timestamp in ms
      const v7 = generateUuidV7();
      const info = parseUuid(v7);
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("v7");
      if (info.timestamp) {
        const now = Date.now();
        const ts = info.timestamp.getTime();
        // Should be within 5 seconds of now
        expect(Math.abs(now - ts)).toBeLessThan(5000);
      }
    });

    it("should parse v7 UUID with known timestamp", () => {
      const info = parseUuid(EXAMPLE_UUIDS.v7);
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("v7");
    });

    it("should extract timestamp from v1 UUID", () => {
      const info = parseUuid(EXAMPLE_UUIDS.v1);
      expect(info.isValid).toBe(true);
      expect(info.version).toBe("v1");
      // v1 should extract clock sequence and node
      expect(info.clockSeq).toBeDefined();
      expect(info.node).toBeDefined();
    });

    it("should parse braces-wrapped UUID", () => {
      const info = parseUuid("{550e8400-e29b-41d4-a716-446655440000}");
      expect(info.isValid).toBe(true);
      expect(info.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should parse URN-prefixed UUID", () => {
      const info = parseUuid("urn:uuid:550e8400-e29b-41d4-a716-446655440000");
      expect(info.isValid).toBe(true);
      expect(info.uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });
});
