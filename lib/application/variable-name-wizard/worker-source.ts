export const VARIABLE_NAME_WIZARD_WORKER_SOURCE = `
// --- Self-contained Variable Name Wizard Logic ---

const TYPE_CONVENTIONS = {
  variable: ["camelCase", "snake_case"],
  function: ["camelCase", "snake_case"],
  constant: ["SCREAMING_SNAKE_CASE", "UPPERCASE"],
  class: ["PascalCase"],
  hook: ["camelCase"],
  component: ["PascalCase"],
};

const LANGUAGE_RULES = {
  typescript: { preferred: "camelCase", privatePrefix: "_" },
  python: { preferred: "snake_case", privatePrefix: "__" },
  java: { preferred: "camelCase", constant: "SCREAMING_SNAKE_CASE" },
  go: { preferred: "PascalCase", privatePrefix: "" },
  csharp: { preferred: "PascalCase", variable: "camelCase" }
};

const TECH_SYNONYMS = {
  get: ["fetch", "retrieve", "load", "find", "query", "pull"],
  set: ["update", "change", "modify", "assign", "write"],
  user: ["account", "profile", "member", "client", "identity"],
  data: ["info", "payload", "result", "dto", "model"],
  error: ["exception", "failure", "fault", "issue"],
  start: ["init", "begin", "launch", "setup"],
  stop: ["end", "terminate", "halt", "finish"],
};

// --- Helper Functions ---

function splitIntoWords(name) {
  if (!name.trim()) return [];
  const normalized = name
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return normalized.split(/\s+/).map(w => w.toLowerCase()).filter(Boolean);
}

function applyConvention(words, convention) {
  if (words.length === 0) return "";
  switch(convention) {
    case "camelCase":
      return words.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join("");
    case "PascalCase":
      return words.map(w => w[0].toUpperCase() + w.slice(1)).join("");
    case "snake_case":
      return words.join("_");
    case "SCREAMING_SNAKE_CASE":
      return words.join("_").toUpperCase();
    case "kebab-case":
      return words.join("-");
    default: return words.join("");
  }
}

function performAudit(name, type, lang) {
  const findings = [];
  const words = splitIntoWords(name);
  const lower = name.toLowerCase();
  
  if (words.length === 1 && ["data", "info", "item", "val"].includes(words[0])) {
    findings.push("Too generic: specify what kind of data.");
  }
  if (name.length < 3 && !["i", "j", "x", "y"].includes(name)) {
    findings.push("Too short: clarity might suffer.");
  }
  if (name.length > 30) {
    findings.push("Exceedingly long: consider abbreviating.");
  }
  if (type === "variable" && /\d/.test(name)) {
    findings.push("Avoid numbers in variable names.");
  }
  
  // Scoring dimensions
  const scores = {
    clarity: words.length > 1 ? 90 : 40,
    convention: 100, // will be adjusted
    concision: name.length > 25 ? 50 : 100,
    context: 80
  };

  let status = findings.length === 0 ? "good" : (findings.length === 1 ? "warning" : "error");
  
  return { status, findings, scores };
}

self.onmessage = function(e) {
  try {
    const { action, payload } = e.data;
    
    if (action === "generate") {
      const { context, type, language } = payload;
      const baseWords = splitIntoWords(context);
      const suggestions = [];
      const seen = new Set();

      const conventions = TYPE_CONVENTIONS[type] || ["camelCase"];
      
      // Add variations with synonyms
      const variations = [baseWords];
      if (baseWords.length > 0 && TECH_SYNONYMS[baseWords[0]]) {
        TECH_SYNONYMS[baseWords[0]].slice(0, 2).forEach(syn => {
          variations.push([syn, ...baseWords.slice(1)]);
        });
      }

      for (const variation of variations) {
        for (const conv of conventions) {
          const name = applyConvention(variation, conv);
          if (seen.has(name)) continue;
          seen.add(name);

          const audit = performAudit(name, type, language);
          const totalScore = Math.round((audit.scores.clarity + audit.scores.convention + audit.scores.concision) / 3);

          suggestions.push({
            id: crypto.randomUUID(),
            name,
            convention: conv,
            score: totalScore,
            reasoning: \`Optimized for \${type} in \${language}\`,
            audit
          });
        }
      }

      self.postMessage({
        type: 'success',
        result: {
          id: crypto.randomUUID(),
          context,
          type,
          suggestions: suggestions.sort((a, b) => b.score - a.score).slice(0, 10),
          timestamp: new Date().toISOString()
        }
      });
    } else if (action === "convert") {
      const { name } = payload;
      const words = splitIntoWords(name);
      const conversions = {
        camelCase: applyConvention(words, "camelCase"),
        PascalCase: applyConvention(words, "PascalCase"),
        snake_case: applyConvention(words, "snake_case"),
        SCREAMING_SNAKE_CASE: applyConvention(words, "SCREAMING_SNAKE_CASE"),
        "kebab-case": applyConvention(words, "kebab-case"),
      };
      self.postMessage({ type: 'success', result: { original: name, conversions } });
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
`;
