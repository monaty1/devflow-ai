export const TOKEN_VISUALIZER_WORKER_SOURCE = `
// --- Self-contained Token Visualizer Logic ---

const TOKEN_COLORS = [
  "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800",
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800",
];

function getTokenColor(index) {
  return TOKEN_COLORS[index % TOKEN_COLORS.length];
}

function tokenizeText(text, provider) {
  if (!text) return [];

  const segments = [];
  let currentTokenId = 0;
  let regex;
  
  if (provider === "openai") {
    regex = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
  } else if (provider === "anthropic") {
    regex = / ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+/gu;
  } else {
    regex = /(\s+|[.,!?;:()[\]{}"'…]|[a-zA-Z]+|[0-9]+|[^\s\w])/g;
  }

  const matches = Array.from(text.matchAll(regex));

  for (const match of matches) {
    const word = match[0];
    const isWaste = (word === "  ") || (word.length > 2 && /^\s+$/.test(word));

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

function createVisualization(input, provider) {
  const segments = tokenizeText(input, provider);
  const totalTokens = segments.length;
  const wasteCount = segments.filter(s => s.isWaste).length;
  const charToTokenRatio = input.length / (totalTokens || 1);
  
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

self.onmessage = function(e) {
  try {
    const { input, provider, compareAll } = e.data;
    
    if (compareAll) {
      const providers = ["openai", "anthropic", "llama"];
      const results = providers.map(p => ({
        provider: p,
        result: createVisualization(input, p)
      }));
      self.postMessage({ type: 'success', results, compareAll: true });
    } else {
      const result = createVisualization(input, provider);
      self.postMessage({ type: 'success', result, compareAll: false });
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
`;
