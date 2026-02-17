"use client";

import { useState, useCallback } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Chip,
  Progress,
  Tooltip,
  Input,
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
} from "lucide-react";
import { useVariableNameWizard } from "@/hooks/use-variable-name-wizard";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { NameSuggestion, VariableType } from "@/types/variable-name-wizard";

export default function VariableNameWizardPage() {
  const { t } = useTranslation();
  const {
    input,
    config,
    conversionResult,
    generationResult,
    isProcessing,
    setInput,
    setMode,
    updateConfig,
    convert,
    generate,
    reset,
    loadExample,
  } = useVariableNameWizard();

  const [activeTab, setActiveTab] = useState<"generate" | "convert">("generate");

  const suggestionColumns: ColumnConfig[] = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "QUALITY", uid: "score", sortable: true },
    { name: "AUDIT", uid: "audit" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderSuggestionCell = (suggestion: NameSuggestion, columnKey: React.Key) => {
    switch (columnKey) {
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
        const Icon = audit.status === "good" ? ShieldCheck : audit.status === "warning" ? AlertTriangle : ShieldAlert;
        return (
          <Tooltip content={audit.findings.length > 0 ? audit.findings.join(". ") : "Perfect naming logic applied."}>
            <div className="flex items-center cursor-help">
              <Icon className={cn(
                "size-4",
                audit.status === "good" ? "text-emerald-500" : audit.status === "warning" ? "text-amber-500" : "text-danger"
              )} />
            </div>
          </Tooltip>
        );
      case "actions":
        return <CopyButton text={suggestion.name} size="sm" variant="ghost" />;
      default:
        return (suggestion as any)[columnKey];
    }
  };

  const LANGUAGES = [
    { id: "typescript", label: "TypeScript", icon: Globe },
    { id: "python", label: "Python", icon: Code2 },
    { id: "java", label: "Java", icon: Box },
    { id: "go", label: "Go", icon: Zap },
    { id: "csharp", label: "C# .NET", icon: Layers },
  ];

  const TYPE_OPTIONS: { id: VariableType; label: string; icon: any }[] = [
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
              <Button size="sm" variant="flat" onPress={loadExample}>Example</Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Context / Description</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. get the active user session token"
                  className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Target Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => updateConfig("language" as any, lang.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                        config.language === lang.id 
                          ? "bg-primary text-primary-foreground border-primary shadow-md" 
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
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Variable Type</label>
                <select 
                  className="w-full h-10 rounded-xl border border-divider bg-background px-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20"
                  value={config.type}
                  onChange={(e) => updateConfig("type", e.target.value as VariableType)}
                >
                  {TYPE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>

              <Button 
                onPress={activeTab === "generate" ? generate : convert} 
                color="primary"
                className="w-full h-12 font-black shadow-lg shadow-primary/20 text-md"
                isLoading={isProcessing}
              >
                <Sparkles className="size-4 mr-2" /> 
                Cast Naming Spell
              </Button>
            </div>
          </Card>

          {/* Luxury Score Summary */}
          {generationResult && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20">
              <h3 className="text-xs font-black uppercase opacity-60 mb-6 flex items-center gap-2 tracking-widest">
                <Activity className="size-3" /> Semantical Analysis
              </h3>
              <div className="space-y-6">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Clarity</p>
                    <p className="text-xl font-black text-emerald-400">High</p>
                  </div>
                  <div className="size-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Concision</p>
                    <p className="text-xl font-black text-blue-400">92%</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-primary-400 font-bold mb-2 uppercase">Pro Tip</p>
                  <p className="text-xs opacity-70 leading-relaxed italic">
                    "Use intent-revealing names. The name of a variable should tell you why it exists, what it does, and how it is used."
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(k) => setActiveTab(k as any)}
            variant="solid"
            color="primary"
            classNames={{ tabList: "bg-muted/50 rounded-xl p-1" }}
          >
            <Tab key="generate" title="Smart Suggestions" />
            <Tab key="convert" title="Case Transformer" />
          </Tabs>

          {activeTab === "generate" && generationResult ? (
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
                    <Button size="sm" variant="flat" color="success" className="font-bold">Usage Guide</Button>
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
                  <Progress value={generationResult.suggestions[0]?.score} color="primary" className="h-1.5 mt-4" />
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
            </div>
          ) : activeTab === "convert" && conversionResult ? (
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
                    <CopyButton text={value} size="xs" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-mono text-sm font-black text-primary break-all">{value}</p>
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
        </div>
      </div>
    </div>
  );
}
