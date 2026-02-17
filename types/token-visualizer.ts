export interface TokenSegment {
  text: string;
  tokenId: number;
  color: string;
  isWaste?: boolean;
}

export type TokenizerProvider = "openai" | "anthropic" | "llama";

export interface TokenVisualization {
  id: string;
  input: string;
  provider: TokenizerProvider;
  segments: TokenSegment[];
  totalTokens: number;
  efficiencyScore: number;
  wasteCount: number;
  createdAt: string;
}

