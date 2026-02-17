import type {
  ContextDocument,
  DocumentType,
  Priority,
  ContextWindow,
  ExportedContext,
} from "@/types/context-manager";

const DEFAULT_MAX_TOKENS = 128000; // GPT-4 context window

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

export function exportForAI(window: ContextWindow): string {
  const fileTree = window.documents
    .map(doc => `- ${doc.filePath || doc.title}`)
    .join("\n");

  const docs = window.documents
    .map(
      (doc) => `<file path="${doc.filePath || doc.title}" type="${doc.type}">
${doc.instructions ? `<instructions>${doc.instructions}</instructions>\n` : ""}<content>
${doc.content}
</content>
</file>`
    )
    .join("\n\n");

  return `I am providing context for a software development task. Please act as a Senior Software Engineer.

<project_map>
${fileTree}
</project_map>

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
