import type { TokenSegment, TokenVisualization, TokenizerProvider } from "@/types/token-visualizer";

// Token colors palette (more professional and subtle)
const TOKEN_COLORS = [
  "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800",
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800",
] as const;

function getTokenColor(index: number): string {
  return TOKEN_COLORS[index % TOKEN_COLORS.length] ?? TOKEN_COLORS[0];
}

/**
 * Advanced Tokenization Simulation
 * Different providers use different strategies (OpenAI uses cl100k_base, Anthropic has its own, Llama 3 uses Tiktoken with different vocab)
 */
export function tokenizeText(text: string, provider: TokenizerProvider): TokenSegment[] {
  if (!text) return [];

  const segments: TokenSegment[] = [];
  let currentTokenId = 0;

  // Different regex based on provider to simulate different tokenization logic
  let regex: RegExp;
  
  if (provider === "openai") {
    // OpenAI is very good with numbers and subwords
    regex = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
  } else if (provider === "anthropic") {
    // Anthropic often groups more aggressively
    regex = / ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+/gu;
  } else {
    // Llama / Generic
    regex = /(\s+|[.,!?;:()[\]{}"'…]|[a-zA-Z]+|[0-9]+|[^\s\w])/g;
  }

  const matches = Array.from(text.matchAll(regex));

  for (const match of matches) {
    const word = match[0];
    
    // Check for "Waste" (double spaces, invisible chars, or just long spaces)
    const isWaste = (word === "  ") || (word.length > 2 && /^\s+$/.test(word));

    // Simulate sub-word splitting for very long words (real BPE would do this)
    if (word.length > 8 && /\p{L}/u.test(word) && !word.includes(" ")) {
      const mid = Math.floor(word.length / 2);
      const parts = [word.slice(0, mid), word.slice(mid)];
      for (const part of parts) {
        segments.push({
          text: part,
          tokenId: currentTokenId++,
          color: getTokenColor(currentTokenId),
          isWaste: false
        });
      }
    } else {
      segments.push({
        text: word,
        tokenId: currentTokenId++,
        color: getTokenColor(currentTokenId),
        isWaste
      });
    }
  }

  return segments;
}

export function createVisualization(input: string, provider: TokenizerProvider = "openai"): TokenVisualization {
  const segments = tokenizeText(input, provider);
  const totalTokens = segments.length;
  const wasteCount = segments.filter(s => s.isWaste).length;
  
  // Efficiency score calculation: 100 is perfect, drops with waste and extreme token/char ratios
  const charToTokenRatio = input.length / (totalTokens || 1);
  // Ideal ratio for English is ~4. If it's < 2, it's inefficient (lots of tokens for few chars)
  let efficiencyScore = 100;
  if (charToTokenRatio < 3) efficiencyScore -= (3 - charToTokenRatio) * 20;
  efficiencyScore -= (wasteCount * 5);
  
  return {
    id: crypto.randomUUID(),
    input,
    provider,
    segments,
    totalTokens,
    efficiencyScore: Math.max(0, Math.min(100, Math.round(efficiencyScore))),
    wasteCount,
    createdAt: new Date().toISOString(),
  };
}
