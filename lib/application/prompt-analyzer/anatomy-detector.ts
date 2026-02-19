import type { PromptDimension, AnatomyElement } from "@/types/prompt-analyzer";

export const ANATOMY_WEIGHTS: Record<AnatomyElement, number> = {
  role: 15,
  task: 20,
  context: 12,
  steps: 15,
  format: 15,
  constraints: 13,
  clarification: 10,
};

// --- 1. Role / Persona ---
function detectRole(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  const rolePatterns: RegExp[] = [
    /(?:act\s+as|you\s+are)\s+(?:a|an)\s+([^.!?\n]{3,80})/i,
    /(?:act[uú]a?\s+como|eres\s+(?:un|una))\s+([^.!?\n]{3,80})/i,
    /<role>\s*([\s\S]*?)\s*<\/role>/i,
    /(?:role|persona)\s*:\s*([^.\n]{3,80})/i,
  ];

  for (const pattern of rolePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      evidence = match[0].trim().slice(0, 100);
      const roleText = (match[1] ?? "").toLowerCase();

      if (/(?:senior|lead|principal|expert|specialist|experienced|staff)/.test(roleText)) {
        score = 100;
      } else if (/(?:developer|engineer|architect|designer|writer|editor|consultant|analyst|scientist|teacher|coach|mentor|reviewer|tester|researcher|strategist|planner)/.test(roleText)) {
        score = 80;
      } else if (/(?:assistant|helper|bot|ai\b|chatbot)/.test(roleText)) {
        score = 30;
      } else {
        score = 60;
      }
      break;
    }
  }

  return {
    id: "role",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.role,
  };
}

// --- 2. Task / Objective ---
function detectTask(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  const taskPatterns: RegExp[] = [
    /<task>\s*([\s\S]*?)\s*<\/task>/i,
    /(?:task|objective|goal)\s*:\s*([^.\n]{5,})/i,
    /(?:please\s+)?(?:write|create|build|implement|design|develop|generate|analyze|explain|summarize|translate|convert|fix|debug|refactor|optimize|review|test|provide|list|describe|compare|evaluate)\s+([^.!?\n]{5,})/i,
    /(?:haz(?:me)?|escribe|crea|construye|implementa|dise[nñ]a|desarrolla|genera|analiza|explica|resume|traduce|convierte|arregla|realiza|elabora|prepara|configura|programa)\s+([^.!?\n]{5,})/i,
  ];

  for (const pattern of taskPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      evidence = match[0].trim().slice(0, 120);
      const taskText = (match[1] ?? match[0]).toLowerCase();

      const hasSpecificNoun = /(?:function|api|endpoint|component|page|database|query|algorithm|script|class|module|service|interface|schema|route|migration|pipeline|workflow|test|suite|form|modal|table|chart|dashboard|middleware|handler|controller|model|view|template|hook|reducer|store|config)/.test(taskText);
      const hasTechnology = /(?:react|next\.?js|typescript|javascript|python|java|go|rust|c\+\+|node|express|django|flask|spring|laravel|sql|graphql|rest|grpc|redis|mongo|postgres(?:ql)?|docker|kubernetes|aws|gcp|azure|tailwind|svelte|vue|angular)/.test(taskText);
      const hasVagueTerms = /(?:something|stuff|things?\b|whatever|anything|somehow|algo\b)/.test(taskText);

      if (hasVagueTerms) {
        score = Math.max(score, 25);
      } else if (hasSpecificNoun && hasTechnology) {
        score = Math.max(score, 95);
      } else if (hasSpecificNoun) {
        score = Math.max(score, 80);
      } else if (hasTechnology) {
        score = Math.max(score, 70);
      } else if (taskText.length > 50) {
        score = Math.max(score, 60);
      } else if (taskText.length >= 30) {
        score = Math.max(score, 45);
      } else {
        score = Math.max(score, 25);
      }
      break;
    }
  }

  // Fallback: prompt has content but no recognized task verb
  if (score === 0 && prompt.trim().length > 0) {
    if (/\b(?:write|create|make|build|do|tell|show|help|give|find|get|provide|list|describe)\b/i.test(prompt)) {
      score = 20;
      evidence = prompt.slice(0, 80);
    } else if (prompt.trim().length >= 10) {
      score = 10;
    }
  }

  return {
    id: "task",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.task,
  };
}

