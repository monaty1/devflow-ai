"use client";

import { useState, useMemo } from "react";
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
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { convertToAll } from "@/lib/application/variable-name-wizard";
import type { NameSuggestion, VariableType, WizardConfig, NamingConvention } from "@/types/variable-name-wizard";

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
  const [batchInput, setBatchInput] = useState("");
  const [batchTarget, setBatchTarget] = useState<NamingConvention>("camelCase");
  const batchResults = useMemo(() => {
    if (!batchInput.trim()) return [];
    return batchInput.split("\n").filter(l => l.trim()).map(name => {
      const result = convertToAll(name.trim());
      return { original: name.trim(), conversions: result.conversions };
    });
  }, [batchInput]);

  const suggestionColumns: ColumnConfig[] = [
    { name: t("table.colName"), uid: "name", sortable: true },
    { name: t("table.colQuality"), uid: "score", sortable: true },
    { name: t("table.colAudit"), uid: "audit" },
    { name: t("table.colActions"), uid: "actions" },
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
                  suggestion.score > 80 ? "bg-emerald-500 dark:bg-emerald-400" : suggestion.score > 50 ? "bg-amber-500 dark:bg-amber-400" : "bg-danger"
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
              audit?.status === "good" ? "text-emerald-500 dark:text-emerald-400" : audit?.status === "warning" ? "text-amber-500 dark:text-amber-400" : "text-danger"
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
    { id: "variable", label: t("varName.typeVariable"), icon: Code2 },
    { id: "function", label: t("varName.typeFunction"), icon: Wand2 },
    { id: "constant", label: t("varName.typeConstant"), icon: ListIcon },
    { id: "class", label: t("varName.typeClass"), icon: BookOpen },
    { id: "hook", label: t("varName.typeHook"), icon: Sparkles },
    { id: "component", label: t("varName.typeComponent"), icon: LayoutGrid },
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

      <ToolSuggestions toolId="variable-name-wizard" input={input} output={generationResult?.suggestions[0]?.name || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2 text-foreground/80">
                <Settings2 className="size-4 text-primary" />
                {t("varName.wizardSetup")}
              </h3>
              <Button size="sm" variant="ghost" onPress={loadExample}>{t("varName.exampleBtn")}</Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("varName.contextDescLabel")}</label>
                <TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("varName.inputPlaceholder")}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      if (input.trim()) (activeTab === "generate" ? generate : convert)();
                    }
                  }}
                  className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-inner"
                  aria-label={t("varName.contextDescLabel")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("varName.targetLang")}</label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("varName.targetLang")}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => updateConfig("language", lang.id as WizardConfig["language"])}
                      role="radio"
                      aria-checked={config.language === lang.id}
                      aria-label={lang.label}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                        config.language === lang.id
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <lang.icon className="size-3" aria-hidden="true" />
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
                  aria-label={t("varName.variableType")}
                >
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("varName.variableType")}</Label>
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
                {t("varName.castSpell")}
              </Button>
            </div>
          </Card>

          {/* Luxury Score Summary */}
          {generationResult && (
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/15 dark:to-blue-500/15 shadow-xl shadow-primary/5 border border-default-200 dark:border-default-100">
              <h3 className="text-xs font-black uppercase text-muted-foreground mb-6 flex items-center gap-2 tracking-widest">
                <Activity className="size-3 text-emerald-500 dark:text-emerald-400" /> {t("varName.semanticAnalysis")}
              </h3>
              <div className="space-y-6">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-1">{t("varName.clarityLabel")}</p>
                    <p className={cn("text-xl font-black", (generationResult.suggestions[0]?.score ?? 0) >= 80 ? "text-emerald-600 dark:text-emerald-400" : (generationResult.suggestions[0]?.score ?? 0) >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
                      {(generationResult.suggestions[0]?.score ?? 0) >= 80 ? t("varName.highLabel") : (generationResult.suggestions[0]?.score ?? 0) >= 50 ? t("varName.mediumLabel") : t("varName.lowLabel")}
                    </p>
                  </div>
                  <div className="size-px h-8 bg-default-200" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-1">{t("varName.avgScore")}</p>
                    <p className="text-xl font-black text-blue-500 dark:text-blue-400">
                      {Math.round(generationResult.suggestions.reduce((sum, s) => sum + s.score, 0) / generationResult.suggestions.length)}%
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-2xl border border-default-200">
                  <p className="text-[10px] text-primary font-bold mb-2 uppercase">{t("varName.proTip")}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {t("varName.proTipQuote")}
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
              <Tabs.List aria-label={t("varName.ariaWizardMode")}>
                <Tabs.Tab id="generate">{t("varName.smartSuggestions")}</Tabs.Tab>
                <Tabs.Tab id="convert">{t("varName.caseTransformer")}</Tabs.Tab>
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
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{t("varName.recommendedChoice")}</p>
                          <h4 className="text-xl font-black font-mono">{generationResult.suggestions[0]?.name}</h4>
                        </div>
                        <StatusBadge variant="success">{t("varName.bestMatch")}</StatusBadge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <CopyButton text={generationResult.suggestions[0]?.name || ""} size="sm" />
                      </div>
                    </Card>

                    <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{t("varName.namingScoreLabel")}</p>
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
                        {t("varName.soundAlternatives")}
                      </h3>
                    </div>
                    <DataTable
                      columns={suggestionColumns}
                      data={generationResult.suggestions}
                      filterField="name"
                      renderCell={renderSuggestionCell}
                      initialVisibleColumns={["name", "score", "audit", "actions"]}
                      emptyContent={t("varName.noSuggestionsAvail")}
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
                  <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">{t("varName.readyToMagic")}</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                    {t("varName.readyToMagicDesc")}
                  </p>
                </Card>
              )}
            </Tabs.Panel>

            <Tabs.Panel id="convert">
              <div className="space-y-6">
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
                  <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-[300px]">
                    <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Wand2 className="size-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-black mb-1 opacity-80 text-foreground/50">{t("varName.readyToMagic")}</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
                      {t("varName.readyToMagicDesc")}
                    </p>
                  </Card>
                )}

                {/* Batch Rename */}
                <Card className="p-6 border-violet-500/20 bg-violet-500/5">
                  <h3 className="text-xs font-black uppercase text-violet-600 mb-4 flex items-center gap-2 tracking-widest">
                    <Layers className="size-3" /> {t("varName.batchRename")}
                  </h3>
                  <TextArea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={t("varName.batchPlaceholder")}
                    className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-3 font-mono text-xs focus:ring-2 focus:ring-violet-500/20 shadow-inner mb-3"
                    aria-label={t("varName.batchRename")}
                  />
                  <div className="flex gap-2 mb-4" role="radiogroup" aria-label={t("varName.batchTarget")}>
                    {(["camelCase", "snake_case", "PascalCase", "kebab-case", "SCREAMING_SNAKE"] as NamingConvention[]).map(c => (
                      <button
                        key={c}
                        role="radio"
                        aria-checked={batchTarget === c}
                        onClick={() => setBatchTarget(c)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold transition-all border",
                          batchTarget === c ? "bg-violet-500 text-white border-violet-500" : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {batchResults.length > 0 && (
                    <div className="space-y-2">
                      {batchResults.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-violet-500/10">
                          <span className="font-mono text-xs text-muted-foreground">{r.original}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                              {String(r.conversions[batchTarget] ?? r.original)}
                            </span>
                            <CopyButton text={String(r.conversions[batchTarget] ?? r.original)} size="sm" variant="ghost" />
                          </div>
                        </div>
                      ))}
                      <CopyButton
                        text={batchResults.map(r => String(r.conversions[batchTarget] ?? r.original)).join("\n")}
                        label={t("varName.copyAll")}
                        className="w-full mt-2 font-bold"
                      />
                    </div>
                  )}
                </Card>
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
