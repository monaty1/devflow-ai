// Base64 Encoder/Decoder Application Logic

import type {
  Base64Config,
  Base64Result,
  Base64Stats,
  Base64Mode,
} from "@/types/base64";
import { DEFAULT_BASE64_CONFIG } from "@/types/base64";

/**
 * Encodes a string to Base64
 */
export function encodeBase64(
  input: string,
  config: Base64Config = DEFAULT_BASE64_CONFIG
): string {
  // Convert string to bytes based on encoding
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  // Convert bytes to base64
  let base64 = btoa(String.fromCharCode(...bytes));

  // Convert to URL-safe variant if needed
  if (config.variant === "url-safe") {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  // Add line breaks if needed
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
  // Remove line breaks and whitespace
  let base64 = input.replace(/[\s\n\r]/g, "");

  // Convert from URL-safe variant if needed
  if (config.variant === "url-safe") {
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding > 0) {
      base64 += "=".repeat(4 - padding);
    }
  }

  // Decode base64 to bytes
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert bytes to string
  const decoder = new TextDecoder(config.encoding);
  return decoder.decode(bytes);
}

/**
 * Validates if a string is valid Base64
 */
export function validateBase64(
  input: string,
  variant: "standard" | "url-safe" = "standard"
): { isValid: boolean; error?: string } {
  if (!input.trim()) {
    return { isValid: false, error: "Empty input" };
  }

  // Remove whitespace for validation
  const cleaned = input.replace(/[\s\n\r]/g, "");

  // Check for valid Base64 characters
  const standardPattern = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafePattern = /^[A-Za-z0-9\-_]*$/;

  const pattern = variant === "url-safe" ? urlSafePattern : standardPattern;

  if (!pattern.test(cleaned)) {
    return {
      isValid: false,
      error: `Invalid ${variant === "url-safe" ? "URL-safe " : ""}Base64 characters`,
    };
  }

  // Check length (must be multiple of 4 for standard Base64 with padding)
  if (variant === "standard" && cleaned.length % 4 !== 0) {
    return { isValid: false, error: "Invalid Base64 length (must be multiple of 4)" };
  }

  // Try to decode to verify
  try {
    let base64 = cleaned;
    if (variant === "url-safe") {
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      const padding = base64.length % 4;
      if (padding > 0) {
        base64 += "=".repeat(4 - padding);
      }
    }
    atob(base64);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid Base64 encoding" };
  }
}

/**
 * Calculates statistics about the encoding/decoding
 */
export function calculateBase64Stats(
  input: string,
  output: string,
  mode: Base64Mode
): Base64Stats {
  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;

  return {
    inputLength: input.length,
    outputLength: output.length,
    inputBytes,
    outputBytes,
    compressionRatio:
      mode === "encode"
        ? outputBytes / Math.max(inputBytes, 1)
        : inputBytes / Math.max(outputBytes, 1),
  };
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
      input,
      output: "",
      mode,
      isValid: false,
      error: "Empty input",
      stats: {
        inputLength: 0,
        outputLength: 0,
        inputBytes: 0,
        outputBytes: 0,
        compressionRatio: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  try {
    let output: string;

    if (mode === "encode") {
      output = encodeBase64(input, config);
    } else {
      // Validate before decoding
      const validation = validateBase64(input, config.variant);
      if (!validation.isValid) {
        return {
          id: crypto.randomUUID(),
          input,
          output: "",
          mode,
          isValid: false,
          error: validation.error ?? "Invalid Base64 input",
          stats: {
            inputLength: input.length,
            outputLength: 0,
            inputBytes: new Blob([input]).size,
            outputBytes: 0,
            compressionRatio: 0,
          },
          timestamp: new Date().toISOString(),
        };
      }
      output = decodeBase64(input, config);
    }

    const stats = calculateBase64Stats(input, output, mode);
    const detectedType = mode === "decode" 
      ? detectContent(output, false) 
      : detectContent(input, false);

    return {
      id: crypto.randomUUID(),
      input,
      output,
      mode,
      isValid: true,
      stats,
      detectedType,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    const error = e as Error;
    return {
      id: crypto.randomUUID(),
      input,
      output: "",
      mode,
      isValid: false,
      error: error.message || "Processing failed",
      stats: {
        inputLength: input.length,
        outputLength: 0,
        inputBytes: new Blob([input]).size,
        outputBytes: 0,
        compressionRatio: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Detects the type of content in a decoded Base64 string or original input
 */
export function detectContent(text: string, isBase64: boolean = false): Base64Result["detectedType"] {
  let content = text;
  
  if (isBase64) {
    try {
      // Small sample for detection
      const sample = text.slice(0, 100);
      if (sample.startsWith("data:image/")) return "image";
      if (sample.startsWith("data:application/pdf")) return "pdf";
      
      // Try to decode to check binary headers
      const decoded = atob(text.replace(/[\s\n\r]/g, "").slice(0, 100));
      if (decoded.startsWith("\x89PNG") || decoded.startsWith("\xff\xd8") || decoded.startsWith("GIF8")) return "image";
      if (decoded.startsWith("%PDF")) return "pdf";
      content = atob(text.replace(/[\s\n\r]/g, ""));
    } catch {
      return "text";
    }
  }

  const trimmed = content.trim();
  
  // JSON Check
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch { /* not json */ }
  }

  // JWT Check (three parts separated by dots)
  if (/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    return "jwt";
  }

  return "text";
}

/**
 * Encode file to Base64 Data URL
 */
export function fileToDataUrl(
  base64: string,
  mimeType: string = "application/octet-stream"
): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extract Base64 from Data URL
 */
export function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return {
    mimeType: match[1],
    base64: match[2],
  };
}

// Example inputs for demo
export const EXAMPLE_BASE64 = {
  text: "Hello, World! This is a sample text for Base64 encoding.",
  json: '{"name": "John Doe", "email": "john@example.com", "active": true}',
  encoded: "SGVsbG8sIFdvcmxkIQ==",
  urlSafe: "SGVsbG8sIFdvcmxkIQ",
};
