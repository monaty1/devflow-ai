import { describe, it, expect, beforeEach } from "vitest";
import {
  createDocument,
  createContextWindow,
  addDocumentToWindow,
  removeDocumentFromWindow,
  reorderDocuments,
  exportContext,
} from "@/lib/application/context-manager";
import type { ContextWindow } from "@/types/context-manager";

describe("Context Manager", () => {
  describe("createDocument", () => {
    it("should create a document with correct properties", () => {
      const doc = createDocument(
        "Test Document",
        "This is the content",
        "code",
        "high",
        ["react", "typescript"]
      );

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe("Test Document");
      expect(doc.content).toBe("This is the content");
      expect(doc.type).toBe("code");
      expect(doc.priority).toBe("high");
      expect(doc.tags).toEqual(["react", "typescript"]);
      expect(doc.tokenCount).toBeGreaterThan(0);
      expect(doc.createdAt).toBeDefined();
    });

    it("should estimate tokens correctly", () => {
      const shortDoc = createDocument("Short", "Hi", "notes", "low", []);
      const longDoc = createDocument(
        "Long",
        "This is a much longer content that should have more tokens than the short one",
        "notes",
        "low",
        []
      );

      expect(longDoc.tokenCount).toBeGreaterThan(shortDoc.tokenCount);
    });
  });

  describe("createContextWindow", () => {
    it("should create a window with default max tokens", () => {
      const window = createContextWindow("Test Window");

      expect(window.id).toBeDefined();
      expect(window.name).toBe("Test Window");
      expect(window.documents).toEqual([]);
      expect(window.totalTokens).toBe(0);
      expect(window.maxTokens).toBe(128000);
      expect(window.utilizationPercentage).toBe(0);
      expect(window.createdAt).toBeDefined();
    });

    it("should allow custom max tokens", () => {
      const window = createContextWindow("Custom Window", 32000);

      expect(window.maxTokens).toBe(32000);
    });
  });

  describe("addDocumentToWindow", () => {
    it("should add document and recalculate totals", () => {
      const window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content here", "code", "medium", []);

      const updated = addDocumentToWindow(window, doc);

      expect(updated.documents).toHaveLength(1);
      expect(updated.totalTokens).toBe(doc.tokenCount);
      // Utilization is very small for short content, just check it's defined
      expect(updated.utilizationPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should accumulate tokens when adding multiple documents", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content one", "code", "high", []);
      const doc2 = createDocument("Doc2", "Content two", "api", "medium", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);

      expect(window.documents).toHaveLength(2);
      expect(window.totalTokens).toBe(doc1.tokenCount + doc2.tokenCount);
    });
  });

  describe("removeDocumentFromWindow", () => {
    it("should remove document and recalculate totals", () => {
      let window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content", "code", "medium", []);

      window = addDocumentToWindow(window, doc);
      window = removeDocumentFromWindow(window, doc.id);

      expect(window.documents).toHaveLength(0);
      expect(window.totalTokens).toBe(0);
    });

    it("should only remove specified document", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content one", "code", "high", []);
      const doc2 = createDocument("Doc2", "Content two", "api", "medium", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);
      window = removeDocumentFromWindow(window, doc1.id);

      expect(window.documents).toHaveLength(1);
      expect(window.documents[0]?.id).toBe(doc2.id);
    });
  });

  describe("reorderDocuments", () => {
    it("should change document priority", () => {
      let window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content", "code", "low", []);

      window = addDocumentToWindow(window, doc);
      window = reorderDocuments(window, doc.id, "high");

      expect(window.documents[0]?.priority).toBe("high");
    });

    it("should sort by priority after reorder", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content", "code", "low", []);
      const doc2 = createDocument("Doc2", "Content", "api", "low", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);
      window = reorderDocuments(window, doc2.id, "high");

      expect(window.documents[0]?.id).toBe(doc2.id);
    });
  });

  describe("exportContext", () => {
    let testWindow: ContextWindow;

    beforeEach(() => {
      testWindow = createContextWindow("Export Test");
      const doc = createDocument(
        "Test Doc",
        "Test content",
        "code",
        "high",
        ["tag1"]
      );
      testWindow = addDocumentToWindow(testWindow, doc);
    });

    describe("XML export", () => {
      it("should export as valid XML structure", () => {
        const exported = exportContext(testWindow, "xml");

        expect(exported.format).toBe("xml");
        expect(exported.filename).toBe("export-test-context.xml");
        expect(exported.content).toContain('<?xml version="1.0"');
        expect(exported.content).toContain("<context");
        expect(exported.content).toContain("<document");
        expect(exported.content).toContain("<title>Test Doc</title>");
        expect(exported.content).toContain("<![CDATA[Test content]]>");
      });

      it("should escape XML special characters", () => {
        let window = createContextWindow("XML Test");
        const doc = createDocument(
          "Title with <brackets>",
          "Content with & ampersand",
          "notes",
          "low",
          []
        );
        window = addDocumentToWindow(window, doc);

        const exported = exportContext(window, "xml");

        expect(exported.content).toContain("&lt;brackets&gt;");
        expect(exported.content).not.toContain("<brackets>");
      });
    });

    describe("JSON export", () => {
      it("should export as valid JSON", () => {
        const exported = exportContext(testWindow, "json");

        expect(exported.format).toBe("json");
        expect(exported.filename).toBe("export-test-context.json");

        const parsed = JSON.parse(exported.content);
        expect(parsed.name).toBe("Export Test");
        expect(parsed.documents).toHaveLength(1);
        expect(parsed.documents[0].title).toBe("Test Doc");
      });

      it("should include all document properties", () => {
        const exported = exportContext(testWindow, "json");
        const parsed = JSON.parse(exported.content);

        expect(parsed.documents[0]).toHaveProperty("title");
        expect(parsed.documents[0]).toHaveProperty("type");
        expect(parsed.documents[0]).toHaveProperty("priority");
        expect(parsed.documents[0]).toHaveProperty("content");
        expect(parsed.documents[0]).toHaveProperty("tags");
        expect(parsed.documents[0]).toHaveProperty("tokenCount");
      });
    });

    describe("Markdown export", () => {
      it("should export as markdown", () => {
        const exported = exportContext(testWindow, "markdown");

        expect(exported.format).toBe("markdown");
        expect(exported.filename).toBe("export-test-context.md");
        expect(exported.content).toContain("# Context: Export Test");
        expect(exported.content).toContain("## Test Doc");
        expect(exported.content).toContain("**Type:** code");
        expect(exported.content).toContain("```");
      });

      it("should include token statistics", () => {
        const exported = exportContext(testWindow, "markdown");

        expect(exported.content).toContain("**Total Tokens:**");
        // Check for max tokens value - locale formatting may vary
        expect(exported.content).toMatch(/128[,.]?000/);
      });
    });
  });
});
