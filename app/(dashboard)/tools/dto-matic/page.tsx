"use client";

import { useState, useCallback } from "react";
import {
  Tabs,
  Chip,
  Input,
  TextArea,
  Select,
  ListBox,
} from "@heroui/react";
import {
  FileJson,
  AlertCircle,
  Sparkles,
  Trash2,
  Code2,
  FolderTree,
  Wand2,
  Database,
  Braces,
  Binary,
  Box,
  FileCode,
} from "lucide-react";
import { ToolHeader } from "@/components/shared/tool-header";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { TargetLanguage, GeneratedFile } from "@/types/dto-matic";

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
    setJsonInput,
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

  const [view, setView] = useState<"code" | "schema" | "mock" | string>("code");
  const [mockCount, setMockCount] = useState(5);

  const fileColumns: ColumnConfig[] = [
    { name: "FILE NAME", uid: "name", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "LANG", uid: "language" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderFileCell = useCallback((file: GeneratedFile, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedFileId(file.id)}>
            <div className={cn("p-1.5 rounded-lg transition-colors group-hover:bg-primary/10", selectedFileId === file.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
              <FileCode className="size-4" />
            </div>
            <span className={cn("text-sm font-medium transition-colors", selectedFileId === file.id ? "text-primary font-bold" : "group-hover:text-foreground")}>
              {file.name}
            </span>
          </div>
        );
      case "type":
        const typeColors: Record<string, string> = {
          interface: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
          entity: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
          mapper: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
          zod: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
          struct: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200",
          class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
        };
        return (
          <Chip size="sm" variant="primary" className={cn("capitalize text-[10px] font-black h-6", typeColors[file.type] || "bg-gray-100")}>
            {file.type}
          </Chip>
        );
      case "language":
        return <span className="text-[10px] uppercase font-bold text-muted-foreground">{file.language}</span>;
      case "actions":
        return (
          <div className="flex gap-1">
            <CopyButton text={file.content} variant="ghost" size="sm" />
          </div>
        );
      default:
        return String(file[key as keyof typeof file] ?? "");
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
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <Trash2 className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="dto-matic" input={jsonInput} output={selectedFile?.content || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input & Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FileJson className="size-4 text-primary" />
                {t("dtoMatic.payloadSource")}
              </h3>
              <div className="flex gap-1">
                <Button isIconOnly size="sm" variant="ghost" onPress={loadExample} aria-label="Load example"><Wand2 className="size-3.5" /></Button>
                <Button isIconOnly size="sm" variant="ghost" onPress={formatInput} aria-label="Format JSON"><Braces className="size-3.5" /></Button>
              </div>
            </div>
            
            <div className="relative">
              <TextArea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={t("dtoMatic.pasteJsonHint")}
                className={cn(
                  "h-[300px] w-full resize-none rounded-xl border p-4 font-mono text-xs focus:ring-2 transition-all shadow-inner leading-relaxed",
                  !isValidJson(jsonInput) && jsonInput ? "border-danger ring-danger/10" : "border-divider focus:ring-primary/20"
                )}
                spellCheck={false}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (jsonInput.trim()) generate();
                  }
                }}
                aria-label={t("dtoMatic.jsonInputLabel")}
              />
              {!isValidJson(jsonInput) && jsonInput && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-danger text-xs font-bold bg-background/80 backdrop-blur px-2 py-1 rounded-lg border border-danger/20">
                  <AlertCircle className="size-3" /> {t("dtoMatic.invalidJsonBadge")}
                </div>
              )}
            </div>

            <Button 
              onPress={generate} 
              isLoading={isGenerating}
              variant="primary"
              className="w-full mt-4 font-bold h-12 shadow-lg shadow-primary/20 text-md"
              isDisabled={!jsonInput.trim() || !config.rootName.trim()}
            >
              <Sparkles className="size-4 mr-2" /> {t("dtoMatic.generateArch")}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground/80">
              <Braces className="size-4" />
              {t("dtoMatic.generatorConfig")}
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("dtoMatic.rootNameLabel")}</label>
                <Input 
                  variant="primary"
                  value={config.rootName} 
                  onChange={(e) => updateConfig("rootName", e.target.value)}
                  placeholder="e.g. UserResponse"
                  className="font-bold"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("dtoMatic.targetStack")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "typescript", label: "TypeScript" },
                    { val: "java", label: "Java" },
                    { val: "python", label: "Python" },
                    { val: "go", label: "Go" },
                    { val: "csharp", label: "C# .NET" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => updateConfig("targetLanguage", opt.val as TargetLanguage)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left",
                        config.targetLanguage === opt.val 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-divider">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("dtoMatic.outputModeLabel")}</label>
                <div className="flex gap-2">
                  <Chip
                    size="sm"
                    variant={config.mode === "clean-arch" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("clean-arch")}
                  >{t("dtoMatic.cleanArch")}</Chip>
                  <Chip
                    size="sm"
                    variant={config.mode === "zod" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("zod")}
                  >{t("dtoMatic.zodSchemaLabel")}</Chip>
                  <Chip
                    size="sm"
                    variant={config.mode === "quick" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("quick")}
                  >{t("dtoMatic.dtoOnlyLabel")}</Chip>
                </div>
                <p className="text-[10px] text-muted-foreground/70 ml-1 mt-1">
                  {config.mode === "clean-arch" && t("dtoMatic.cleanArchDescLong")}
                  {config.mode === "zod" && t("dtoMatic.zodDescLong")}
                  {config.mode === "quick" && t("dtoMatic.quickDescLong")}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center">
                  <p className="text-[10px] font-black uppercase text-green-600 mb-1">{t("dtoMatic.totalTypes")}</p>
                  <p className="text-2xl font-black text-green-700 dark:text-green-400">{result.stats.totalTypes}</p>
                </Card>
                <Card className="p-4 bg-muted/30 text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("dtoMatic.nestedObjects")}</p>
                  <p className="text-2xl font-black">{result.stats.nestedObjects}</p>
                </Card>
                <Card className="p-4 bg-muted/30 text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("dtoMatic.arraysLabel")}</p>
                  <p className="text-2xl font-black">{result.stats.arrays}</p>
                </Card>
                <Card className="p-4 bg-muted/30 text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("dtoMatic.filesLabel")}</p>
                  <p className="text-2xl font-black">{result.files.length}</p>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs
                selectedKey={view as string}
                onSelectionChange={(k) => setView(k as string)}
                variant="primary"
              >
                <div className="flex justify-between items-end">
                  <Tabs.ListContainer>
                    <Tabs.List aria-label="Output view">
                      <Tabs.Tab id="code">
                        <div className="flex items-center gap-2">
                          <Code2 className="size-4" />
                          <span>{t("dtoMatic.generatedCodeTab")}</span>
                        </div>
                      </Tabs.Tab>
                      <Tabs.Tab id="mock">
                        <div className="flex items-center gap-2">
                          <Database className="size-4" />
                          <span>{t("dtoMatic.mockDataTab")}</span>
                        </div>
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>

                  {view === "mock" && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(mockCount)}
                        onChange={(value) => { if (value) setMockCount(parseInt(String(value))); }}
                        className="w-28"
                        aria-label="Mock data count"
                      >
                        <Select.Trigger className="h-8 rounded-lg border border-divider bg-background px-2 text-xs font-bold">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {[1, 3, 5, 10, 25, 50].map(n => (
                              <ListBox.Item key={String(n)} id={String(n)} textValue={`${n} items`}>
                                {n} items
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <Button size="sm" variant="ghost" onPress={() => generateMock(mockCount)} className="font-bold text-secondary">
                        <Wand2 className="size-3 mr-1" /> {t("dtoMatic.rerollData")}
                      </Button>
                    </div>
                  )}
                </div>

                <Tabs.Panel id="code">
                  <div className="grid gap-6 lg:grid-cols-5 h-[600px]">
                    <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                      <Card className="flex-1 p-0 overflow-hidden border-divider">
                        <DataTable
                          columns={fileColumns}
                          data={result.files}
                          filterField="name"
                          renderCell={renderFileCell}
                          initialVisibleColumns={["name", "type"]}
                          emptyContent={t("dtoMatic.noFiles")}
                        />
                      </Card>
                    </div>

                    <div className="lg:col-span-3 h-full">
                      <Card className="h-full p-0 border-primary/20 shadow-lg overflow-hidden bg-muted/30 dark:bg-zinc-900 flex flex-col border-none">
                        <div className="p-3 bg-muted/50 dark:bg-white/5 border-b border-divider dark:border-white/10 flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-primary ml-2">{selectedFile?.name}</span>
                          <CopyButton text={selectedFile?.content || ""} variant="ghost" size="sm" />
                        </div>
                        <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 scrollbar-hide text-foreground/80">
                          <code>{selectedFile?.content}</code>
                        </pre>
                      </Card>
                    </div>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel id="mock">
                  <Card className="p-0 overflow-hidden h-[600px] flex flex-col border-none">
                    <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                      <span className="text-xs font-bold text-secondary flex items-center gap-2 uppercase tracking-wider">
                        <Box className="size-4" /> {t("dtoMatic.generatedJsonResponse")}
                      </span>
                      <CopyButton text={mockData || ""} />
                    </div>
                    <pre className="p-6 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background text-foreground/80">
                      <code>{mockData}</code>
                    </pre>
                  </Card>
                </Tabs.Panel>
              </Tabs>
            </div>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderTree className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">{t("dtoMatic.architecturalEngine")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {t("dtoMatic.architecturalEngineDesc")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
