"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
  Chip,
  User,
} from "@heroui/react";
import {
  Plus,
  Trash2,
  Download,
  FolderPlus,
  FileText,
  BookOpen,
  Coins,
  MoreVertical,
  FileCode,
  Tags,
  Share2,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useContextManager } from "@/hooks/use-context-manager";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { ToolHeader } from "@/components/shared/tool-header";
import { formatCost } from "@/lib/application/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Document, ContextWindow, Priority, DocumentType } from "@/types/context-manager";

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
    setActiveWindow,
    addDocument,
    removeDocument,
    changePriority,
    exportWindow,
  } = useContextManager();

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newWindowName, setNewWindowName] = useState("");
  const [exportProfile, setExportProfile] = useState<"xml" | "markdown" | "json">("xml");

  const docColumns: ColumnConfig[] = [
    { name: "DOCUMENT", uid: "title", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "TOKENS", uid: "tokens", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderDocCell = useCallback((doc: Document, columnKey: React.Key) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {doc.type === "code" ? <FileCode className="size-4" /> : <FileText className="size-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{doc.title}</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                {doc.id}
              </span>
            </div>
          </div>
        );
      case "type":
        return (
          <Chip size="sm" variant="flat" className="capitalize text-[10px] font-bold">
            {doc.type}
          </Chip>
        );
      case "tokens":
        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="font-mono text-xs font-bold">{doc.tokens.toLocaleString()}</span>
            <Progress 
              value={(doc.tokens / (activeWindow?.maxTokens || 1)) * 100} 
              size="sm" 
              color="primary" 
              className="h-1"
            />
          </div>
        );
      case "priority":
        const priorityMap = {
          high: "danger",
          medium: "warning",
          low: "default",
        } as const;
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="flat" color={priorityMap[doc.priority]} className="capitalize font-bold h-6 text-[10px]">
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
          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeDocument(doc.id)}>
            <Trash2 className="size-4" />
          </Button>
        );
      default:
        return (doc as any)[columnKey];
    }
  }, [activeWindow, changePriority, removeDocument]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={BookOpen}
        gradient="from-blue-500 to-indigo-600"
        title={t("ctxMgr.title")}
        description={t("ctxMgr.description")}
        breadcrumb
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar: Windows List */}
        <Card className="p-4 lg:col-span-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              size="sm"
              placeholder="New window name..."
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newWindowName) {
                  createWindow(newWindowName);
                  setNewWindowName("");
                }
              }}
            />
            <Button 
              size="sm" 
              color="primary" 
              variant="flat" 
              onPress={() => {
                if (newWindowName) {
                  createWindow(newWindowName);
                  setNewWindowName("");
                }
              }}
              className="font-bold"
            >
              <Plus className="size-4 mr-1" /> Create Window
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Your Windows</p>
            {windows.map((w) => (
              <div
                key={w.id}
                onClick={() => setActiveWindow(w.id)}
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
                  variant="light"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={(e) => {
                    e.stopPropagation();
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
        <div className="lg:col-span-3 space-y-6">
          {activeWindow ? (
            <>
              {/* Dashboard Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                  <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Context Utilization</p>
                  <p className="text-3xl font-black mb-2">{activeWindow.utilizationPercentage}%</p>
                  <Progress 
                    value={activeWindow.utilizationPercentage} 
                    color="warning" 
                    className="h-2 bg-white/20"
                  />
                  <div className="mt-3 flex justify-between text-[10px] font-bold opacity-90">
                    <span>{activeWindow.totalTokens.toLocaleString()} tokens</span>
                    <span>{activeWindow.maxTokens.toLocaleString()} max</span>
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center border-2 border-transparent hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                      <Coins className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Cost (GPT-4o)</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {formatCost((activeWindow.totalTokens / 1_000_000) * (AI_MODELS.find(m => m.id === "gpt-4o")?.inputPricePerMToken || 2.5))}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="mt-4 font-bold border-blue-100 dark:border-blue-900"
                    onPress={() => {
                      const fullContent = activeWindow.documents.map(d => `--- ${d.title} ---\n${d.content}`).join("\n\n");
                      navigateTo("token-visualizer", fullContent);
                    }}
                  >
                    Deep Token Analysis
                  </Button>
                </Card>

                <Card className="p-6 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Export Profile</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex p-1 bg-muted rounded-xl">
                      {["xml", "markdown"].map((p) => (
                        <button
                          key={p}
                          onClick={() => setExportProfile(p as any)}
                          className={cn(
                            "flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all",
                            exportProfile === p ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <Button 
                      color="primary" 
                      className="font-bold shadow-lg shadow-primary/20 h-10"
                      onPress={() => {
                        const content = exportWindow(exportProfile);
                        navigator.clipboard.writeText(content);
                        addToast(`Context exported as ${exportProfile.toUpperCase()}`, "success");
                      }}
                    >
                      <Share2 className="size-4 mr-2" /> Copy for AI
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Documents Table */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Context Documents
                  </h3>
                  <Button 
                    color="primary" 
                    variant="flat" 
                    size="sm" 
                    onPress={() => setShowAddDoc(true)}
                    className="font-bold"
                  >
                    <Plus className="size-4 mr-1" /> Add Document
                  </Button>
                </div>

                <DataTable
                  columns={docColumns}
                  data={activeWindow.documents}
                  filterField="title"
                  renderCell={renderDocCell}
                  emptyContent="No documents in this window. Add code or notes to start."
                />
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderPlus className="size-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Context Window</h3>
              <p className="text-muted-foreground max-w-xs">
                Create a new context window or select one from the sidebar to start organizing your LLM prompts.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Document Modal/Overlay (Simplified for logic) */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Document</h3>
            <div className="space-y-4">
              <Input label="Title" placeholder="e.g. auth-service.ts" id="doc-title" />
              <div className="grid grid-cols-2 gap-4">
                <select id="doc-type" className="rounded-xl border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="code">Code</option>
                  <option value="documentation">Docs</option>
                  <option value="api">API</option>
                  <option value="notes">Notes</option>
                </select>
                <select id="doc-priority" className="rounded-xl border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <textarea
                id="doc-content"
                placeholder="Paste code or text here..."
                className="h-60 w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <Button className="flex-1 font-bold" color="primary" onPress={() => {
                  const title = (document.getElementById("doc-title") as HTMLInputElement).value;
                  const content = (document.getElementById("doc-content") as HTMLTextAreaElement).value;
                  const type = (document.getElementById("doc-type") as HTMLSelectElement).value as DocumentType;
                  const priority = (document.getElementById("doc-priority") as HTMLSelectElement).value as Priority;
                  if (title && content) {
                    addDocument(activeWindowId!, { title, content, type, priority, tags: [] });
                    setShowAddDoc(false);
                  }
                }}>
                  Add to Context
                </Button>
                <Button variant="ghost" className="font-bold" onPress={() => setShowAddDoc(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
