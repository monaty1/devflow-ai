"use client";

import { useState, useCallback, useRef } from "react";
import {
  AlertDialog,
  Chip,
  Input,
  Checkbox,
  TextArea,
  Select,
  Label,
  ListBox,
  Modal,
} from "@heroui/react";
import {
  Plus,
  Trash2,
  BookOpen,
  Coins,
  FileCode,
  FileText,
  FolderTree,
  Cpu,
  Upload,
  FilePlus2,
  ClipboardPaste,
  Eye,
  Search,
  Bug,
  Blocks,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { formatCost } from "@/lib/application/cost-calculator";
import { MODEL_PRESETS } from "@/lib/application/context-manager";
import { AI_MODELS } from "@/config/ai-models";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { ContextDocument as Document, Priority, DocumentType } from "@/types/context-manager";

export default function ContextManagerPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();
  const { optimizeContextWithAI, aiResult, isAILoading, aiError } = useAISuggest();
  const { isAIEnabled } = useAISettingsStore();
  const {
    windows,
    activeWindowId,
    activeWindow,
    createWindow,
    deleteWindow,
    setActiveWindowId,
    addDocument,
    removeDocument,
    changePriority,
    setMaxTokens,
    exportForAI,
  } = useContextManager();

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newWindowName, setNewWindowName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "document" | "window"; id: string; name: string } | null>(null);
  const [stripComments, setStripComments] = useState(true);

  // Preview modals
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showExportPreview, setShowExportPreview] = useState(false);

  // Controlled modal form state
  const [docTitle, setDocTitle] = useState("");
  const [docPath, setDocPath] = useState("");
  const [docType, setDocType] = useState<DocumentType>("code");
  const [docPriority, setDocPriority] = useState<Priority>("medium");
  const [docContent, setDocContent] = useState("");
  const [docInstructions, setDocInstructions] = useState("");

  const resetDocForm = () => {
    setDocTitle("");
    setDocPath("");
    setDocType("code");
    setDocPriority("medium");
    setDocContent("");
    setDocInstructions("");
  };

  // Auto-incremental window name
  const getNextWindowName = useCallback((): string => {
    const base = t("ctxMgr.autoWindowName");
    const existing = windows.map(w => w.name);
    if (!existing.includes(base)) return base;
    let i = 2;
    while (existing.includes(`${base} ${i}`)) i++;
    return `${base} ${i}`;
  }, [windows, t]);

  // Drag-and-drop file support
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const detectDocType = (filename: string): DocumentType => {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const codeExts = ["ts", "tsx", "js", "jsx", "py", "java", "go", "rs", "c", "cpp", "h", "cs", "rb", "php", "swift", "kt", "vue", "svelte", "css", "scss", "html"];
    const docExts = ["md", "mdx", "txt", "rst", "adoc"];
    const apiExts = ["json", "yaml", "yml", "graphql", "proto", "openapi"];
    if (codeExts.includes(ext)) return "code";
    if (docExts.includes(ext)) return "documentation";
    if (apiExts.includes(ext)) return "api";
    return "notes";
  };

  // Ingest handler — creates window if needed, returns target ID
  const ensureWindow = useCallback((): string => {
    if (activeWindowId) return activeWindowId;
    return createWindow(getNextWindowName());
  }, [activeWindowId, createWindow, getNextWindowName]);

  // Add files directly (skip modal)
  const addFilesDirectly = useCallback((files: { name: string; content: string; type: DocumentType }[], targetWindowId?: string) => {
    const wId = targetWindowId ?? activeWindowId;
    if (!wId) return;
    for (const file of files) {
      addDocument(file.name, file.content, file.type, "medium", [], file.name, undefined, wId);
    }
    if (files.length === 1) {
      addToast(t("ctxMgr.addedToContext", { title: files[0]?.name ?? "" }), "success");
    } else {
      addToast(t("ctxMgr.filesAdded", { count: String(files.length) }), "success");
    }
  }, [activeWindowId, addDocument, addToast, t]);

  const handleFiles = useCallback((fileList: FileList) => {
    const readPromises: Promise<{ name: string; content: string; type: DocumentType }>[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      readPromises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              content: (e.target?.result as string) || "",
              type: detectDocType(file.name),
            });
          };
          reader.onerror = () => {
            resolve({ name: file.name, content: "", type: "notes" as DocumentType });
          };
          reader.readAsText(file);
        })
      );
    }

    void Promise.all(readPromises).then((results) => {
      const valid = results.filter((r) => r.content.length > 0);
      if (valid.length === 0) return;

      const wId = ensureWindow();
      addFilesDirectly(valid, wId);
    });
  }, [ensureWindow, addFilesDirectly]);

  // Global drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) { dragCounter.current = 0; setIsDragging(false); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFiles]);

  const openFileBrowser = useCallback(() => { fileInputRef.current?.click(); }, []);

  const docColumns: ColumnConfig[] = [
    { name: t("table.colDocument"), uid: "title", sortable: true },
    { name: t("table.colTokens"), uid: "tokens", sortable: true },
    { name: t("table.colPriority"), uid: "priority", sortable: true },
    { name: t("table.colActions"), uid: "actions" },
  ];

  const renderDocCell = useCallback((doc: Document, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "title":
        return (
          <div
            className="flex items-center gap-2.5 cursor-pointer group/title"
            role="button"
            tabIndex={0}
            onClick={() => setPreviewDoc(doc)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPreviewDoc(doc); } }}
            aria-label={`${t("ctxMgr.preview")}: ${doc.title}`}
          >
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              {doc.type === "code" ? <FileCode className="size-3.5" /> : <FileText className="size-3.5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs truncate group-hover/title:text-primary transition-colors">{doc.title}</span>
              {doc.filePath && doc.filePath !== doc.title && (
                <span className="text-[10px] text-muted-foreground font-mono truncate">{doc.filePath}</span>
              )}
            </div>
          </div>
        );
      case "tokens": {
        const totalTokens = activeWindow?.totalTokens ?? 1;
        const pct = totalTokens > 0 ? Math.round((doc.tokenCount / totalTokens) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tabular-nums">{doc.tokenCount.toLocaleString()}</span>
            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{pct}%</span>
          </div>
        );
      }
      case "priority":
        return (
          <select
            value={doc.priority}
            onChange={(e) => changePriority(doc.id, e.target.value as Priority)}
            className="bg-transparent text-xs font-bold text-foreground border-none outline-none cursor-pointer dark:[color-scheme:dark] dark:[&_option]:bg-default-100 dark:[&_option]:text-foreground"
            aria-label={t("ctxMgr.priorityLabel")}
          >
            <option value="high">{t("ctxMgr.priorityHigh")}</option>
            <option value="medium">{t("ctxMgr.priorityMedium")}</option>
            <option value="low">{t("ctxMgr.priorityLow")}</option>
          </select>
        );
      case "actions":
        return (
          <Button isIconOnly size="sm" variant="ghost" onPress={() => setDeleteConfirm({ type: "document", id: doc.id, name: doc.title })} aria-label={t("ctxMgr.removeDocLabel2")}>
            <Trash2 className="size-3.5 text-danger" />
          </Button>
        );
      default:
        return String(doc[key as keyof typeof doc] ?? "");
    }
  }, [changePriority, t, activeWindow]);

  // Hidden file input
  const fileInputElement = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.c,.cpp,.h,.cs,.rb,.php,.swift,.kt,.vue,.svelte,.css,.scss,.html,.md,.mdx,.txt,.json,.yaml,.yml,.graphql,.proto,.rst,.adoc"
      className="hidden"
      onChange={handleFileInput}
      aria-hidden="true"
    />
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={BookOpen}
        gradient="from-blue-500 to-indigo-600"
        title={t("ctxMgr.title")}
        description={t("ctxMgr.description")}
        breadcrumb
      />

      <ToolSuggestions toolId="context-manager" input={activeWindow?.name || ""} output={""} />

      {fileInputElement}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar: Windows List */}
        <Card className="p-4 lg:col-span-3 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Input
              placeholder={t("ctxMgr.newWindowPlaceholder")}
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newWindowName) {
                  e.preventDefault();
                  createWindow(newWindowName);
                  setNewWindowName("");
                }
              }}
              variant="primary"
            />
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                if (newWindowName) {
                  createWindow(newWindowName);
                  setNewWindowName("");
                }
              }}
              className="font-bold text-primary text-xs"
            >
              <Plus className="size-3.5 mr-1" /> {t("ctxMgr.createWindowBtn")}
            </Button>
          </div>

          <div className="space-y-1.5 overflow-auto max-h-[600px] pr-1 scrollbar-hide">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">{t("ctxMgr.projectContexts")}</p>
            {windows.length === 0 && (
              <p className="text-xs text-muted-foreground/50 px-2 py-4 text-center italic">
                {t("ctxMgr.noWindowsHint")}
              </p>
            )}
            {windows.map((w) => (
              <div
                key={w.id}
                className={cn(
                  "group flex items-center justify-between p-2.5 rounded-lg transition-all border border-transparent",
                  activeWindowId === w.id
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveWindowId(w.id)}
                  className="flex flex-col min-w-0 flex-1 text-left bg-transparent border-none outline-none cursor-pointer"
                  aria-label={w.name}
                  aria-pressed={activeWindowId === w.id}
                >
                  <span className="text-xs font-bold truncate">{w.name}</span>
                  <span className="text-[10px] opacity-60">{w.documents.length} docs · {w.totalTokens.toLocaleString()} tok</span>
                </button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity size-6"
                  aria-label={t("ctxMgr.deleteWorkspace")}
                  onPress={() => setDeleteConfirm({ type: "window", id: w.id, name: w.name })}
                >
                  <Trash2 className="size-3 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Main Content — global drop zone */}
        <div
          className="lg:col-span-9 space-y-5 relative"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Global drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-background/80 shadow-xl">
                <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Upload className="size-7 text-primary animate-bounce" />
                </div>
                <p className="text-lg font-black text-primary">{t("ctxMgr.dropFilesHere")}</p>
                <p className="text-sm text-muted-foreground">{t("ctxMgr.dropOrBrowseHint")}</p>
              </div>
            </div>
          )}

          {activeWindow ? (
            <>
              {/* Dashboard Row — compact stats bar */}
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Model selector */}
                  <div className="flex items-center gap-2">
                    <Cpu className="size-3.5 text-muted-foreground shrink-0" />
                    <select
                      value={MODEL_PRESETS.find(m => m.maxTokens === activeWindow.maxTokens)?.id ?? "gpt-4o"}
                      onChange={(e) => {
                        const preset = MODEL_PRESETS.find(m => m.id === e.target.value);
                        if (preset) setMaxTokens(preset.maxTokens);
                      }}
                      className="bg-transparent text-xs font-bold text-foreground border-none outline-none cursor-pointer dark:[color-scheme:dark] dark:[&_option]:bg-default-100 dark:[&_option]:text-foreground"
                      aria-label={t("ctxMgr.modelPreset")}
                    >
                      {MODEL_PRESETS.filter(m => m.id !== "custom").map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({(m.maxTokens / 1000).toFixed(0)}K)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Divider */}
                  <div className="h-5 w-px bg-divider hidden sm:block" />

                  {/* Utilization */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg font-black",
                      activeWindow.utilizationPercentage > 90 ? "text-red-500" : activeWindow.utilizationPercentage > 60 ? "text-amber-500" : "text-emerald-500"
                    )}>{activeWindow.utilizationPercentage}%</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono leading-none">
                        {activeWindow.totalTokens.toLocaleString()} / {activeWindow.maxTokens.toLocaleString()}
                      </span>
                      <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            activeWindow.utilizationPercentage > 90 ? "bg-red-500" : activeWindow.utilizationPercentage > 60 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, activeWindow.utilizationPercentage)}%` }}
                        />
                      </div>
                    </div>
                    {/* Utilization warning chips */}
                    {activeWindow.utilizationPercentage > 100 && (
                      <Chip size="sm" variant="soft" color="danger" className="text-[10px] font-bold">{t("ctxMgr.overLimit")}</Chip>
                    )}
                    {activeWindow.utilizationPercentage > 80 && activeWindow.utilizationPercentage <= 100 && (
                      <Chip size="sm" variant="soft" color="warning" className="text-[10px] font-bold">{t("ctxMgr.nearLimit")}</Chip>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-5 w-px bg-divider hidden sm:block" />

                  {/* Cost */}
                  <div className="flex items-center gap-1.5">
                    <Coins className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-bold">
                      {formatCost((activeWindow.totalTokens / 1_000_000) * (AI_MODELS.find(m => m.id === "gpt-4o")?.inputPricePerMToken || 2.5))}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[10px] font-bold text-primary px-1 h-5"
                      onPress={() => {
                        const fullContent = activeWindow.documents.map(d => `--- ${d.title} ---\n${d.content}`).join("\n\n");
                        navigateTo("token-visualizer", fullContent);
                      }}
                    >
                      {t("ctxMgr.deepTokenAudit")} →
                    </Button>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Export controls */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      isSelected={stripComments}
                      onChange={() => setStripComments(!stripComments)}
                    >
                      <span className="text-[10px] font-bold text-muted-foreground">{t("ctxMgr.stripComments")}</span>
                    </Checkbox>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold text-xs h-9 gap-1"
                      onPress={() => setShowExportPreview(true)}
                    >
                      <Eye className="size-3" /> {t("ctxMgr.exportPreview")}
                    </Button>
                    <CopyButton
                      getText={() => exportForAI({ stripComments }) || ""}
                      label={t("ctxMgr.copyAiReady")}
                      className="font-bold h-9"
                    />
                  </div>
                </div>
              </Card>

              {/* Documents — full width table with compact tree sidebar */}
              <div className="grid gap-5 lg:grid-cols-12">
                {/* Visual Tree — compact */}
                <Card className="p-4 lg:col-span-3 bg-muted/10">
                  <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-3 flex items-center gap-1.5 tracking-widest">
                    <FolderTree className="size-3 text-primary" /> {t("ctxMgr.projectHierarchy")}
                  </h3>
                  {activeWindow.documents.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono leading-relaxed overflow-auto max-h-[350px] text-foreground/70 space-y-0.5">
                        {activeWindow.documents.map(d => d.filePath || d.title).sort().map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5 py-0.5">
                            <FileText className="size-3 shrink-0 text-primary/50" />
                            <span className="truncate">{p}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-default-200 hover:border-primary/40 cursor-pointer transition-all group"
                        onClick={openFileBrowser}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openFileBrowser(); }}
                        aria-label={t("ctxMgr.uploadFile")}
                      >
                        <Plus className="size-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-muted-foreground/40 group-hover:text-primary font-bold transition-colors">
                          {t("ctxMgr.addMoreFiles")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-default-200 hover:border-primary/30 cursor-pointer transition-all group"
                      onClick={openFileBrowser}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openFileBrowser(); }}
                      aria-label={t("ctxMgr.dropFilesHere")}
                    >
                      <Upload className="size-5 mb-1.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{t("ctxMgr.dropOrBrowse")}</p>
                      <p className="text-[10px] text-muted-foreground/60">{t("ctxMgr.dropOrBrowseHint")}</p>
                    </div>
                  )}
                </Card>

                {/* Documents Table — wide */}
                <Card className="p-0 lg:col-span-9 overflow-hidden border-divider">
                  <div className="px-4 py-3 border-b border-divider flex items-center justify-between bg-muted/10">
                    <h3 className="font-bold flex items-center gap-2 text-xs">
                      <FileText className="size-3.5 text-primary" />
                      {t("ctxMgr.contextUnits")}
                      {activeWindow.documents.length > 0 && (
                        <Chip size="sm" variant="primary" className="text-[10px] font-bold">{activeWindow.documents.length}</Chip>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={openFileBrowser}
                        className="font-bold text-xs h-7 px-2 text-primary gap-1"
                      >
                        <Upload className="size-3" /> {t("ctxMgr.browseFiles")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowAddDoc(true)}
                        className="font-bold text-xs h-7 px-2 text-primary gap-1"
                      >
                        <ClipboardPaste className="size-3" /> {t("ctxMgr.pasteCode")}
                      </Button>
                    </div>
                  </div>

                  {activeWindow.documents.length > 0 ? (
                    <DataTable
                      columns={docColumns}
                      data={activeWindow.documents}
                      filterField="title"
                      renderCell={renderDocCell}
                      initialVisibleColumns={["title", "tokens", "priority", "actions"]}
                      emptyContent={t("ctxMgr.noDocsWindow")}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                      <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                        <FilePlus2 className="size-7 text-primary/50" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground/60 mb-1">{t("ctxMgr.noDocsTitle")}</h4>
                      <p className="text-xs text-muted-foreground mb-5 max-w-xs">{t("ctxMgr.noDocsDesc")}</p>
                      <div className="flex items-center gap-3">
                        <Button variant="primary" size="sm" onPress={openFileBrowser} className="font-bold gap-1">
                          <Upload className="size-3.5" /> {t("ctxMgr.browseFiles")}
                        </Button>
                        <Button variant="ghost" size="sm" onPress={() => setShowAddDoc(true)} className="font-bold gap-1">
                          <ClipboardPaste className="size-3.5" /> {t("ctxMgr.pasteCode")}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* AI Context Advisor */}
              {isAIEnabled && activeWindow.documents.length > 0 && (
                <Card className="p-5 border-violet-500/20 bg-violet-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-violet-500/10 rounded-lg">
                        <Bot className="size-4 text-violet-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-violet-600 dark:text-violet-400">{t("ctxMgr.aiAdvisor")}</h3>
                        <p className="text-[10px] text-muted-foreground">{t("ctxMgr.aiAdvisorDesc")}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-bold text-xs text-violet-600 dark:text-violet-400 border border-violet-500/30 hover:bg-violet-500/10"
                      isLoading={isAILoading}
                      onPress={() => {
                        const summary = activeWindow.documents.map(d =>
                          `- "${d.title}" (${d.type}, ${d.priority} priority, ${d.tokenCount} tokens)${d.filePath ? ` [${d.filePath}]` : ""}`
                        ).join("\n");
                        const contextSummary = `Model: ${MODEL_PRESETS.find(m => m.maxTokens === activeWindow.maxTokens)?.name ?? "Custom"} (${activeWindow.maxTokens.toLocaleString()} max tokens)\nTotal tokens used: ${activeWindow.totalTokens.toLocaleString()} (${activeWindow.utilizationPercentage}% utilization)\nDocuments (${activeWindow.documents.length}):\n${summary}`;
                        void optimizeContextWithAI(contextSummary);
                      }}
                    >
                      <Bot className="size-3.5 mr-1" /> {t("ctxMgr.aiOptimizeBtn")}
                    </Button>
                  </div>

                  {isAILoading && (
                    <div className="flex items-center gap-2 text-xs text-violet-500 animate-pulse">
                      <div className="size-2 rounded-full bg-violet-500 animate-bounce" />
                      {t("ctxMgr.aiAnalyzing")}
                    </div>
                  )}

                  {aiResult && !isAILoading && aiResult.suggestions.length > 0 && (
                    <div className="space-y-3">
                      {aiResult.suggestions.map((s, i) => (
                        <div key={i} className="p-3 bg-background/80 rounded-lg border border-violet-500/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">{t("ctxMgr.aiInsight")} #{i + 1}</span>
                            <Chip size="sm" variant="soft" className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400">{s.score}/100</Chip>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed mb-1.5">{s.value}</p>
                          {s.reasoning && (
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">{s.reasoning}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {isAIEnabled && aiError && (
                <Card className="p-3 border-danger/30 bg-danger/5" role="alert">
                  <p className="text-xs text-danger font-bold flex items-center gap-2">
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                    {t("ai.errorOccurred", { message: aiError.message })}
                  </p>
                </Card>
              )}
            </>
          ) : (
            /* Empty state — redesigned with value proposition */
            <Card className="p-12 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center min-h-[500px]">
              <div className="size-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="size-10 text-blue-500/50" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-foreground/60">{t("ctxMgr.selectCreateTitle")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto font-bold mb-2">
                {t("ctxMgr.emptyValueProp")}
              </p>
              <p className="text-muted-foreground/70 max-w-md mx-auto font-medium mb-8 text-sm">
                {t("ctxMgr.selectCreateDesc")}
              </p>

              <div className="grid gap-4 sm:grid-cols-3 max-w-lg w-full mb-8">
                {[
                  { icon: Search, label: t("ctxMgr.useCaseReview"), desc: t("ctxMgr.useCaseReviewDesc") },
                  { icon: Bug, label: t("ctxMgr.useCaseBugFix"), desc: t("ctxMgr.useCaseBugFixDesc") },
                  { icon: Blocks, label: t("ctxMgr.useCaseFeature"), desc: t("ctxMgr.useCaseFeatureDesc") },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-default-200">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <step.icon className="size-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase text-foreground/70">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{step.desc}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" onPress={openFileBrowser} className="font-bold gap-2">
                  <Upload className="size-4" /> {t("ctxMgr.browseFiles")}
                </Button>
                <span className="text-xs text-muted-foreground">{t("ctxMgr.orDragFiles")}</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog.Backdrop variant="blur" isOpen={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <AlertDialog.Container placement="center">
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <Trash2 className="size-5" />
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {deleteConfirm?.type === "window"
                  ? t("ctxMgr.confirmDeleteWindowTitle")
                  : t("ctxMgr.confirmDeleteTitle")}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-foreground">
                {deleteConfirm?.type === "window"
                  ? t("ctxMgr.confirmDeleteWindowDesc", { name: deleteConfirm.name })
                  : t("ctxMgr.confirmDeleteDesc", { name: deleteConfirm?.name ?? "" })}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="ghost">{t("common.cancel")}</Button>
              <Button
                variant="primary"
                className="bg-danger text-white hover:bg-danger/90"
                onPress={() => {
                  if (deleteConfirm?.type === "window") {
                    deleteWindow(deleteConfirm.id);
                  } else if (deleteConfirm?.type === "document") {
                    removeDocument(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }}
              >
                {t("ctxMgr.confirmDelete")}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* Add Document Modal — HeroUI Modal for proper focus trap + a11y */}
      <Modal isOpen={showAddDoc} onOpenChange={(open) => { if (!open) { resetDocForm(); setShowAddDoc(false); } }}>
        <Modal.Backdrop className="backdrop-blur-md" />
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[700px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                  <FileCode className="size-6" />
                </div>
                <div>
                  <Modal.Heading className="text-2xl font-black">{t("ctxMgr.addContextSource")}</Modal.Heading>
                  <p className="text-xs text-muted-foreground font-medium">{t("ctxMgr.addContextSourceDesc")}</p>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder={t("ctxMgr.placeholderFilename")} value={docTitle} onChange={(e) => setDocTitle(e.target.value)} variant="primary" className="font-bold" aria-label={t("ctxMgr.docTitle")} />
                  <Input placeholder={t("ctxMgr.placeholderFilePath")} value={docPath} onChange={(e) => setDocPath(e.target.value)} variant="primary" aria-label={t("ctxMgr.docPath")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Select value={docType} onChange={(value) => { if (value) setDocType(value as DocumentType); }} className="w-full" aria-label={t("ctxMgr.documentTypeLabel")}>
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.documentTypeLabel")}</Label>
                      <Select.Trigger className="h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm">
                        <Select.Value /><Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="code" textValue={t("ctxMgr.optSourceCode")}>{t("ctxMgr.optSourceCode")}<ListBox.ItemIndicator /></ListBox.Item>
                          <ListBox.Item id="documentation" textValue={t("ctxMgr.optTechnicalDocs")}>{t("ctxMgr.optTechnicalDocs")}<ListBox.ItemIndicator /></ListBox.Item>
                          <ListBox.Item id="api" textValue={t("ctxMgr.optApiSpec")}>{t("ctxMgr.optApiSpec")}<ListBox.ItemIndicator /></ListBox.Item>
                          <ListBox.Item id="notes" textValue={t("ctxMgr.optContextInstructions")}>{t("ctxMgr.optContextInstructions")}<ListBox.ItemIndicator /></ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Select value={docPriority} onChange={(value) => { if (value) setDocPriority(value as Priority); }} className="w-full" aria-label={t("ctxMgr.priorityLabel")}>
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.priorityLabel")}</Label>
                      <Select.Trigger className="h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm">
                        <Select.Value /><Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="high" textValue={t("ctxMgr.optHighCrucial")}>{t("ctxMgr.optHighCrucial")}<ListBox.ItemIndicator /></ListBox.Item>
                          <ListBox.Item id="medium" textValue={t("ctxMgr.optMediumStandard")}>{t("ctxMgr.optMediumStandard")}<ListBox.ItemIndicator /></ListBox.Item>
                          <ListBox.Item id="low" textValue={t("ctxMgr.optLowReference")}>{t("ctxMgr.optLowReference")}<ListBox.ItemIndicator /></ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>

                {/* Instructions field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.instructionsLabel")}</label>
                  <Input
                    placeholder={t("ctxMgr.instructionsPlaceholder")}
                    value={docInstructions}
                    onChange={(e) => setDocInstructions(e.target.value)}
                    variant="primary"
                    aria-label={t("ctxMgr.instructionsLabel")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.contentLabel")}</label>
                  <TextArea
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (docTitle && docContent) {
                          const wId = ensureWindow();
                          addDocument(docTitle, docContent, docType, docPriority, [], docPath, docInstructions || undefined, wId);
                          addToast(t("ctxMgr.addedToContext", { title: docTitle }), "success");
                          resetDocForm();
                          setShowAddDoc(false);
                        }
                      }
                    }}
                    placeholder={t("ctxMgr.pasteContentPlaceholder")}
                    className="h-48 w-full resize-none rounded-2xl border-2 border-divider bg-background p-4 font-mono text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"
                    aria-label={t("ctxMgr.contentLabel")}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                className="flex-1 font-black h-12 text-md"
                isDisabled={!docTitle.trim() || !docContent.trim()}
                onPress={() => {
                  const wId = ensureWindow();
                  addDocument(docTitle, docContent, docType, docPriority, [], docPath, docInstructions || undefined, wId);
                  addToast(t("ctxMgr.addedToContext", { title: docTitle }), "success");
                  resetDocForm();
                  setShowAddDoc(false);
                }}
              >
                {t("ctxMgr.ingestToContext")}
              </Button>
              <Button variant="ghost" className="font-black h-12" onPress={() => { resetDocForm(); setShowAddDoc(false); }}>{t("common.cancel")}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* Content Preview Modal */}
      <Modal isOpen={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[700px] max-h-[80vh]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t("ctxMgr.previewTitle")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="overflow-auto">
              {previewDoc && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Chip size="sm" variant="primary">{previewDoc.type}</Chip>
                    <Chip size="sm" variant="secondary">{previewDoc.priority}</Chip>
                    <Chip size="sm" variant="secondary">{previewDoc.tokenCount.toLocaleString()} tokens</Chip>
                    {previewDoc.filePath && <Chip size="sm" variant="secondary" className="font-mono">{previewDoc.filePath}</Chip>}
                  </div>
                  {previewDoc.instructions && (
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 text-xs">
                      <span className="font-bold text-warning">{t("ctxMgr.instructionsLabel")}:</span> {previewDoc.instructions}
                    </div>
                  )}
                  <pre className="font-mono text-xs bg-muted/30 rounded-xl p-4 overflow-auto max-h-[400px] whitespace-pre-wrap break-words border border-divider">
                    {previewDoc.content.split("\n").slice(0, 100).join("\n")}
                    {previewDoc.content.split("\n").length > 100 && "\n\n... (truncated)"}
                  </pre>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="ghost">{t("common.cancel")}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* Export Preview Modal */}
      <Modal isOpen={showExportPreview} onOpenChange={(open) => { if (!open) setShowExportPreview(false); }}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[800px] max-h-[80vh]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t("ctxMgr.exportPreviewTitle")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="overflow-auto">
              <pre className="font-mono text-xs bg-muted/30 rounded-xl p-4 overflow-auto max-h-[500px] whitespace-pre-wrap break-words border border-divider">
                {exportForAI({ stripComments }) || ""}
              </pre>
            </Modal.Body>
            <Modal.Footer>
              <CopyButton
                getText={() => exportForAI({ stripComments }) || ""}
                label={t("ctxMgr.copyAiReady")}
                className="font-bold"
              />
              <Button slot="close" variant="ghost">{t("common.cancel")}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  );
}
