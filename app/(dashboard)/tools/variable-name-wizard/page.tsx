"use client";

import { useState } from "react";
import {
  Tabs,
  TextArea,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import {
  Wand2,
  RotateCcw,
  Sparkles,
  List as ListIcon,
  BookOpen,
  Code2,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Star,
  Activity,
  Fingerprint,
  Box,
  Layers,
  Zap,
  LayoutGrid,
  Settings2,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { useVariableNameWizard } from "@/hooks/use-variable-name-wizard";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { NameSuggestion, VariableType, WizardConfig } from "@/types/variable-name-wizard";

export default function VariableNameWizardPage() {
  const { t } = useTranslation();
  const {
    input,
    config,
    conversionResult,
    generationResult,
    isProcessing,
    setInput,
    updateConfig,
    convert,
    generate,
    reset,
    loadExample,
  } = useVariableNameWizard();

  const { suggestWithAI, aiResult: aiSuggestResult, isAILoading: isAISuggesting } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"generate" | "convert" | string>("generate");

  const suggestionColumns: ColumnConfig[] = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "QUALITY", uid: "score", sortable: true },
    { name: "AUDIT", uid: "audit" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderSuggestionCell = (suggestion: NameSuggestion, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "name":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-black text-primary">{suggestion.name}</span>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
              {suggestion.convention}
            </span>
          </div>
        );
      case "score":
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
              <div 
                className={cn(
                  "h-full transition-all duration-1000",
                  suggestion.score > 80 ? "bg-emerald-500" : suggestion.score > 50 ? "bg-amber-500" : "bg-danger"
                )}
                style={{ width: `${suggestion.score}%` }}
              />
            </div>
            <span className="text-[10px] font-black">{suggestion.score}%</span>
          </div>
        );
      case "audit":
        const audit = suggestion.audit;
        const Icon = audit?.status === "good" ? ShieldCheck : audit?.status === "warning" ? AlertTriangle : ShieldAlert;
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn(
              "size-4",
              audit?.status === "good" ? "text-emerald-500" : audit?.status === "warning" ? "text-amber-500" : "text-danger"
            )} />
            {audit?.findings?.length ? (
              <span className="text-[9px] text-muted-foreground max-w-[120px] truncate">{audit.findings[0]}</span>
            ) : null}
          </div>
        );
      case "actions":
        return <CopyButton text={suggestion.name} size="sm" variant="ghost" />;
      default:
        return String(suggestion[key as keyof typeof suggestion] ?? "");
    }
  };

  const LANGUAGES = [
    { id: "typescript", label: "TypeScript", icon: Globe },
    { id: "python", label: "Python", icon: Code2 },
    { id: "java", label: "Java", icon: Box },
    { id: "go", label: "Go", icon: Zap },
    { id: "csharp", label: "C# .NET", icon: Layers },
  ];

  const TYPE_OPTIONS: { id: VariableType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "variable", label: "Variable", icon: Code2 },
    { id: "function", label: "Function", icon: Wand2 },
    { id: "constant", label: "Constant", icon: ListIcon },
    { id: "class", label: "Class/Type", icon: BookOpen },
    { id: "hook", label: "React Hook", icon: Sparkles },
    { id: "component", label: "Component", icon: LayoutGrid },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={Wand2}
        gradient="from-violet-500 to-purple-600"
        title={t("varName.title")}
        description={t("varName.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2 text-foreground/80">
                <Settings2 className="size-4 text-primary" />
                Wizard Setup
              </h3>
              <Button size="sm" variant="ghost" onPress={loadExample}>Example</Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Context / Description</label>
                <TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. get the active user session token"
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      if (input.trim()) (activeTab === "generate" ? generate : convert)();
                    }
                  }}
                  className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-inner"
                  aria-label="Context / Description"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Target Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => updateConfig("language", lang.id as WizardConfig["language"])}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                        config.language === lang.id 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <lang.icon className="size-3" />
                      <span className="text-[10px] font-bold uppercase">{lang.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Select
                  value={config.type}
                  onChange={(value) => { if (value) updateConfig("type", value as VariableType); }}
                  className="w-full"
                  aria-label="Variable Type"
                >
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Variable Type</Label>
                  <Select.Trigger className="h-10 rounded-xl border border-divider bg-background px-3 text-xs font-bold uppercase">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {TYPE_OPTIONS.map(opt => (
                        <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                          {opt.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <Button
                onPress={() => {
                  if (activeTab === "generate") {
                    generate();
                    if (isAIEnabled) {
                      suggestWithAI(input, config.type, config.language).catch(() => {
                        addToast(t("ai.unavailableLocal"), "info");
                      });
                    }
                  } else {
                    convert();
                  }
                }}
                variant="primary"
                className="w-full h-12 font-black shadow-xl shadow-primary/20 text-md"
                isLoading={isProcessing}
                isDisabled={!input.trim()}
              >
                <Sparkles className="size-4 mr-2" />
                Cast Naming Spell
              </Button>
            </div>
          </Card>

          {/* Luxury Score Summary */}
          {generationResult && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20 border-none">
              <h3 className="text-xs font-black uppercase opacity-60 mb-6 flex items-center gap-2 tracking-widest">
                <Activity className="size-3 text-emerald-400" /> Semantical Analysis
              </h3>
              <div className="space-y-6">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Clarity</p>
                    <p className={cn("text-xl font-black", (generationResult.suggestions[0]?.score ?? 0) >= 80 ? "text-emerald-400" : (generationResult.suggestions[0]?.score ?? 0) >= 50 ? "text-amber-400" : "text-red-400")}>
                      {(generationResult.suggestions[0]?.score ?? 0) >= 80 ? "High" : (generationResult.suggestions[0]?.score ?? 0) >= 50 ? "Medium" : "Low"}
                    </p>
                  </div>
                  <div className="size-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Avg Score</p>
                    <p className="text-xl font-black text-blue-400">
                      {Math.round(generationResult.suggestions.reduce((sum, s) => sum + s.score, 0) / generationResult.suggestions.length)}%
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-primary-400 font-bold mb-2 uppercase">Pro Tip</p>
                  <p className="text-xs opacity-70 leading-relaxed italic">
                    &quot;Use intent-revealing names. The name of a variable should tell you why it exists, what it does, and how it is used.&quot;
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs
            selectedKey={activeTab as string}
            onSelectionChange={(k) => setActiveTab(k as string)}
            variant="primary"
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Wizard mode">
                <Tabs.Tab id="generate">Smart Suggestions</Tabs.Tab>
                <Tabs.Tab id="convert">Case Transformer</Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="generate">
              {generationResult ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Leaderboard Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-6 border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Recommended Choice</p>
                          <h4 className="text-xl font-black font-mono">{generationResult.suggestions[0]?.name}</h4>
                        </div>
                        <StatusBadge variant="success">BEST MATCH</StatusBadge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <CopyButton text={generationResult.suggestions[0]?.name || ""} size="sm" />
                      </div>
                    </Card>

                    <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Naming Score</p>
                          <h4 className="text-2xl font-black">{generationResult.suggestions[0]?.score}/100</h4>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-full text-blue-600"><Star className="size-5 fill-current" /></div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-4">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${generationResult.suggestions[0]?.score}%` }}
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Suggestions Table */}
                  <Card className="p-0 overflow-hidden shadow-xl border-divider">
                    <div className="p-4 border-b border-divider flex items-center justify-between bg-muted/20">
                      <h3 className="font-bold flex items-center gap-2 text-sm">
                        <Sparkles className="size-4 text-primary" />
                        Technically Sound Alternatives
                      </h3>
                    </div>
                    <DataTable
                      columns={suggestionColumns}
                      data={generationResult.suggestions}
                      filterField="name"
                      renderCell={renderSuggestionCell}
                      initialVisibleColumns={["name", "score", "audit", "actions"]}
                      emptyContent="No suggestions available."
                    />
                  </Card>

                  {/* AI Suggestions */}
                  {isAIEnabled && (isAISuggesting || aiSuggestResult) && (
                    <Card className="p-6 border-violet-500/20 bg-violet-500/5 shadow-xl shadow-violet-500/5" role="region" aria-label={t("ai.poweredSuggestions")}>
                      <div className="mb-4 flex items-center gap-2">
                        <Bot className="size-5 text-violet-500" aria-hidden="true" />
                        <h3 className="font-bold text-sm">{t("ai.poweredSuggestions")}</h3>
                        {isAISuggesting && (
                          <span className="text-xs text-muted-foreground animate-pulse ml-auto">{t("ai.generating")}</span>
                        )}
                      </div>
                      {aiSuggestResult && aiSuggestResult.suggestions.length > 0 && (
                        <div className="space-y-3">
                          {aiSuggestResult.suggestions.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-violet-500/10">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-sm font-black text-violet-600 dark:text-violet-400">{s.value}</span>
                                <span className="text-[10px] text-muted-foreground">{s.reasoning}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{s.score}%</span>
                                <CopyButton text={s.value} size="sm" variant="ghost" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-[500px]">
                  <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Wand2 className="size-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">Ready to Magic Name</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                    Describe the purpose of your variable or paste a name to transform it into professional naming conventions for any language.
                  </p>
                </Card>
              )}
            </Tabs.Panel>

            <Tabs.Panel id="convert">
              {conversionResult ? (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {Object.entries(conversionResult.conversions).map(([convention, value]) => (
                    <Card key={convention} className="p-5 group hover:border-primary/30 transition-all border-2 border-transparent relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                        <Fingerprint className="size-16" />
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                          {convention}
                        </span>
                        <CopyButton text={value as string} size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="font-mono text-sm font-black text-primary break-all">{value as string}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-[500px]">
                  <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Wand2 className="size-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">Ready to Magic Name</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                    Describe the purpose of your variable or paste a name to transform it into professional naming conventions for any language.
                  </p>
                </Card>
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
