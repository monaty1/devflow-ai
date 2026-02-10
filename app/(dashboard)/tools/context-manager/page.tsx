"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { Plus, Trash2, Download, FolderPlus } from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import type { DocumentType, Priority } from "@/types/context-manager";

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200",
};

const TYPE_COLORS: Record<DocumentType, string> = {
  code: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
  documentation: "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200",
  api: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200",
  notes: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
  other: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200",
};

export default function ContextManagerPage() {
  const {
    windows,
    activeWindow,
    activeWindowId,
    setActiveWindowId,
    createWindow,
    deleteWindow,
    addDocument,
    removeDocument,
    changePriority,
    exportWindow,
  } = useContextManager();
  const { addToast } = useToast();

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showCreateWindow, setShowCreateWindow] = useState(false);
  const [newWindowName, setNewWindowName] = useState("");
  const [docForm, setDocForm] = useState({
    title: "",
    content: "",
    type: "code" as DocumentType,
    priority: "medium" as Priority,
    tags: "",
  });

  const handleCreateWindow = () => {
    if (!newWindowName.trim()) return;
    createWindow(newWindowName.trim());
    setNewWindowName("");
    setShowCreateWindow(false);
    addToast("Context window created!", "success");
  };

  const handleAddDocument = () => {
    if (!docForm.title.trim() || !docForm.content.trim()) {
      addToast("Fill in title and content", "warning");
      return;
    }
    addDocument(
      docForm.title,
      docForm.content,
      docForm.type,
      docForm.priority,
      docForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    );
    setDocForm({
      title: "",
      content: "",
      type: "code",
      priority: "medium",
      tags: "",
    });
    setShowAddDoc(false);
    addToast("Document added!", "success");
  };

  const handleExport = (format: "xml" | "json" | "markdown") => {
    const exported = exportWindow(format);
    if (!exported) return;

    const blob = new Blob([exported.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exported.filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported as ${format.toUpperCase()}!`, "success");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Context Manager
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organize and export your LLM context windows
          </p>
        </div>
        <Button onPress={() => setShowCreateWindow(true)} className="gap-2">
          <FolderPlus className="size-4" />
          New Window
        </Button>
      </div>

      {/* Create Window Form */}
      {showCreateWindow && (
        <Card className="border-2 border-primary/30 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              placeholder="Window name..."
              aria-label="New window name"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateWindow()}
            />
            <Button size="sm" onPress={handleCreateWindow}>
              Create
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowCreateWindow(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Windows Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <Card.Header className="mb-3 p-0">
              <Card.Title className="text-sm uppercase text-muted-foreground">
                Windows
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-1 p-0">
              {windows.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No windows yet
                </p>
              ) : (
                windows.map((window) => (
                  <div
                    key={window.id}
                    onClick={() => setActiveWindowId(window.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      window.id === activeWindowId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="truncate text-sm font-medium">
                      {window.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {window.documents.length}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWindow(window.id);
                          addToast("Window deleted", "info");
                        }}
                        className="text-muted-foreground transition-colors hover:text-red-500"
                        aria-label={`Delete window ${window.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {activeWindow ? (
            <>
              {/* Window Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{activeWindow.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeWindow.documents.length} documents ·{" "}
                    {activeWindow.totalTokens.toLocaleString()} tokens
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowAddDoc(true)}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Add Document
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("xml")}
                    className="gap-2"
                  >
                    <Download className="size-4" />
                    XML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("json")}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("markdown")}
                  >
                    MD
                  </Button>
                </div>
              </div>

              {/* Utilization Bar */}
              <Card className="p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Context Utilization</span>
                  <span className="text-muted-foreground">
                    {activeWindow.totalTokens.toLocaleString()} /{" "}
                    {activeWindow.maxTokens.toLocaleString()} tokens (
                    {activeWindow.utilizationPercentage}%)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      activeWindow.utilizationPercentage >= 80
                        ? "bg-red-500"
                        : activeWindow.utilizationPercentage >= 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(activeWindow.utilizationPercentage, 100)}%`,
                    }}
                  />
                </div>
              </Card>

              {/* Add Document Form */}
              {showAddDoc && (
                <Card className="border-2 border-primary/30 p-6">
                  <Card.Header className="mb-4 p-0">
                    <Card.Title>New Document</Card.Title>
                  </Card.Header>
                  <Card.Content className="space-y-3 p-0">
                    <input
                      type="text"
                      value={docForm.title}
                      onChange={(e) =>
                        setDocForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Document title..."
                      aria-label="Document title"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={docForm.type}
                        aria-label="Document type"
                        onChange={(e) =>
                          setDocForm((prev) => ({
                            ...prev,
                            type: e.target.value as DocumentType,
                          }))
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="code">Code</option>
                        <option value="documentation">Documentation</option>
                        <option value="api">API</option>
                        <option value="notes">Notes</option>
                        <option value="other">Other</option>
                      </select>
                      <select
                        value={docForm.priority}
                        aria-label="Document priority"
                        onChange={(e) =>
                          setDocForm((prev) => ({
                            ...prev,
                            priority: e.target.value as Priority,
                          }))
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <input
                        type="text"
                        value={docForm.tags}
                        onChange={(e) =>
                          setDocForm((prev) => ({ ...prev, tags: e.target.value }))
                        }
                        placeholder="Tags (comma separated)"
                        aria-label="Document tags"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <textarea
                      value={docForm.content}
                      onChange={(e) =>
                        setDocForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                      placeholder="Document content..."
                      aria-label="Document content"
                      className="h-32 w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowAddDoc(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onPress={handleAddDocument}>
                        Add
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              )}

              {/* Documents List */}
              {activeWindow.documents.length > 0 ? (
                <div className="space-y-3">
                  {activeWindow.documents.map((doc) => (
                    <Card key={doc.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{doc.title}</h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${TYPE_COLORS[doc.type]}`}
                            >
                              {doc.type}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {doc.content}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {doc.tokenCount} tokens
                            </span>
                            {doc.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <select
                            value={doc.priority}
                            aria-label={`Priority for ${doc.title}`}
                            onChange={(e) =>
                              changePriority(doc.id, e.target.value as Priority)
                            }
                            className={`cursor-pointer rounded-full border-0 px-2 py-1 text-xs ${PRIORITY_COLORS[doc.priority]}`}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              removeDocument(doc.id);
                              addToast("Document removed", "info");
                            }}
                            className="text-muted-foreground transition-colors hover:text-red-500"
                            aria-label={`Remove document ${doc.title}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12">
                  <Card.Content className="p-0 text-center">
                    <p className="mb-3 text-4xl">📄</p>
                    <p className="text-foreground">No documents yet</p>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add Document&quot; to start building your context
                    </p>
                  </Card.Content>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-16">
              <Card.Content className="p-0 text-center">
                <p className="mb-4 text-5xl">📚</p>
                <p className="text-lg text-foreground">No context windows</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new window to start organizing your context
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
