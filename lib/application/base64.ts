// Base64 Encoder/Decoder Application Logic

import type {
  Base64Config,
  Base64Result,
  Base64Mode,
  ByteRepresentation,
} from "@/types/base64";
import { DEFAULT_BASE64_CONFIG } from "@/types/base64";

/**
 * Encodes a string to Base64
 */
export function encodeBase64(
  input: string,
  config: Base64Config = DEFAULT_BASE64_CONFIG
): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  // Chunked conversion to avoid call stack overflow on large inputs
  let binaryString = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binaryString += String.fromCharCode(
      ...Array.from(bytes.slice(i, i + chunkSize)),
    );
  }
  let base64 = btoa(binaryString);

  if (config.variant === "url-safe") {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  if (config.lineBreaks && config.lineLength > 0) {
    const lines: string[] = [];
    for (let i = 0; i < base64.length; i += config.lineLength) {
      lines.push(base64.slice(i, i + config.lineLength));
    }
    base64 = lines.join("\n");
  }

  return base64;
}

/**
 * Decodes a Base64 string
 */
export function decodeBase64(
  input: string,
  config: Base64Config = DEFAULT_BASE64_CONFIG
): string {
  let base64 = input.replace(/[\s\n\r]/g, "");

  if (config.variant === "url-safe") {
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding > 0) {
      base64 += "=".repeat(4 - padding);
    }
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const decoder = new TextDecoder(config.encoding);
  return decoder.decode(bytes);
}

/**
 * Helper to get byte representation
 */
export function getByteView(input: string, isBase64: boolean): ByteRepresentation {
  let bytes: Uint8Array;
  let error: string | undefined;

  if (isBase64) {
    try {
      const binaryString = atob(input.replace(/[\s\n\r]/g, ""));
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch {
      bytes = new Uint8Array();
      error = "Invalid base64 input";
    }
  } else {
    bytes = new TextEncoder().encode(input);
  }

  const byteArray = Array.from(bytes);
  const hex = byteArray.map(b => b.toString(16).padStart(2, '0')).join(' ');
  const binary = byteArray.map(b => b.toString(2).padStart(8, '0')).join(' ');
  const decimal = byteArray;

  return { hex, binary, decimal, error };
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/\s/g, '');
  if (cleanHex.length % 2 !== 0) return new Uint8Array();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Validates if a string is valid Base64
 */
export function validateBase64(
  input: string,
  variant: "standard" | "url-safe" = "standard"
): { isValid: boolean; error?: string } {
  if (!input.trim()) return { isValid: false, error: "Empty input" };
  const cleaned = input.replace(/[\s\n\r]/g, "");
  const standardPattern = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafePattern = /^[A-Za-z0-9\-_]*$/;
  const pattern = variant === "url-safe" ? urlSafePattern : standardPattern;

  if (!pattern.test(cleaned)) return { isValid: false, error: `Invalid ${variant === "url-safe" ? "URL-safe " : ""}Base64 characters` };
  if (variant === "standard" && cleaned.length % 4 !== 0) return { isValid: false, error: "Invalid Base64 length" };

  try {
    let base64 = cleaned;
    if (variant === "url-safe") {
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      const padding = base64.length % 4;
      if (padding > 0) base64 += "=".repeat(4 - padding);
    }
    atob(base64);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid Base64 encoding" };
  }
}

/**
 * Detects the type of content
 */
export function detectContent(text: string, isBase64: boolean = false): Base64Result["detectedType"] {
  let content = text;
  if (isBase64) {
    try {
      const sample = text.slice(0, 100);
      if (sample.startsWith("data:image/")) return "image";
      const decoded = atob(text.replace(/[\s\n\r]/g, "").slice(0, 100));
      if (decoded.startsWith("\x89PNG") || decoded.startsWith("\xff\xd8") || decoded.startsWith("GIF8")) return "image";
      if (decoded.startsWith("%PDF")) return "pdf";
      content = atob(text.replace(/[\s\n\r]/g, ""));
    } catch { return "text"; }
  }

  const trimmed = content.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try { JSON.parse(trimmed); return "json"; } catch { }
  }
  if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(trimmed)) return "jwt";
  if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.length > 8) return "hex";
  
  return "text";
}

/**
 * Main processing function
 */
export function processBase64(
  input: string,
  mode: Base64Mode,
  config: Base64Config = DEFAULT_BASE64_CONFIG
): Base64Result {
  if (!input.trim()) {
    return {
      id: crypto.randomUUID(),
      input, output: "", mode, isValid: false, error: "Empty input",
      stats: { inputLength: 0, outputLength: 0, inputBytes: 0, outputBytes: 0, compressionRatio: 0 },
      timestamp: new Date().toISOString(),
    };
  }

  try {
    let output: string;
    if (mode === "encode") {
      output = encodeBase64(input, config);
    } else {
      const validation = validateBase64(input, config.variant);
      if (!validation.isValid) throw new Error(validation.error);
      output = decodeBase64(input, config);
    }

    const inputBytes = new Blob([input]).size;
    const outputBytes = new Blob([output]).size;
    const byteView = getByteView(mode === "encode" ? input : output, mode === "decode");

    return {
      id: crypto.randomUUID(),
      input, output, mode, isValid: true,
      stats: {
        inputLength: input.length,
        outputLength: output.length,
        inputBytes,
        outputBytes,
        compressionRatio: mode === "encode" ? outputBytes / Math.max(inputBytes, 1) : inputBytes / Math.max(outputBytes, 1),
      },
      byteView,
      detectedType: detectContent(mode === "decode" ? output : input, mode === "decode"),
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: crypto.randomUUID(),
      input, output: "", mode, isValid: false, error: (e as Error).message,
      stats: { inputLength: input.length, outputLength: 0, inputBytes: new Blob([input]).size, outputBytes: 0, compressionRatio: 0 },
      timestamp: new Date().toISOString(),
    };
  }
}
