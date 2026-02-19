import type {
  ContextDocument,
  DocumentType,
  Priority,
  ContextWindow,
  ExportedContext,
} from "@/types/context-manager";

const DEFAULT_MAX_TOKENS = 128000; // GPT-4 context window

// --- Model Presets ---

export interface ModelPreset {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  outputTokens: number;
}

export const MODEL_PRESETS: ModelPreset[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", maxTokens: 128000, outputTokens: 16384 },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", maxTokens: 128000, outputTokens: 16384 },
  { id: "o1", name: "o1", provider: "OpenAI", maxTokens: 200000, outputTokens: 100000 },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", maxTokens: 200000, outputTokens: 32000 },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", maxTokens: 200000, outputTokens: 16000 },
  { id: "claude-haiku-3.5", name: "Claude 3.5 Haiku", provider: "Anthropic", maxTokens: 200000, outputTokens: 8192 },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", maxTokens: 1048576, outputTokens: 8192 },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", maxTokens: 2097152, outputTokens: 8192 },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", maxTokens: 131072, outputTokens: 4096 },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", maxTokens: 128000, outputTokens: 8192 },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", maxTokens: 128000, outputTokens: 4096 },
  { id: "custom", name: "Custom", provider: "—", maxTokens: DEFAULT_MAX_TOKENS, outputTokens: 4096 },
];

export function getModelPreset(id: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((m) => m.id === id);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function createDocument(
  title: string,
  content: string,
  type: DocumentType,
  priority: Priority,
  tags: string[],
  filePath?: string,
  instructions?: string
): ContextDocument {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    type,
    priority,
    tags,
    tokenCount: estimateTokens(content),
    createdAt: new Date().toISOString(),
    filePath,
    instructions,
  };
}

export function createContextWindow(
  name: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): ContextWindow {
  return {
    id: crypto.randomUUID(),
    name,
    documents: [],
    totalTokens: 0,
    maxTokens,
    utilizationPercentage: 0,
    createdAt: new Date().toISOString(),
  };
}

function recalculateWindow(window: ContextWindow): ContextWindow {
  const totalTokens = window.documents.reduce(
    (sum, doc) => sum + doc.tokenCount,
    0
  );
  const utilizationPercentage = Math.round(
    (totalTokens / window.maxTokens) * 100
  );

  return {
    ...window,
    totalTokens,
    utilizationPercentage,
  };
}

export function addDocumentToWindow(
  window: ContextWindow,
  document: ContextDocument
): ContextWindow {
  const updated = {
    ...window,
    documents: [...window.documents, document],
  };
  return recalculateWindow(updated);
}

export function removeDocumentFromWindow(
  window: ContextWindow,
  documentId: string
): ContextWindow {
  const updated = {
    ...window,
    documents: window.documents.filter((doc) => doc.id !== documentId),
  };
  return recalculateWindow(updated);
}

export function reorderDocuments(
  window: ContextWindow,
  documentId: string,
  newPriority: Priority
): ContextWindow {
  const documents = window.documents.map((doc) =>
    doc.id === documentId ? { ...doc, priority: newPriority } : doc
  );

  // Sort by priority
  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  documents.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    ...window,
    documents,
  };
}

export function exportContext(
  window: ContextWindow,
  format: "xml" | "json" | "markdown"
): ExportedContext {
  let content: string;

  switch (format) {
    case "xml":
      content = exportAsXml(window);
      break;
    case "json":
      content = exportAsJson(window);
      break;
    case "markdown":
      content = exportAsMarkdown(window);
      break;
  }

  return {
    format,
    content,
    filename: `${window.name.toLowerCase().replace(/\s+/g, "-")}-context.${format === "markdown" ? "md" : format}`,
  };
}

function exportAsXml(window: ContextWindow): string {
  const docs = window.documents
    .map(
      (doc) => `  <document type="${doc.type}" priority="${doc.priority}">
    <title>${escapeXml(doc.title)}</title>
    <content><![CDATA[${doc.content}]]></content>
    <tags>${doc.tags.map((t) => `<tag>${escapeXml(t)}</tag>`).join("")}</tags>
    <tokens>${doc.tokenCount}</tokens>
  </document>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<context name="${escapeXml(window.name)}" totalTokens="${window.totalTokens}">
${docs}
</context>`;
}

export function stripComments(code: string, type: DocumentType): string {
  if (type !== "code") return code;

  // Remove multi-line comments first
  let result = code.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove single-line comments, but preserve URLs (http://, https://, ftp://)
  // Only match // when preceded by whitespace or at line start (not after : which indicates a URL)
  result = result.replace(/(?<=^|[\s;{}()])\/\/.*$/gm, "");

  // Remove empty lines left behind
  result = result.replace(/^\s*\n/gm, "");

  return result.trim();
}

export function generateTree(documents: ContextDocument[]): string {
  const paths = documents.map(d => d.filePath || d.title);
  interface TreeNode { [key: string]: TreeNode; }
  const tree: TreeNode = {};

  paths.forEach(path => {
    let current: TreeNode = tree;
    path.split("/").forEach(part => {
      if (!current[part]) current[part] = {};
      current = current[part] as TreeNode;
    });
  });

  function render(obj: TreeNode, indent: string = ""): string {
    let result = "";
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      result += `${indent}${isLast ? "└── " : "├── "}${key}\n`;
      const child = obj[key];
      if (child) result += render(child, indent + (isLast ? "    " : "│   "));
    });
    return result;
  }

  return render(tree);
}

export function exportForAI(window: ContextWindow, options: { stripComments?: boolean } = {}): string {
  const projectTree = generateTree(window.documents);

  const docs = window.documents
    .map(
      (doc) => {
        let content = doc.content;
        if (options.stripComments) {
          content = stripComments(content, doc.type);
        }
        return `<file path="${doc.filePath || doc.title}" type="${doc.type}">
${doc.instructions ? `<instructions>${doc.instructions}</instructions>\n` : ""}<content>
${content}
</content>
</file>`;
      }
    )
    .join("\n\n");

  return `I am providing context for a software development task. Please act as a Senior Software Engineer.

<project_hierarchy>
${projectTree}
</project_hierarchy>

<context_documents>
${docs}
</context_documents>

Please analyze the provided context and wait for my specific instructions.`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function exportAsJson(window: ContextWindow): string {
  return JSON.stringify(
    {
      name: window.name,
      totalTokens: window.totalTokens,
      maxTokens: window.maxTokens,
      utilizationPercentage: window.utilizationPercentage,
      documents: window.documents.map((doc) => ({
        title: doc.title,
        type: doc.type,
        priority: doc.priority,
        content: doc.content,
        tags: doc.tags,
        tokenCount: doc.tokenCount,
      })),
    },
    null,
    2
  );
}

function exportAsMarkdown(window: ContextWindow): string {
  const docs = window.documents
    .map(
      (doc) => `## ${doc.title}

**Type:** ${doc.type} | **Priority:** ${doc.priority} | **Tokens:** ${doc.tokenCount}
${doc.tags.length > 0 ? `**Tags:** ${doc.tags.join(", ")}` : ""}

\`\`\`
${doc.content}
\`\`\`
`
    )
    .join("\n---\n\n");

  return `# Context: ${window.name}

**Total Tokens:** ${window.totalTokens.toLocaleString()} / ${window.maxTokens.toLocaleString()} (${window.utilizationPercentage}%)

---

${docs}`;
}