// --- 3. Context ---
function detectContext(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  const contextPatterns: RegExp[] = [
    /<context>\s*([\s\S]*?)\s*<\/context>/i,
    /(?:context|background)\s*:\s*([^\n]{5,})/i,
    /(?:given\s+(?:that|the\s+context(?:\s+of)?|a|an))\s+([^.!?\n,]{3,})/i,
    /(?:in\s+the\s+context\s+of)\s+([^.!?\n,]{3,})/i,
    /(?:assuming|scenario|currently|dado\s+(?:que|el\s+contexto))\s*:?\s+([^.!?\n]{5,})/i,
  ];

  for (const pattern of contextPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      evidence = match[0].trim().slice(0, 120);
      const contextText = (match[1] ?? "").trim();

      if (contextText.length > 100) {
        score = 90;
      } else if (contextText.length > 50) {
        score = 75;
      } else if (contextText.length > 10) {
        score = 55;
      } else {
        score = 35;
      }
      break;
    }
  }

  // Technology mentions as implicit context
  const techMentions = prompt.match(/\b(?:react|next\.?js|typescript|javascript|python|java|go|rust|c\+\+|node|express|django|flask|spring|laravel|rails|vue|angular|svelte|tailwind|bootstrap|postgres(?:ql)?|mysql|mongo|redis|docker|kubernetes|aws|gcp|azure|vercel|netlify|firebase|supabase)\b/gi);
  if (techMentions && techMentions.length > 0) {
    const techScore = Math.min(50, techMentions.length * 15);
    if (techScore > score) {
      score = techScore;
      if (!evidence) {
        evidence = `Technologies: ${[...new Set(techMentions.map(t => t.toLowerCase()))].join(", ")}`;
      }
    }
  }

  // Domain context
  if (/\b(?:e-?commerce|healthcare|fintech|education|social\s+media|enterprise|startup|saas|microservice|monolith)\b/i.test(prompt)) {
    score = Math.max(score, 50);
  }

  // Audience specification enriches context
  if (/\b(?:beginner|junior|expert|senior|developer|user|student|professional|audience|reader|cliente|usuario)\b/i.test(prompt)) {
    score = Math.min(100, score + 15);
  }

  // Generic "given the context" reference
  if (score === 0 && /\b(?:given\s+the\s+context|in\s+this\s+context)\b/i.test(prompt)) {
    score = 25;
    evidence = "Generic context reference";
  }

  return {
    id: "context",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.context,
  };
}

// --- 4. Steps / Instructions ---
function detectSteps(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  // XML tags
  const stepsXml = prompt.match(/<(?:steps|instructions)>\s*([\s\S]*?)\s*<\/(?:steps|instructions)>/i);
  if (stepsXml) {
    score = 90;
    evidence = stepsXml[0].slice(0, 120);
  }

  // Numbered steps (e.g., "1. ...", "Step 1:", etc.)
  const lineStartSteps = prompt.match(/(?:^|\n)\s*(?:\d+[.)]\s+)/gim);
  if (lineStartSteps && lineStartSteps.length >= 2) {
    score = Math.max(score, 90);
    evidence = evidence ?? `${lineStartSteps.length} numbered steps detected`;
  }

  // Inline step markers (e.g., "Step 1: ...", "Paso 1: ...")
  const inlineSteps = prompt.match(/\bstep\s+\d+\b/gi);
  if (inlineSteps && inlineSteps.length >= 2) {
    score = Math.max(score, 90);
    evidence = evidence ?? `${inlineSteps.length} step markers detected`;
  }

  // Sequential markers: first...then...finally
  const hasFirst = /\b(?:first|primero)\b/i.test(prompt);
  const hasThen = /\b(?:then|next|second|después|luego)\b/i.test(prompt);
  const hasFinally = /\b(?:finally|lastly|last|third|finalmente|por\s+último)\b/i.test(prompt);

  const sequentialCount = [hasFirst, hasThen, hasFinally].filter(Boolean).length;
  if (sequentialCount >= 3) {
    score = Math.max(score, 90);
    evidence = evidence ?? "Sequential markers (first/then/finally)";
  } else if (sequentialCount >= 2) {
    score = Math.max(score, 80);
    evidence = evidence ?? "Sequential markers detected";
  } else if (sequentialCount === 1) {
    score = Math.max(score, 50);
    evidence = evidence ?? "Single sequential marker";
  }

  // "Step by step" phrase
  if (/\bstep[\s-]*by[\s-]*step\b/i.test(prompt)) {
    score = Math.max(score, 60);
    evidence = evidence ?? "Step-by-step instruction";
  }

  // Bullet points
  const bullets = prompt.match(/(?:^|\n)\s*[-*]\s+.{5,}/gm);
  if (bullets && bullets.length >= 2) {
    score = Math.max(score, 70);
    evidence = evidence ?? `${bullets.length} bullet points detected`;
  }

  return {
    id: "steps",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.steps,
  };
}

