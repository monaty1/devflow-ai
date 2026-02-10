export interface TokenSegment {
  text: string;
  tokenId: number;
  color: string;
}

export interface TokenVisualization {
  id: string;
  input: string;
  segments: TokenSegment[];
  totalTokens: number;
  estimatedCost: {
    gpt4: number;
    claude: number;
  };
  createdAt: string;
}
