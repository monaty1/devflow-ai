import type { TokenSegment, TokenVisualization } from "@/types/token-visualizer";

// Token colors palette
const TOKEN_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
] as const;

function getTokenColor(index: number): string {
  return TOKEN_COLORS[index % TOKEN_COLORS.length] ?? TOKEN_COLORS[0];
}

/**
 * Simulates tokenization similar to BPE (Byte Pair Encoding)
 * Real tokenizers split differently but this gives a visual approximation
 */
export function tokenizeText(text: string): TokenSegment[] {
  if (!text.trim()) return [];

  const segments: TokenSegment[] = [];
  let tokenId = 0;

  // Split by words first, then handle punctuation
  const regex = /(\s+|[.,!?;:()[\]{}"'…]|[a-zA-Z]+|[0-9]+|[^\s\w])/g;
  const matches = text.match(regex);

  if (!matches) return [];

  for (const match of matches) {
    // Whitespace is part of next token, skip
    if (match.trim().length === 0) {
      continue;
    }

    if (match.length > 6 && /^[a-zA-Z]+$/.test(match)) {
      // Split long words into sub-tokens (simulating BPE)
      const mid = Math.ceil(match.length / 2);
      const parts = [match.slice(0, mid), match.slice(mid)];
      for (const part of parts) {
        const currentId = tokenId++;
        segments.push({
          text: part,
          tokenId: currentId,
          color: getTokenColor(currentId),
        });
      }
    } else {
      const currentId = tokenId++;
      segments.push({
        text: match,
        tokenId: currentId,
        color: getTokenColor(currentId),
      });
    }
  }

  return segments;
}

export function createVisualization(input: string): TokenVisualization {
  const segments = tokenizeText(input);
  const totalTokens = segments.length;

  return {
    id: crypto.randomUUID(),
    input,
    segments,
    totalTokens,
    estimatedCost: {
      gpt4: (totalTokens / 1_000_000) * 2.5,
      claude: (totalTokens / 1_000_000) * 3.0,
    },
    createdAt: new Date().toISOString(),
  };
}