// --- 5. Output Format ---
function detectFormat(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  // XML tags
  const formatXml = prompt.match(/<(?:output_format|format)>\s*([\s\S]*?)\s*<\/(?:output_format|format)>/i);
  if (formatXml) {
    score = 90;
    evidence = formatXml[0].slice(0, 120);
  }

  // Specific format types
  const formatMatch = prompt.match(/\b(?:json|markdown|md|table|csv|yaml|yml|xml|html|bullet\s*points?|code\s*block|typescript|plain\s*text|diagram|flowchart|lista|tabla)\b/i);
  if (formatMatch) {
    score = Math.max(score, 80);
    evidence = evidence ?? `Format: ${formatMatch[0]}`;
  }

  // Output instruction phrases
  if (/\b(?:format\s+(?:the\s+)?(?:output|response|result)|respond\s+(?:in|with|as)|return\s+(?:as|in)|provide\s+(?:the\s+)?(?:output|result)\s+(?:as|in)|output\s+(?:as|in|format))\b/i.test(prompt)) {
    score = Math.max(score, 60);
    evidence = evidence ?? "Output instruction phrase detected";
  }

  // Generic format mention
  if (score === 0 && /\b(?:format|formatted|structure|structured|organize|organized)\b/i.test(prompt)) {
    score = 20;
    evidence = "Generic format mention";
  }

  return {
    id: "format",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.format,
  };
}

// --- 6. Constraints / Restrictions ---
function detectConstraints(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;
  const constraintSignals: string[] = [];

  // Negative constraints
  const negativeMatches = prompt.match(/\b(?:avoid|do\s+not|don['']t|never|must\s+not|should\s+not|no\s+(?:uses?|usar)|evita|no\s+utilices)\b/gi);
  if (negativeMatches) {
    constraintSignals.push(...negativeMatches.map(c => c.trim()));
  }

  // Limit constraints
  const limitMatches = prompt.match(/\b(?:limit\s+to|maximum|at\s+most|no\s+more\s+than|within|keep\s+(?:it\s+)?(?:under|below)|máximo|como\s+máximo)\b/gi);
  if (limitMatches) {
    constraintSignals.push(...limitMatches.map(c => c.trim()));
  }

  // Quality constraints
  const qualityMatches = prompt.match(/\b(?:ensure|must\b|should\b|require|comply|follow|adhere|wcag|accessible|secure|performant|efficient|asegura|debe|requiere)\b/gi);
  if (qualityMatches) {
    constraintSignals.push(...qualityMatches.map(c => c.trim()));
  }

  // Style constraints
  const styleMatches = prompt.match(/\b(?:tone|style|formal|informal|professional|casual|concise|brief|detailed|tono|estilo)\b/gi);
  if (styleMatches) {
    constraintSignals.push(...styleMatches.map(c => c.trim()));
  }

  const uniqueConstraints = [...new Set(constraintSignals.map(c => c.toLowerCase()))];

  if (uniqueConstraints.length >= 4) {
    score = 100;
  } else if (uniqueConstraints.length === 3) {
    score = 80;
  } else if (uniqueConstraints.length === 2) {
    score = 65;
  } else if (uniqueConstraints.length === 1) {
    score = 40;
  }

  if (uniqueConstraints.length > 0) {
    evidence = uniqueConstraints.slice(0, 4).join(", ");
  }

  return {
    id: "constraints",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.constraints,
  };
}

// --- 7. Clarification Clause ---
function detectClarification(prompt: string): PromptDimension {
  let score = 0;
  let evidence: string | null = null;

  const clarificationPatterns: RegExp[] = [
    /(?:if\s+(?:anything|something)\s+is\s+unclear|if\s+(?:you(?:'re|\s+are)\s+)?(?:unsure|uncertain|not\s+sure))/i,
    /(?:feel\s+free\s+to\s+ask|ask\s+(?:me\s+)?(?:before|if)|don['']t\s+(?:hesitate|assume))/i,
    /(?:before\s+(?:you\s+)?(?:proceed|start|begin|code|implement)|clarify\s+(?:first|before))/i,
    /(?:si\s+(?:no\s+(?:entiendes|est[aá]s?\s+seguro)|algo\s+no\s+queda\s+claro)|pregunta|no\s+asumas)/i,
    /(?:if\s+you\s+need\s+(?:more\s+)?(?:information|details|context|clarification))/i,
    /(?:verify\s+(?:with\s+me|before)|check\s+with\s+me|confirm\s+before)/i,
  ];

  for (const pattern of clarificationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      score = 100;
      evidence = match[0].trim().slice(0, 80);
      break;
    }
  }

  return {
    id: "clarification",
    detected: score >= 30,
    score,
    evidence,
    weight: ANATOMY_WEIGHTS.clarification,
  };
}

// --- Main detector ---
export function detectAnatomy(prompt: string): PromptDimension[] {
  return [
    detectRole(prompt),
    detectTask(prompt),
    detectContext(prompt),
    detectSteps(prompt),
    detectFormat(prompt),
    detectConstraints(prompt),
    detectClarification(prompt),
  ];
}

export function calculateAnatomyScore(dimensions: PromptDimension[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dim of dimensions) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
