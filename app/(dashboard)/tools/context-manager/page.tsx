"use client";

import { useState, useCallback } from "react";
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

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {activeWindow ? (
            <>
              {/* Dashboard Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/20 border-none">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase opacity-80">{t("ctxMgr.utilization")}</p>
                    <StatusBadge variant="info">{activeWindow.totalTokens.toLocaleString()} / {activeWindow.maxTokens.toLocaleString()}</StatusBadge>
                  </div>
                  <p className={cn(
                    "text-4xl font-black mb-2",
                    activeWindow.utilizationPercentage > 90 ? "text-red-300" : activeWindow.utilizationPercentage > 60 ? "text-amber-300" : "text-white"
                  )}>{activeWindow.utilizationPercentage}%</p>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        activeWindow.utilizationPercentage > 90 ? "bg-red-400" : activeWindow.utilizationPercentage > 60 ? "bg-amber-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${Math.min(100, activeWindow.utilizationPercentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="size-3 opacity-60" />
                    <select
                      value={MODEL_PRESETS.find(m => m.maxTokens === activeWindow.maxTokens)?.id || "custom"}
                      onChange={(e) => {
                        const preset = MODEL_PRESETS.find(m => m.id === e.target.value);
                        if (preset) setMaxTokens(preset.maxTokens);
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg text-[10px] font-bold px-2 py-1 outline-none cursor-pointer appearance-none"
                      aria-label={t("ctxMgr.modelPreset")}
                    >
                      {MODEL_PRESETS.filter(m => m.id !== "custom").map(m => (
                        <option key={m.id} value={m.id} className="bg-indigo-900 text-white">
                          {m.name} ({(m.maxTokens / 1000).toFixed(0)}K)
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center border-2 border-transparent hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
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
                    className="mt-4 font-bold border-indigo-100 dark:border-indigo-900 text-indigo-600"
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
                    <div className="text-[10px] font-mono leading-tight overflow-auto max-h-[400px] text-primary/80 space-y-1">
                      {activeWindow.documents.map(d => d.filePath || d.title).sort().map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <FileText className="size-3 shrink-0 opacity-60" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic text-center py-10">{t("ctxMgr.addFilesHint")}</p>
                  )}
                </Card>

                {/* Documents Table */}
                <Card className="p-0 lg:col-span-3 overflow-hidden border-divider shadow-sm">
                  <div className="p-4 border-b border-divider flex items-center justify-between bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-primary" />
                      {t("ctxMgr.contextUnits")}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onPress={() => setShowAddDoc(true)}
                      className="font-black text-[10px] uppercase h-7 px-3 text-primary"
                    >
                      <Plus className="size-3 mr-1" /> {t("ctxMgr.addSourceBtn")}
                    </Button>
                  </div>

                  <DataTable
                    columns={docColumns}
                    data={activeWindow.documents}
                    filterField="title"
                    renderCell={renderDocCell}
                    initialVisibleColumns={["title", "tokens", "priority", "actions"]}
                    emptyContent={t("ctxMgr.noDocsWindow")}
                  />
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderPlus className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">{t("ctxMgr.selectCreateTitle")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {t("ctxMgr.selectCreateDesc")}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Document Modal (Luxury Design) */}
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
                <Input placeholder="e.g. user-service.ts" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} variant="primary" className="font-bold" />
                <Input placeholder="src/services/user-service.ts" value={docPath} onChange={(e) => setDocPath(e.target.value)} variant="primary" />
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
                        addDocument(docTitle, docContent, docType, docPriority, [], docPath);
                        addToast(`"${docTitle}" added to context`, "success");
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
                    addDocument(docTitle, docContent, docType, docPriority, [], docPath);
                    addToast(`"${docTitle}" added to context`, "success");
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
