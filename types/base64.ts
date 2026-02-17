// Base64 Encoder/Decoder Types

export type Base64Mode = "encode" | "decode";
export type Base64Encoding = "utf-8" | "ascii" | "iso-8859-1";
export type Base64Variant = "standard" | "url-safe";
export type Base64Format = "base64" | "hex" | "binary" | "text";

export interface Base64Config {
  encoding: Base64Encoding;
  variant: Base64Variant;
  lineBreaks: boolean;
  lineLength: number;
}

export const DEFAULT_BASE64_CONFIG: Base64Config = {
  encoding: "utf-8",
  variant: "standard",
  lineBreaks: false,
  lineLength: 76,
};

export interface ByteRepresentation {
  hex: string;
  binary: string;
  decimal: number[];
}

export interface Base64Result {
  id: string;
  input: string;
  output: string;
  mode: Base64Mode;
  isValid: boolean;
  error?: string;
  stats: Base64Stats;
  timestamp: string;
  byteView?: ByteRepresentation;
  fileInfo?: {
    name: string;
    mimeType: string;
    size: number;
  };
  detectedType?: "image" | "pdf" | "json" | "jwt" | "text" | "hex" | "binary";
}

export interface Base64Stats {
  inputLength: number;
  outputLength: number;
  inputBytes: number;
  outputBytes: number;
  compressionRatio: number;
}
