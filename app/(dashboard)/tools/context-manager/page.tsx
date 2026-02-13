"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { Plus, Trash2, Download, FolderPlus, FileText, BookOpen } from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import type { DocumentType, Priority } from "@/types/context-manager";

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
  medium: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const TYPE_COLORS: Record<DocumentType, string> = {
  code: "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  documentation: "bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  api: "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  notes: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
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
  const { t } = useTranslation();

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
    addToast(t("ctxMgr.toastCreated"), "success");
  };

  const handleAddDocument = () => {
    if (!docForm.title.trim() || !docForm.content.trim()) {
      addToast(t("ctxMgr.toastFillIn"), "warning");
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
    addToast(t("ctxMgr.toastDocAdded"), "success");
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
    addToast(t("ctxMgr.toastExported", { format: format.toUpperCase() }), "success");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <ToolHeader
        title={t("ctxMgr.title")}
        description={t("ctxMgr.description")}
        breadcrumb
        actions={
          <Button onPress={() => setShowCreateWindow(true)} aria-expanded={showCreateWindow} className="gap-2">
            <FolderPlus className="size-4" />
            {t("ctxMgr.newWindow")}
          </Button>
        }
      />

      {/* Create Window Form */}
      {showCreateWindow && (
        <Card className="border-2 border-primary/30 p-4">
          <div className="flex gap-3">
            <label htmlFor="new-window-name" className="sr-only">{t("ctxMgr.windowName")}</label>
            <input
              id="new-window-name"
              type="text"
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              placeholder={t("ctxMgr.windowPlaceholder")}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateWindow()}
            />
            <Button size="sm" onPress={handleCreateWindow}>
              {t("ctxMgr.create")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowCreateWindow(false)}
            >
              {t("common.cancel")}
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
                {t("ctxMgr.windows")}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-1 p-0">
              {windows.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("ctxMgr.noWindows")}
                </p>
              ) : (
                windows.map((window) => (
                  <button
                    key={window.id}
                    type="button"
                    onClick={() => setActiveWindowId(window.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                      window.id === activeWindowId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="truncate text-sm font-medium">
                      {window.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {window.documents.length}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWindow(window.id);
                          addToast(t("ctxMgr.toastWindowDeleted"), "info");
                        }}
                        className="text-muted-foreground transition-colors hover:text-red-500"
                        aria-label={t("ctxMgr.deleteWindowLabel", { name: window.name })}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </span>
                  </button>
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
                    {t("ctxMgr.documents", { count: activeWindow.documents.length, tokens: activeWindow.totalTokens.toLocaleString() })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowAddDoc(true)}
                    aria-expanded={showAddDoc}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    {t("ctxMgr.addDocument")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("xml")}
                    className="gap-2"
                  >
                    <Download className="size-4" />
                    {t("ctxMgr.formatXml")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("json")}
                  >
                    {t("ctxMgr.formatJson")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleExport("markdown")}
                  >
                    {t("ctxMgr.formatMd")}
                  </Button>
                </div>
              </div>

              {/* Utilization Bar */}
              <Card className="p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{t("ctxMgr.contextUtilization")}</span>
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
                    <Card.Title>{t("ctxMgr.newDocument")}</Card.Title>
                  </Card.Header>
                  <Card.Content className="space-y-3 p-0">
                    <div>
                      <label htmlFor="doc-title" className="mb-1 block text-sm font-medium text-muted-foreground">
                        {t("ctxMgr.docTitle")}
                      </label>
                      <input
                        id="doc-title"
                        type="text"
                        value={docForm.title}
                        onChange={(e) =>
                          setDocForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder={t("ctxMgr.docTitlePlaceholder")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-muted-foreground">
                          {t("ctxMgr.docType")}
                        </label>
                        <select
                          id="doc-type"
                          value={docForm.type}
                          onChange={(e) =>
                            setDocForm((prev) => ({
                              ...prev,
                              type: e.target.value as DocumentType,
                            }))
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        >
                          <option value="code">{t("ctxMgr.typeCode")}</option>
                          <option value="documentation">{t("ctxMgr.typeDocumentation")}</option>
                          <option value="api">{t("ctxMgr.typeApi")}</option>
                          <option value="notes">{t("ctxMgr.typeNotes")}</option>
                          <option value="other">{t("ctxMgr.typeOther")}</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="doc-priority" className="mb-1 block text-sm font-medium text-muted-foreground">
                          {t("ctxMgr.docPriority")}
                        </label>
                        <select
                          id="doc-priority"
                          value={docForm.priority}
                          onChange={(e) =>
                            setDocForm((prev) => ({
                              ...prev,
                              priority: e.target.value as Priority,
                            }))
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        >
                          <option value="high">{t("ctxMgr.priorityHigh")}</option>
                          <option value="medium">{t("ctxMgr.priorityMedium")}</option>
                          <option value="low">{t("ctxMgr.priorityLow")}</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="doc-tags" className="mb-1 block text-sm font-medium text-muted-foreground">
                          {t("ctxMgr.docTags")}
                        </label>
                        <input
                          id="doc-tags"
                          type="text"
                          value={docForm.tags}
                          onChange={(e) =>
                            setDocForm((prev) => ({ ...prev, tags: e.target.value }))
                          }
                          placeholder={t("ctxMgr.docTagsPlaceholder")}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="doc-content" className="mb-1 block text-sm font-medium text-muted-foreground">
                        {t("ctxMgr.docContent")}
                      </label>
                      <textarea
                        id="doc-content"
                        value={docForm.content}
                        onChange={(e) =>
                          setDocForm((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder={t("ctxMgr.docContentPlaceholder")}
                        className="h-32 w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowAddDoc(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button size="sm" onPress={handleAddDocument}>
                        {t("ctxMgr.add")}
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
                              {t("common.tokens", { count: doc.tokenCount })}
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
                            <option value="high">{t("ctxMgr.priorityHighShort")}</option>
                            <option value="medium">{t("ctxMgr.priorityMediumShort")}</option>
                            <option value="low">{t("ctxMgr.priorityLowShort")}</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              removeDocument(doc.id);
                              addToast(t("ctxMgr.toastDocRemoved"), "info");
                            }}
                            className="text-muted-foreground transition-colors hover:text-red-500"
                            aria-label={t("ctxMgr.removeDocLabel", { name: doc.title })}
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
                    <FileText className="mx-auto mb-3 size-10 text-muted-foreground" />
                    <p className="text-foreground">{t("ctxMgr.noDocuments")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("ctxMgr.noDocumentsHint")}
                    </p>
                  </Card.Content>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-16">
              <Card.Content className="p-0 text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-lg text-foreground">{t("ctxMgr.noWindowsEmpty")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("ctxMgr.noWindowsHint")}
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
