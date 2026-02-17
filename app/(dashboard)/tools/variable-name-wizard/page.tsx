"use client";

import { useState, useCallback, useMemo } from "react";
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
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Copy,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  Code2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useVariableNameWizard } from "@/hooks/use-variable-name-wizard";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { NameSuggestion, VariableType, NamingConvention } from "@/types/variable-name-wizard";

export default function VariableNameWizardPage() {
  const { t } = useTranslation();
  const {
    input,
    mode,
    config,
    conversionResult,
    generationResult,
    setInput,
    setMode,
    updateConfig,
    convert,
    generate,
    reset,
    loadExample,
  } = useVariableNameWizard();

  const [activeTab, setActiveTab] = useState<"convert" | "generate">("generate");

  const suggestionColumns: ColumnConfig[] = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "SCORE", uid: "score", sortable: true },
    { name: "REASONING", uid: "reasoning" },
    { name: "AUDIT", uid: "audit" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderSuggestionCell = (suggestion: NameSuggestion, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-bold text-primary">{suggestion.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
              {suggestion.convention}
            </span>
          </div>
        );
      case "score":
        return (
          <div className="flex items-center gap-2">
            <Progress 
              value={suggestion.score} 
              size="sm" 
              color={suggestion.score > 80 ? "success" : suggestion.score > 50 ? "warning" : "danger"} 
              className="w-12 h-1.5"
            />
            <span className="text-xs font-black">{suggestion.score}%</span>
          </div>
        );
      case "reasoning":
        return <span className="text-xs text-muted-foreground italic line-clamp-1">{suggestion.reasoning}</span>;
      case "audit":
        const audit = suggestion.audit;
        const Icon = audit.status === "good" ? ShieldCheck : audit.status === "warning" ? AlertTriangle : ShieldAlert;
        return (
          <Tooltip content={audit.findings.join(". ")}>
            <div className="flex items-center">
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

  const TYPE_OPTIONS: { id: VariableType; label: string; icon: React.ElementType }[] = [
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
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(k) => {
                const key = k as "convert" | "generate";
                setActiveTab(key);
                setMode(key);
              }}
              variant="underlined"
              classNames={{ tabList: "gap-6 mb-4", cursor: "bg-primary" }}
            >
              <Tab key="generate" title="Create Names" />
              <Tab key="convert" title="Reformat" />
            </Tabs>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {activeTab === "generate" ? "Describe your variable" : "Enter current name"}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeTab === "generate" ? "e.g. status of the user authentication" : "e.g. user_auth_status"}
                  className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-inner"
                />
              </div>

              {activeTab === "generate" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Context</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateConfig("type", opt.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                          config.type === opt.id 
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                            : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground"
                        )}
                      >
                        <opt.icon className="size-3.5" />
                        <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onPress={activeTab === "generate" ? generate : convert} 
                color="primary"
                className="w-full h-12 font-bold shadow-lg shadow-primary/20"
              >
                <Sparkles className="size-4 mr-2" /> 
                {activeTab === "generate" ? "Generate Magic Names" : "Apply Transformations"}
              </Button>
            </div>
          </Card>

          {/* Quick Recommendations */}
          <Card className="p-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/20">
            <h3 className="text-xs font-black uppercase opacity-80 mb-4 flex items-center gap-2 tracking-widest">
              <BookOpen className="size-3" /> Standard Best Practices
            </h3>
            <div className="space-y-3">
              {[
                { l: "Variables", c: "camelCase" },
                { l: "Constants", c: "SCREAMING_SNAKE" },
                { l: "Classes", c: "PascalCase" },
                { l: "Private", c: "_camelCase" },
              ].map(rec => (
                <div key={rec.l} className="flex justify-between items-center bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <span className="text-[10px] font-black uppercase">{rec.l}</span>
                  <Chip size="sm" variant="flat" className="bg-white/20 text-white font-mono text-[10px] h-5">{rec.c}</Chip>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "generate" && generationResult ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card className="p-4 text-center border-b-4 border-b-emerald-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Top Suggestion</p>
                  <p className="text-lg font-black truncate text-primary">{generationResult.suggestions[0]?.name}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-violet-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Options</p>
                  <p className="text-2xl font-black">{generationResult.suggestions.length}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-indigo-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Type</p>
                  <p className="text-sm font-black capitalize">{generationResult.type}</p>
                </Card>
                <Card className="p-4 text-center border-b-4 border-b-amber-500">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Audit Status</p>
                  <div className="flex justify-center pt-1">
                    <StatusBadge variant={generationResult.suggestions[0]?.audit.status === "good" ? "success" : "warning"}>
                      {generationResult.suggestions[0]?.audit.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                </Card>
              </div>

              <Card className="p-0 overflow-hidden shadow-xl border-divider">
                <div className="p-4 bg-muted/30 border-b border-divider flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    Recommended Professional Names
                  </h3>
                </div>
                <DataTable
                  columns={suggestionColumns}
                  data={generationResult.suggestions}
                  filterField="name"
                  renderCell={renderSuggestionCell}
                  initialVisibleColumns={["name", "score", "audit", "actions"]}
                />
              </Card>
            </>
          ) : activeTab === "convert" && conversionResult ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(conversionResult.conversions).map(([convention, value]) => (
                <Card key={convention} className="p-4 group hover:border-primary/30 transition-all border-2 border-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                      {convention}
                    </span>
                    <CopyButton text={value} size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-mono text-sm font-bold text-primary break-all">{value}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Wand2 className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">Ready to Magic Name</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Describe the purpose of your variable or paste a name to transform it into professional naming conventions.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
