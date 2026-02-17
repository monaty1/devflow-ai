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
} from "@heroui/react";
import {
  Plus,
  Trash2,
  FolderPlus,
  FileText,
  BookOpen,
  Coins,
  FileCode,
  Share2,
  FolderTree,
} from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ToolHeader } from "@/components/shared/tool-header";
import { formatCost } from "@/lib/application/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
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
    exportForAI,
  } = useContextManager();

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newWindowName, setNewWindowName] = useState("");
  const [stripComments, setStripComments] = useState(true);

  const docColumns: ColumnConfig[] = [
    { name: "DOCUMENT", uid: "title", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "TOKENS", uid: "tokens", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "ACTIONS", uid: "actions" },
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
                {doc.filePath || "No path set"}
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
              <DropdownItem key="high">High</DropdownItem>
              <DropdownItem key="medium">Medium</DropdownItem>
              <DropdownItem key="low">Low</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      case "actions":
        return (
          <Button isIconOnly size="sm" variant="ghost" onPress={() => removeDocument(doc.id)}>
            <Trash2 className="size-4 text-danger" />
          </Button>
        );
      default:
        return String(doc[key as keyof typeof doc] ?? "");
    }
  }, [activeWindow, changePriority, removeDocument]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={BookOpen}
        gradient="from-blue-500 to-indigo-600"
        title={t("ctxMgr.title")}
        description={t("ctxMgr.description")}
        breadcrumb
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar: Windows List */}
        <Card className="p-4 lg:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="New window name..."
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newWindowName) {
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
              <Plus className="size-4 mr-1" /> Create Window
            </Button>
          </div>

          <div className="space-y-2 mt-4 overflow-auto max-h-[600px] pr-2 scrollbar-hide">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Project Contexts</p>
            {windows.map((w) => (
              <div
                key={w.id}
                onClick={() => setActiveWindowId(w.id)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                  activeWindowId === w.id 
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                    : "hover:bg-muted text-muted-foreground"
                )}
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
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase opacity-80">Utilization</p>
                    <StatusBadge variant="info">{activeWindow.totalTokens.toLocaleString()} t</StatusBadge>
                  </div>
                  <p className="text-4xl font-black mb-2">{activeWindow.utilizationPercentage}%</p>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-warning" 
                      style={{ width: `${Math.min(100, activeWindow.utilizationPercentage)}%` }} 
                    />
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center border-2 border-transparent hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                      <Coins className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Cost (GPT-4o)</p>
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
                    Deep Token Audit
                  </Button>
                </Card>

                <Card className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Packaging Engine</p>
                    <Checkbox 
                      isSelected={stripComments} 
                      onChange={() => setStripComments(!stripComments)}
                      className="mt-1"
                    >
                      <span className="text-[10px] font-black uppercase text-primary tracking-tighter">Strip Code Comments</span>
                    </Checkbox>
                  </div>
                  <Button 
                    variant="primary" 
                    className="font-bold shadow-lg shadow-primary/20 h-12"
                    onPress={() => {
                      const content = exportForAI({ stripComments });
                      if (content) {
                        navigator.clipboard.writeText(content);
                        addToast(`AI-Ready Context (XML) copied to clipboard!`, "success");
                      }
                    }}
                  >
                    <Share2 className="size-4 mr-2" /> Copy AI-Ready Context
                  </Button>
                </Card>
              </div>

              {/* Hierarchy & Documents */}
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Visual Tree */}
                <Card className="p-6 lg:col-span-2 bg-muted/10">
                  <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-widest">
                    <FolderTree className="size-3 text-primary" /> Project Hierarchy
                  </h3>
                  {activeWindow.documents.length > 0 ? (
                    <pre className="text-[10px] font-mono leading-tight overflow-auto max-h-[400px] text-primary/80">
                      <code>{
                        // Dynamic Tree logic (internal to component for LUX view)
                        activeWindow.documents.map(d => d.filePath || d.title).sort().map(p => `📄 ${p}`).join('\n')
                      }</code>
                    </pre>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic text-center py-10">Add files to see the project map.</p>
                  )}
                </Card>

                {/* Documents Table */}
                <Card className="p-0 lg:col-span-3 overflow-hidden border-divider shadow-sm">
                  <div className="p-4 border-b border-divider flex items-center justify-between bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-primary" />
                      Context Units
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onPress={() => setShowAddDoc(true)}
                      className="font-black text-[10px] uppercase h-7 px-3 text-primary"
                    >
                      <Plus className="size-3 mr-1" /> Add Source
                    </Button>
                  </div>

                  <DataTable
                    columns={docColumns}
                    data={activeWindow.documents}
                    filterField="title"
                    renderCell={renderDocCell}
                    initialVisibleColumns={["title", "tokens", "priority", "actions"]}
                    emptyContent="No documents in this window."
                  />
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderPlus className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">Select or Create a Context</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Organize your project code, API docs, and instructions into a single AI-optimized payload.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Document Modal (Luxury Design) */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <Card className="w-full max-w-2xl p-8 shadow-2xl border-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                <FileCode className="size-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Add Context Source</h3>
                <p className="text-xs text-muted-foreground font-medium">Paste code, documentation or prompt instructions.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="e.g. user-service.ts" id="doc-title" variant="primary" className="font-bold" />
                <Input placeholder="src/services/user-service.ts" id="doc-path" variant="primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Document Type</label>
                  <select id="doc-type" className="w-full h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm focus:border-indigo-500 outline-none transition-all">
                    <option value="code">Source Code</option>
                    <option value="documentation">Technical Docs</option>
                    <option value="api">API Specification</option>
                    <option value="notes">Context Instructions</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Priority</label>
                  <select id="doc-priority" className="w-full h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm focus:border-indigo-500 outline-none transition-all">
                    <option value="high">High (Crucial Logic)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="low">Low (Reference)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Content</label>
                <textarea
                  id="doc-content"
                  placeholder="Paste context content here..."
                  className="h-48 w-full resize-none rounded-2xl border-2 border-divider bg-background p-4 font-mono text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="primary" className="flex-1 font-black h-12 text-md shadow-xl shadow-indigo-500/20" onPress={() => {
                  const title = (document.getElementById("doc-title") as HTMLInputElement).value;
                  const content = (document.getElementById("doc-content") as HTMLTextAreaElement).value;
                  const filePath = (document.getElementById("doc-path") as HTMLInputElement).value;
                  const type = (document.getElementById("doc-type") as HTMLSelectElement).value as DocumentType;
                  const priority = (document.getElementById("doc-priority") as HTMLSelectElement).value as Priority;
                  if (title && content) {
                    addDocument(title, content, type, priority, [], filePath);
                    setShowAddDoc(false);
                  }
                }}>
                  Ingest to Context
                </Button>
                <Button variant="ghost" className="font-black h-12" onPress={() => setShowAddDoc(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
