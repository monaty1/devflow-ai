"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  TextArea,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import {
  Plus,
  Trash2,
  FolderPlus,
  BookOpen,
  Coins,
  FileCode,
  FileText,
  FolderTree,
  Cpu,
  Upload,
  Copy,
  FilePlus2,
  ClipboardPaste,
} from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { formatCost } from "@/lib/application/cost-calculator";
import { MODEL_PRESETS } from "@/lib/application/context-manager";
import { AI_MODELS } from "@/config/ai-models";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ContextDocument as Document, Priority, DocumentType } from "@/types/context-manager";

export default function ContextManagerPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();
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
  const [stripComments, setStripComments] = useState(true);

  // Controlled modal form state
  const [docTitle, setDocTitle] = useState("");
  const [docPath, setDocPath] = useState("");
  const [docType, setDocType] = useState<DocumentType>("code");
  const [docPriority, setDocPriority] = useState<Priority>("medium");
  const [docContent, setDocContent] = useState("");

  const resetDocForm = () => {
    setDocTitle("");
    setDocPath("");
    setDocType("code");
    setDocPriority("medium");
    setDocContent("");
  };

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

  // Queue files when window was just auto-created (state not yet updated)
  const pendingFilesRef = useRef<{ name: string; content: string; type: DocumentType }[]>([]);

  // Add files directly (skip modal)
  const addFilesDirectly = useCallback((files: { name: string; content: string; type: DocumentType }[]) => {
    if (!activeWindowId) {
      // Window was just created but state not yet updated — queue files
      pendingFilesRef.current = files;
      return;
    }
    for (const file of files) {
      addDocument(file.name, file.content, file.type, "medium", [], file.name);
    }
    if (files.length === 1) {
      addToast(t("ctxMgr.addedToContext", { title: files[0]?.name ?? "" }), "success");
    } else {
      addToast(t("ctxMgr.filesAdded", { count: String(files.length) }), "success");
    }
  }, [activeWindowId, addDocument, addToast, t]);

  // Process pending files when activeWindowId updates
  useEffect(() => {
    if (pendingFilesRef.current.length > 0 && activeWindowId) {
      const files = pendingFilesRef.current;
      pendingFilesRef.current = [];
      for (const file of files) {
        addDocument(file.name, file.content, file.type, "medium", [], file.name);
      }
      if (files.length === 1) {
        addToast(t("ctxMgr.addedToContext", { title: files[0]?.name ?? "" }), "success");
      } else {
        addToast(t("ctxMgr.filesAdded", { count: String(files.length) }), "success");
      }
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

      // Ensure window exists
      if (!activeWindowId) {
        createWindow(t("ctxMgr.autoWindowName"));
        pendingFilesRef.current = valid;
      } else {
        addFilesDirectly(valid);
      }
    });
  }, [activeWindowId, createWindow, addFilesDirectly, t]);

  // Global drag handlers for the main content area
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFiles]);

  const openFileBrowser = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const docColumns: ColumnConfig[] = [
    { name: t("table.colDocument"), uid: "title", sortable: true },
    { name: t("table.colType"), uid: "type", sortable: true },
    { name: t("table.colTokens"), uid: "tokens", sortable: true },
    { name: t("table.colPriority"), uid: "priority", sortable: true },
    { name: t("table.colActions"), uid: "actions" },
  ];

  const renderDocCell = useCallback((doc: Document, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "title":
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {doc.type === "code" ? <FileCode className="size-4" /> : <FileText className="size-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{doc.title}</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                {doc.filePath || t("ctxMgr.noPathSet")}
              </span>
            </div>
          </div>
        );
      case "type":
        return (
          <Chip size="sm" variant="primary" className="capitalize text-[10px] font-bold">
            {doc.type}
          </Chip>
        );
      case "tokens":
        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="font-mono text-xs font-bold">{doc.tokenCount.toLocaleString()}</span>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, (doc.tokenCount / (activeWindow?.maxTokens || 1)) * 100)}%` }}
              />
            </div>
          </div>
        );
      case "priority":
        const priorityMap = {
          high: "danger" as const,
          medium: "warning" as const,
          low: "primary" as const,
        } as const;
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="ghost" className="capitalize font-bold h-6 text-[10px]" style={{ color: priorityMap[doc.priority as keyof typeof priorityMap] }}>
                {doc.priority}
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => changePriority(doc.id, key as Priority)}>
              <DropdownItem key="high">{t("ctxMgr.priorityHigh")}</DropdownItem>
              <DropdownItem key="medium">{t("ctxMgr.priorityMedium")}</DropdownItem>
              <DropdownItem key="low">{t("ctxMgr.priorityLow")}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      case "actions":
        return (
          <Button isIconOnly size="sm" variant="ghost" onPress={() => removeDocument(doc.id)} aria-label={t("ctxMgr.removeDocLabel2")}>
            <Trash2 className="size-4 text-danger" />
          </Button>
        );
      default:
        return String(doc[key as keyof typeof doc] ?? "");
    }
  }, [activeWindow, changePriority, removeDocument, t]);

  // Hidden file input — always in DOM, supports multiple
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
        <Card className="p-4 lg:col-span-3 flex flex-col gap-4">
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
              className="font-bold text-primary"
            >
              <Plus className="size-4 mr-1" /> {t("ctxMgr.createWindowBtn")}
            </Button>
          </div>

          <div className="space-y-2 mt-4 overflow-auto max-h-[600px] pr-2 scrollbar-hide">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">{t("ctxMgr.projectContexts")}</p>
            {windows.length === 0 && (
              <p className="text-xs text-muted-foreground/50 px-2 py-4 text-center italic">
                {t("ctxMgr.noWindowsHint")}
              </p>
            )}
            {windows.map((w) => (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveWindowId(w.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveWindowId(w.id); } }}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                  activeWindowId === w.id
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                    : "hover:bg-muted text-muted-foreground"
                )}
                aria-label={w.name}
                aria-pressed={activeWindowId === w.id}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate">{w.name}</span>
                  <span className="text-[10px] opacity-60">{w.documents.length} docs · {w.totalTokens.toLocaleString()} tokens</span>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t("ctxMgr.deleteWorkspace")}
                  onPress={() => {
                    deleteWindow(w.id);
                  }}
                >
                  <Trash2 className="size-3 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Main Content — global drop zone */}
        <div
          className="lg:col-span-9 space-y-6 relative"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Global drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-background/80 shadow-xl">
                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Upload className="size-8 text-primary animate-bounce" />
                </div>
                <p className="text-lg font-black text-primary">{t("ctxMgr.dropFilesHere")}</p>
                <p className="text-sm text-muted-foreground">{t("ctxMgr.dropOrBrowseHint")}</p>
              </div>
            </div>
          )}

          {activeWindow ? (
            <>
              {/* Dashboard Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/15 dark:to-blue-500/15 shadow-lg shadow-primary/5 border border-default-200 dark:border-default-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("ctxMgr.utilization")}</p>
                    <StatusBadge variant="info">{activeWindow.totalTokens.toLocaleString()} / {activeWindow.maxTokens.toLocaleString()}</StatusBadge>
                  </div>
                  <p className={cn(
                    "text-4xl font-black mb-2",
                    activeWindow.utilizationPercentage > 90 ? "text-red-500 dark:text-red-400" : activeWindow.utilizationPercentage > 60 ? "text-amber-500 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"
                  )}>{activeWindow.utilizationPercentage}%</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        activeWindow.utilizationPercentage > 90 ? "bg-red-500 dark:bg-red-400" : activeWindow.utilizationPercentage > 60 ? "bg-amber-500 dark:bg-amber-400" : "bg-emerald-500 dark:bg-emerald-400"
                      )}
                      style={{ width: `${Math.min(100, activeWindow.utilizationPercentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="size-3 text-muted-foreground" />
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[10px] font-bold px-2 py-1 h-auto"
                          aria-label={t("ctxMgr.modelPreset")}
                        >
                          {MODEL_PRESETS.find(m => m.maxTokens === activeWindow.maxTokens)?.name ?? t("ctxMgr.modelPreset")}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        selectionMode="single"
                        selectedKeys={new Set([MODEL_PRESETS.find(m => m.maxTokens === activeWindow.maxTokens)?.id ?? ""])}
                        onSelectionChange={(keys) => {
                          const id = Array.from(keys)[0] as string;
                          const preset = MODEL_PRESETS.find(m => m.id === id);
                          if (preset) setMaxTokens(preset.maxTokens);
                        }}
                      >
                        {MODEL_PRESETS.filter(m => m.id !== "custom").map(m => (
                          <DropdownItem key={m.id}>
                            {m.name} ({(m.maxTokens / 1000).toFixed(0)}K)
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center border-2 border-transparent hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                      <Coins className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("ctxMgr.estCost")}</p>
                      <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                        {formatCost((activeWindow.totalTokens / 1_000_000) * (AI_MODELS.find(m => m.id === "gpt-4o")?.inputPricePerMToken || 2.5))}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-4 font-bold border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                    onPress={() => {
                      const fullContent = activeWindow.documents.map(d => `--- ${d.title} ---\n${d.content}`).join("\n\n");
                      navigateTo("token-visualizer", fullContent);
                    }}
                  >
                    {t("ctxMgr.deepTokenAudit")}
                  </Button>
                </Card>

                <Card className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("ctxMgr.packagingEngine")}</p>
                    <Checkbox
                      isSelected={stripComments}
                      onChange={() => setStripComments(!stripComments)}
                      className="mt-1"
                    >
                      <span className="text-[10px] font-black uppercase text-primary tracking-tighter">{t("ctxMgr.stripComments")}</span>
                    </Checkbox>
                  </div>
                  <CopyButton
                    getText={() => exportForAI({ stripComments }) || ""}
                    label={t("ctxMgr.copyAiReady")}
                    className="font-bold shadow-lg shadow-primary/20 h-12 w-full"
                  />
                </Card>
              </div>

              {/* Hierarchy & Documents */}
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Visual Tree */}
                <Card className="p-6 lg:col-span-2 bg-muted/10">
                  <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-widest">
                    <FolderTree className="size-3 text-primary" /> {t("ctxMgr.projectHierarchy")}
                  </h3>
                  {activeWindow.documents.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono leading-tight overflow-auto max-h-[300px] text-primary/80 space-y-1">
                        {activeWindow.documents.map(d => d.filePath || d.title).sort().map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <FileText className="size-3 shrink-0 opacity-60" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                      {/* Mini drop zone below existing files */}
                      <div
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-default-200 hover:border-primary/30 cursor-pointer transition-all group"
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
                      className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-default-200 hover:border-primary/30 cursor-pointer transition-all group"
                      onClick={openFileBrowser}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openFileBrowser(); }}
                      aria-label={t("ctxMgr.dropFilesHere")}
                    >
                      <Upload className="size-6 mb-2 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{t("ctxMgr.dropOrBrowse")}</p>
                      <p className="text-[10px] text-muted-foreground/60">{t("ctxMgr.dropOrBrowseHint")}</p>
                    </div>
                  )}
                </Card>

                {/* Documents Table */}
                <Card className="p-0 lg:col-span-3 overflow-hidden border-divider shadow-sm">
                  <div className="p-4 border-b border-divider flex items-center justify-between bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-primary" />
                      {t("ctxMgr.contextUnits")}
                      {activeWindow.documents.length > 0 && (
                        <Chip size="sm" variant="primary" className="text-[10px] font-bold">{activeWindow.documents.length}</Chip>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={openFileBrowser}
                        className="font-bold text-[10px] uppercase h-7 px-3 text-primary gap-1"
                      >
                        <Upload className="size-3" /> {t("ctxMgr.browseFiles")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowAddDoc(true)}
                        className="font-black text-[10px] uppercase h-7 px-3 text-primary"
                      >
                        <ClipboardPaste className="size-3 mr-1" /> {t("ctxMgr.pasteCode")}
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
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                      <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <FilePlus2 className="size-8 text-primary/50" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground/60 mb-1">{t("ctxMgr.noDocsTitle")}</h4>
                      <p className="text-xs text-muted-foreground mb-6 max-w-xs">{t("ctxMgr.noDocsDesc")}</p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={openFileBrowser}
                          className="font-bold gap-1"
                        >
                          <Upload className="size-3.5" /> {t("ctxMgr.browseFiles")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setShowAddDoc(true)}
                          className="font-bold gap-1"
                        >
                          <ClipboardPaste className="size-3.5" /> {t("ctxMgr.pasteCode")}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </>
          ) : (
            /* Empty state — no window selected */
            <Card className="p-12 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center min-h-[500px]">
              <div className="size-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="size-10 text-blue-500/50" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-foreground/60">{t("ctxMgr.selectCreateTitle")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto font-medium mb-8">
                {t("ctxMgr.selectCreateDesc")}
              </p>

              {/* Step cards */}
              <div className="grid gap-4 sm:grid-cols-3 max-w-lg w-full mb-8">
                {[
                  { icon: FolderPlus, label: t("ctxMgr.step1"), desc: t("ctxMgr.step1Desc") },
                  { icon: Upload, label: t("ctxMgr.step2"), desc: t("ctxMgr.step2Desc") },
                  { icon: Copy, label: t("ctxMgr.step3"), desc: t("ctxMgr.step3Desc") },
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

              {/* Quick actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onPress={openFileBrowser}
                  className="font-bold gap-2"
                >
                  <Upload className="size-4" /> {t("ctxMgr.browseFiles")}
                </Button>
                <span className="text-xs text-muted-foreground">{t("ctxMgr.orDragFiles")}</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Document Modal — for manual paste only */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="add-doc-title">
          <Card className="w-full max-w-2xl p-8 shadow-2xl border-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                <FileCode className="size-6" />
              </div>
              <div>
                <h3 id="add-doc-title" className="text-2xl font-black">{t("ctxMgr.addContextSource")}</h3>
                <p className="text-xs text-muted-foreground font-medium">{t("ctxMgr.addContextSourceDesc")}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder={t("ctxMgr.placeholderFilename")} value={docTitle} onChange={(e) => setDocTitle(e.target.value)} variant="primary" className="font-bold" />
                <Input placeholder={t("ctxMgr.placeholderFilePath")} value={docPath} onChange={(e) => setDocPath(e.target.value)} variant="primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Select
                    value={docType}
                    onChange={(value) => { if (value) setDocType(value as DocumentType); }}
                    className="w-full"
                    aria-label={t("ctxMgr.documentTypeLabel")}
                  >
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.documentTypeLabel")}</Label>
                    <Select.Trigger className="h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm">
                      <Select.Value />
                      <Select.Indicator />
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
                  <Select
                    value={docPriority}
                    onChange={(value) => { if (value) setDocPriority(value as Priority); }}
                    className="w-full"
                    aria-label={t("ctxMgr.priorityLabel")}
                  >
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.priorityLabel")}</Label>
                    <Select.Trigger className="h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm">
                      <Select.Value />
                      <Select.Indicator />
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

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("ctxMgr.contentLabel")}</label>
                <TextArea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      if (docTitle && docContent) {
                        if (!activeWindowId) {
                          createWindow(t("ctxMgr.autoWindowName"));
                        }
                        addDocument(docTitle, docContent, docType, docPriority, [], docPath);
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

              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 font-black h-12 text-md shadow-xl shadow-indigo-500/20"
                  isDisabled={!docTitle.trim() || !docContent.trim()}
                  onPress={() => {
                    if (!activeWindowId) {
                      createWindow(t("ctxMgr.autoWindowName"));
                    }
                    addDocument(docTitle, docContent, docType, docPriority, [], docPath);
                    addToast(t("ctxMgr.addedToContext", { title: docTitle }), "success");
                    resetDocForm();
                    setShowAddDoc(false);
                  }}
                >
                  {t("ctxMgr.ingestToContext")}
                </Button>
                <Button variant="ghost" className="font-black h-12" onPress={() => { resetDocForm(); setShowAddDoc(false); }}>{t("common.cancel")}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
