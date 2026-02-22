"use client";

import { useState } from "react";
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
  Download,
  Bot,
} from "lucide-react";
import { ToolHeader } from "@/components/shared/tool-header";
import { useDtoMatic } from "@/hooks/use-dto-matic";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { Button, Card } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import type { TargetLanguage } from "@/types/dto-matic";

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

  const { optimizeDtoWithAI, aiResult, isAILoading } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);

  const [view, setView] = useState<"code" | "schema" | "mock" | string>("code");
  const [mockCount, setMockCount] = useState(5);


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

      {error && (
        <Card className="p-4 border-danger/30 bg-danger/5 flex items-center gap-3">
          <AlertCircle className="size-4 text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">{error}</p>
        </Card>
      )}

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
                <Button isIconOnly size="sm" variant="ghost" onPress={loadExample} aria-label={t("dtoMatic.ariaLoadExample")}><Wand2 className="size-3.5" /></Button>
                <Button isIconOnly size="sm" variant="ghost" onPress={formatInput} aria-label={t("dtoMatic.ariaFormatJson")}><Braces className="size-3.5" /></Button>
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
                  placeholder={t("dtoMatic.placeholderRootName")}
                  className="font-bold"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("dtoMatic.targetStack")}</label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("dtoMatic.targetStack")}>
                  {[
                    { val: "typescript", label: "TypeScript" },
                    { val: "java", label: "Java" },
                    { val: "python", label: "Python" },
                    { val: "go", label: "Go" },
                    { val: "csharp", label: "C# .NET" },
                  ].map(opt => (
                    <Button
                      key={opt.val}
                      size="sm"
                      variant={config.targetLanguage === opt.val ? "primary" : "ghost"}
                      onPress={() => updateConfig("targetLanguage", opt.val as TargetLanguage)}
                      aria-label={opt.label}
                      className="font-bold text-xs justify-start"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-divider">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("dtoMatic.outputModeLabel")}</label>
                <div className="flex gap-2" role="radiogroup" aria-label={t("dtoMatic.outputModeLabel")}>
                  <Chip
                    size="sm"
                    variant={config.mode === "clean-arch" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("clean-arch")}
                    role="radio"
                    aria-checked={config.mode === "clean-arch"}
                  >{t("dtoMatic.cleanArch")}</Chip>
                  <Chip
                    size="sm"
                    variant={config.mode === "zod" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("zod")}
                    role="radio"
                    aria-checked={config.mode === "zod"}
                  >{t("dtoMatic.zodSchemaLabel")}</Chip>
                  <Chip
                    size="sm"
                    variant={config.mode === "quick" ? "primary" : "soft"}
                    className="cursor-pointer font-bold h-8"
                    onClick={() => setMode("quick")}
                    role="radio"
                    aria-checked={config.mode === "quick"}
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
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 dark:border-green-500/10 text-center">
                  <p className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 mb-1">{t("dtoMatic.totalTypes")}</p>
                  <p className="text-2xl font-black text-green-700 dark:text-green-400">{result.stats.totalTypes}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/10 text-center">
                  <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 mb-1">{t("dtoMatic.nestedObjects")}</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{result.stats.nestedObjects}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/10 text-center">
                  <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 mb-1">{t("dtoMatic.arraysLabel")}</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{result.stats.arrays}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 dark:border-purple-500/10 text-center">
                  <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">{t("dtoMatic.filesLabel")}</p>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{result.files.length}</p>
                </Card>
              </div>

              {isAIEnabled && (
                <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-500/20 dark:border-violet-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase text-violet-600 dark:text-violet-400 flex items-center gap-2 tracking-widest">
                      <Bot className="size-3" /> {t("dtoMatic.aiOptimizer")}
                    </h3>
                    <Button
                      size="sm"
                      variant="primary"
                      className="font-bold bg-violet-600 hover:bg-violet-700 border-none shadow-lg shadow-violet-500/20"
                      onPress={() => {
                        const code = selectedFile?.content || result.files.map(f => f.content).join("\n").slice(0, 3000);
                        void optimizeDtoWithAI(`Language: ${config.targetLanguage}, Mode: ${config.mode}\n\n${code}`);
                      }}
                      isLoading={isAILoading}
                    >
                      <Bot className="size-4 mr-2" /> {t("dtoMatic.aiOptimizeBtn")}
                    </Button>
                  </div>
                  {isAILoading && (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-violet-500/20 rounded w-3/4" />
                      <div className="h-3 bg-violet-500/20 rounded w-1/2" />
                    </div>
                  )}
                  {aiResult?.suggestions && aiResult.suggestions.length > 0 && !isAILoading && (
                    <div className="space-y-3">
                      {aiResult.suggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-background/80 rounded-xl border border-violet-500/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase text-violet-500">{t("dtoMatic.aiSuggestion")} #{i + 1}</span>
                            <span className="text-[10px] font-bold text-violet-400">{s.score}/100</span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-2 italic">{s.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Main Content Tabs */}
              <Tabs
                selectedKey={view as string}
                onSelectionChange={(k) => setView(k as string)}
                variant="primary"
              >
                <div className="flex justify-between items-end">
                  <Tabs.ListContainer>
                    <Tabs.List aria-label={t("dtoMatic.ariaOutputView")}>
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
                        aria-label={t("dtoMatic.ariaMockCount")}
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
                  <div className="grid gap-6 lg:grid-cols-12 h-[600px]">
                    <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[560px] pr-1">
                        {result.files.map((file) => {
                          const isActive = selectedFileId === file.id;
                          const typeColors: Record<string, string> = {
                            interface: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
                            entity: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
                            mapper: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
                            zod: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
                            struct: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200",
                            class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
                          };
                          return (
                            <Button
                              key={file.id}
                              variant={isActive ? "primary" : "ghost"}
                              onPress={() => setSelectedFileId(file.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 h-auto rounded-xl text-left justify-start w-full",
                                isActive
                                  ? "bg-primary/10 border-primary/30 shadow-sm"
                                  : "bg-transparent hover:bg-muted/50"
                              )}
                            >
                              <FileCode className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                              <div className="min-w-0 flex-1">
                                <span className={cn("text-sm font-medium block truncate", isActive && "text-primary font-bold")}>{file.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{file.language}</span>
                              </div>
                              <Chip size="sm" className={cn("capitalize text-[10px] font-bold shrink-0", typeColors[file.type] || "bg-muted text-muted-foreground")}>
                                {file.type}
                              </Chip>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-8 h-full">
                      <Card className="h-full p-0 border-primary/20 shadow-lg overflow-hidden bg-muted/30 dark:bg-muted/50 flex flex-col border-none">
                        <div className="p-3 bg-muted/50 border-b border-divider flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-primary ml-2">{selectedFile?.name}</span>
                          <div className="flex gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              onPress={() => {
                                if (!result) return;
                                const allCode = result.files.map(f => `// === ${f.name} ===\n${f.content}`).join("\n\n");
                                const blob = new Blob([allCode], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${config.rootName || "dto"}-generated.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              aria-label={t("dtoMatic.downloadAll")}
                            >
                              <Download className="size-3.5" />
                            </Button>
                            <CopyButton text={selectedFile?.content || ""} variant="ghost" size="sm" />
                          </div>
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
