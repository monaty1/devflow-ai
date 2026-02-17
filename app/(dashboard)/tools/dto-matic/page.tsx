"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Chip,
  Tabs,
  Tab,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  FileJson,
  AlertCircle,
  Sparkles,
  Trash2,
  Code2,
  FileCode,
  FolderTree,
  Wand2,
  Database,
  Download,
  Copy,
  Settings2,
  ChevronRight,
  Braces,
  Binary,
} from "lucide-react";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { GenerationMode, NamingConvention, TargetLanguage, GeneratedFile } from "@/types/dto-matic";

export default function DtoMaticPage() {
  const { t } = useTranslation();
  const {
    jsonInput,
    config,
    result,
    mockData,
    selectedFile,
    selectedFileId,
    isGenerating,
    error,
    setJsonInput,
    setMockData,
    setSelectedFileId,
    updateConfig,
    setMode,
    generate,
    generateMock,
    formatInput,
    loadExample,
    reset,
    isValidJson,
  } = useDtoMatic();

  const [view, setView] = useState<"code" | "schema" | "mock">("code");

  const fileColumns: ColumnConfig[] = [
    { name: "FILE NAME", uid: "name", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderFileCell = useCallback((file: GeneratedFile, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedFileId(file.id)}>
            <FileCode className={cn("size-4", selectedFileId === file.id ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium", selectedFileId === file.id ? "text-primary font-bold" : "")}>
              {file.name}
            </span>
          </div>
        );
      case "type":
        const typeColors: Record<string, string> = {
          interface: "bg-blue-100 text-blue-700",
          entity: "bg-emerald-100 text-emerald-700",
          mapper: "bg-purple-100 text-purple-700",
          zod: "bg-amber-100 text-amber-700",
        };
        return (
          <Chip size="sm" variant="flat" className={cn("capitalize text-[10px] font-black", typeColors[file.type] || "bg-gray-100")}>
            {file.type}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex gap-1">
            <CopyButton text={file.content} variant="ghost" size="sm" />
          </div>
        );
      default:
        return (file as any)[columnKey];
    }
  }, [selectedFileId, setSelectedFileId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Binary}
        gradient="from-green-500 to-emerald-600"
        title={t("dtoMatic.title")}
        description={t("dtoMatic.description")}
        breadcrumb
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input & Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FileJson className="size-4 text-primary" />
                Source JSON
              </h3>
              <div className="flex gap-1">
                <Button isIconOnly size="sm" variant="flat" onPress={loadExample} title="Example"><Wand2 className="size-3" /></Button>
                <Button isIconOnly size="sm" variant="flat" onPress={formatInput} title="Format"><Braces className="size-3" /></Button>
                <Button isIconOnly size="sm" variant="flat" color="danger" onPress={reset} title="Clear"><Trash2 className="size-3" /></Button>
              </div>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"id": 1, ...}'
              className="h-[300px] w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
            />
            <Button 
              onPress={generate} 
              isLoading={isGenerating}
              color="primary"
              className="w-full mt-4 font-bold h-12 shadow-lg shadow-primary/20"
            >
              <Sparkles className="size-4 mr-2" /> Generate Architecture
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              Generator Config
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Root Name</label>
                <Input 
                  size="sm" 
                  value={config.rootName} 
                  onChange={(e) => updateConfig("rootName", e.target.value)}
                  variant="bordered"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Language</label>
                <select 
                  className="w-full rounded-lg border border-divider bg-background p-2 text-sm"
                  value={config.targetLanguage}
                  onChange={(e) => updateConfig("targetLanguage", e.target.value as TargetLanguage)}
                >
                  <option value="typescript">TypeScript (Clean)</option>
                  <option value="java">Java (Lombok)</option>
                  <option value="python">Python (Pydantic)</option>
                  <option value="go">Go (Structs)</option>
                  <option value="csharp">C# (.NET)</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Chip 
                  size="sm" 
                  variant={config.mode === "clean-arch" ? "solid" : "flat"} 
                  color="primary"
                  className="cursor-pointer font-bold"
                  onClick={() => setMode("clean-arch")}
                >Architecture</Chip>
                <Chip 
                  size="sm" 
                  variant={config.mode === "zod" ? "solid" : "flat"} 
                  color="warning"
                  className="cursor-pointer font-bold"
                  onClick={() => setMode("zod")}
                >Zod Schema</Chip>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <>
              {/* Results Tabs */}
              <div className="flex justify-between items-end">
                <Tabs 
                  selectedKey={view} 
                  onSelectionChange={(k) => setView(key as any)}
                  variant="solid"
                  color="primary"
                  size="sm"
                  classNames={{ tabList: "bg-muted/50 rounded-xl p-1" }}
                >
                  <Tab key="code" title="Generated Code" />
                  <Tab key="mock" title="Mock Data (Faker)" />
                </Tabs>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onPress={() => generateMock(10)}>
                    <Database className="size-3 mr-1" /> Re-gen Mocks
                  </Button>
                </div>
              </div>

              {view === "code" ? (
                <div className="grid gap-6 lg:grid-cols-5">
                  {/* File List */}
                  <div className="lg:col-span-2">
                    <Card className="p-0 overflow-hidden">
                      <DataTable
                        columns={fileColumns}
                        data={result.files}
                        filterField="name"
                        renderCell={renderFileCell}
                        initialVisibleColumns={["name", "type"]}
                      />
                    </Card>
                  </div>
                  
                  {/* Code Preview */}
                  <div className="lg:col-span-3">
                    <Card className="p-0 border-primary/20 shadow-xl overflow-hidden bg-content1 h-[600px] flex flex-col">
                      <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                        <span className="text-xs font-mono font-bold text-primary">{selectedFile?.name}</span>
                        <CopyButton text={selectedFile?.content || ""} />
                      </div>
                      <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 scrollbar-hide">
                        <code>{selectedFile?.content}</code>
                      </pre>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="p-0 border-blue-500/20 shadow-xl overflow-hidden h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-2">
                      <Database className="size-4" /> API Response Simulator (10 items)
                    </span>
                    <CopyButton text={mockData || ""} />
                  </div>
                  <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background">
                    <code>{mockData}</code>
                  </pre>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderTree className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">Ready to Architect</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Paste your JSON payload to generate a complete Clean Architecture folder structure including DTOs, Entities, and Mappers.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
