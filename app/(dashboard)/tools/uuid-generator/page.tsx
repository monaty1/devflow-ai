"use client";

import { useState, useMemo } from "react";
import {
  Tabs,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  TextArea,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import {
  Fingerprint,
  RotateCcw,
  Sparkles,
  Search,
  Download,
  List,
  Clock,
  ChevronDown,
  Activity,
  Cpu,
  Binary,
} from "lucide-react";
import { useUuidGenerator } from "@/hooks/use-uuid-generator";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, Card } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import type { UuidVersion, UuidFormat } from "@/types/uuid-generator";

export default function UuidGeneratorPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const {
    config,
    result,
    analysis,
    updateConfig,
    generate,
    analyze,
    reset,
    exportBulk,
  } = useUuidGenerator();

  const [activeTab, setActiveTab] = useState<"generate" | "analyze" | string>("generate");
  const [analyzeInput, setAnalyzeInput] = useState("");
  const [exportFormat, setExportFormat] = useState<"text" | "json" | "csv" | "sql">("text");
  const [collisionInput, setCollisionInput] = useState("");
  const collisionResult = useMemo(() => {
    if (!collisionInput.trim()) return null;
    const lines = collisionInput.split("\n").map(l => l.trim().toLowerCase()).filter(Boolean);
    const seen = new Map<string, number[]>();
    lines.forEach((uuid, i) => {
      const existing = seen.get(uuid);
      if (existing) { existing.push(i + 1); } else { seen.set(uuid, [i + 1]); }
    });
    const duplicates = [...seen.entries()].filter(([, indices]) => indices.length > 1);
    return { total: lines.length, unique: seen.size, duplicates };
  }, [collisionInput]);

  const uuids = result?.uuids;
  const exportedContent = useMemo(() => {
    if (!uuids?.length) return "";
    return exportBulk(uuids, exportFormat);
  }, [uuids, exportFormat, exportBulk]);

  const VERSIONS: { id: UuidVersion; label: string; desc: string }[] = [
    { id: "v4", label: t("uuid.v4Label"), desc: t("uuid.v4DescShort") },
    { id: "v7", label: t("uuid.v7Label"), desc: t("uuid.v7DescShort") },
    { id: "v1", label: t("uuid.v1Label"), desc: t("uuid.v1DescShort") },
    { id: "nil", label: t("uuid.nilLabel"), desc: t("uuid.nilDescShort") },
    { id: "max", label: t("uuid.maxLabel"), desc: t("uuid.maxDescShort") },
  ];

  const FORMATS: { id: UuidFormat; label: string }[] = [
    { id: "standard", label: t("uuid.standardLower") },
    { id: "uppercase", label: t("uuid.uppercaseFormat") },
    { id: "no-hyphens", label: t("uuid.noHyphensFormat") },
    { id: "braces", label: t("uuid.bracesFormat") },
    { id: "urn", label: t("uuid.urnFormat") },
  ];

  const handleExport = () => {
    if (!result?.uuids.length) return;
    const content = exportedContent;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(t("uuid.exportedAs", { format: exportFormat.toUpperCase() }), "success");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Fingerprint}
        gradient="from-indigo-500 to-purple-600"
        title={t("uuid.title")}
        description={t("uuid.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="uuid-generator" input={analyzeInput} output={result?.uuids[0] || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <Tabs
              selectedKey={activeTab as string}
              onSelectionChange={(k) => setActiveTab(k as string)}
              variant="primary"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="UUID mode">
                  <Tabs.Tab id="generate">{t("uuid.generatorTab")}</Tabs.Tab>
                  <Tabs.Tab id="analyze">{t("uuid.analyzerTab")}</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="generate">
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("uuid.versionLabel")}</label>
                    <div className="grid gap-2">
                      {VERSIONS.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => updateConfig("version", v.id)}
                          className={cn(
                            "flex flex-col items-start p-3 rounded-xl border transition-all text-left",
                            config.version === v.id
                              ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                              : "bg-muted/30 border-transparent hover:bg-muted/50"
                          )}
                        >
                          <span className="text-xs font-bold">{v.label}</span>
                          <span className="text-[10px] opacity-60">{v.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("uuid.customPrefix")}</label>
                    <Input
                      variant="primary"
                      placeholder="e.g. deadbeef"
                      value={config.prefix}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^0-9a-fA-F]/g, "");
                        updateConfig("prefix", filtered);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("uuid.quantityLabel")}</label>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={config.quantity.toString()}
                        onChange={(e) => updateConfig("quantity", parseInt(e.target.value) || 1)}
                        variant="primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={config.format}
                        onChange={(value) => { if (value) updateConfig("format", value as UuidFormat); }}
                        className="w-full"
                        aria-label={t("uuid.formatLabelShort")}
                      >
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("uuid.formatLabelShort")}</Label>
                        <Select.Trigger className="h-10 rounded-xl border-2 border-divider bg-background px-3 text-sm">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {FORMATS.map(f => (
                              <ListBox.Item key={f.id} id={f.id} textValue={f.label}>
                                {f.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onPress={generate}
                    variant="primary"
                    className="w-full h-12 font-black shadow-lg shadow-primary/20 text-md"
                  >
                    <Sparkles className="size-4 mr-2" /> {t("uuid.generateSequence")}
                  </Button>
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="analyze">
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("uuid.uuidToInspect")}</label>
                    <TextArea
                      value={analyzeInput}
                      onChange={(e) => setAnalyzeInput(e.target.value)}
                      placeholder={t("uuid.pasteUuid")}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          if (analyzeInput.trim()) analyze(analyzeInput);
                        }
                      }}
                      className="h-32 w-full resize-none rounded-xl border-2 border-divider bg-background p-4 font-mono text-sm focus:border-primary outline-none transition-all shadow-inner"
                      aria-label={t("uuid.uuidToInspect")}
                    />
                  </div>
                  <Button
                    onPress={() => analyze(analyzeInput)}
                    variant="primary"
                    className="w-full h-12 font-black shadow-lg shadow-primary/20 bg-secondary"
                    isDisabled={!analyzeInput.trim()}
                  >
                    <Search className="size-4 mr-2" /> {t("uuid.deepAudit")}
                  </Button>
                </div>
              </Tabs.Panel>
            </Tabs>
          </Card>

          {/* Collision Checker */}
          <Card className="p-6 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-xs font-black uppercase text-amber-600 mb-4 flex items-center gap-2 tracking-widest">
              <Search className="size-3" /> {t("uuid.collisionChecker")}
            </h3>
            <TextArea
              value={collisionInput}
              onChange={(e) => setCollisionInput(e.target.value)}
              placeholder={t("uuid.collisionPlaceholder")}
              className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-3 font-mono text-[10px] focus:ring-2 focus:ring-amber-500/20 shadow-inner mb-3"
              aria-label={t("uuid.collisionChecker")}
            />
            {collisionResult && (
              <div className="space-y-2">
                <div className="flex gap-4 text-[10px] font-bold">
                  <span>{t("uuid.totalLabel")}: {collisionResult.total}</span>
                  <span className="text-emerald-600">{t("uuid.uniqueLabel")}: {collisionResult.unique}</span>
                  <span className={collisionResult.duplicates.length > 0 ? "text-red-600" : "text-emerald-600"}>
                    {t("uuid.duplicatesLabel")}: {collisionResult.duplicates.length}
                  </span>
                </div>
                {collisionResult.duplicates.map(([uuid, lines]) => (
                  <div key={uuid} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px]">
                    <span className="font-mono text-red-600 font-bold">{uuid}</span>
                    <span className="text-muted-foreground ml-2">{t("uuid.onLines")} {lines.join(", ")}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {activeTab === "generate" && result && (
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-none">
              <h3 className="text-xs font-black uppercase opacity-60 mb-6 tracking-widest flex items-center gap-2">
                <Activity className="size-3 text-emerald-400" /> {t("uuid.collisionHealth")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-40">{t("uuid.probabilityLabel")}</span>
                  <span className="text-sm font-black text-emerald-400">{result.collisionStats?.probability}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase opacity-40">{t("uuid.uniquenessLabel")}</span>
                  <span className="text-sm font-black text-blue-400">{t("uuid.guaranteed")}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] opacity-60 italic">
                  {t("uuid.collisionNote")}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "generate" && result ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-black text-lg flex items-center gap-2">
                  <List className="size-5 text-primary" />
                  {t("uuid.sequenceRegistry", { count: result.uuids.length })}
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button size="sm" variant="ghost" className="font-black flex-1 sm:flex-none border border-divider">
                        <div className="flex items-center gap-2">
                          {exportFormat.toUpperCase()}
                          <ChevronDown className="size-3" />
                        </div>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu onAction={(k) => setExportFormat(k as "text" | "json" | "csv" | "sql")}>
                      <DropdownItem key="text">{t("uuid.plainText")}</DropdownItem>
                      <DropdownItem key="json">{t("uuid.jsonArray")}</DropdownItem>
                      <DropdownItem key="csv">{t("uuid.csvTable")}</DropdownItem>
                      <DropdownItem key="sql">{t("uuid.sqlInsert")}</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button size="sm" variant="primary" onPress={handleExport} className="font-black">
                    <Download className="size-3 mr-1" /> {t("uuid.saveBtn")}
                  </Button>
                  <CopyButton getText={() => result.uuids.join("\n")} />
                </div>
              </div>

              <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col bg-background relative">
                <div className="absolute top-0 left-0 w-1 bg-primary h-full opacity-50" />
                <pre className="p-8 font-mono text-sm leading-relaxed overflow-auto flex-1 text-foreground/80 scrollbar-hide">
                  {exportedContent}
                </pre>
              </Card>
            </>
          ) : activeTab === "analyze" && analysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Analysis Overview Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6 text-center border-b-4 border-b-primary rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{t("uuid.versionLabel")}</p>
                  <p className="text-3xl font-black text-primary">v{analysis.version}</p>
                </Card>
                <Card className="p-6 text-center border-b-4 border-b-secondary rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{t("uuid.entropyLabel")}</p>
                  <p className="text-3xl font-black text-secondary">{analysis.entropyScore}%</p>
                </Card>
                <Card className="p-6 text-center border-b-4 border-b-emerald-500 rounded-b-none">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{t("uuid.statusLabel")}</p>
                  <div className="flex justify-center pt-1">
                    <StatusBadge variant={analysis.isValid ? "success" : "error"}>
                      {analysis.isValid ? t("uuid.secure") : t("uuid.corrupt")}
                    </StatusBadge>
                  </div>
                </Card>
              </div>

              {/* Binary Structure Visualizer */}
              <Card className="p-8 shadow-xl border-divider">
                <h3 className="text-xs font-black uppercase text-muted-foreground mb-8 flex items-center gap-2 tracking-widest">
                  <Binary className="size-4 text-primary" /> {t("uuid.binaryPayload")}
                </h3>
                <div className="flex flex-wrap gap-1 font-mono text-[9px] leading-none mb-10">
                  {analysis.binaryView?.map((part, i) => (
                    <span key={i} title={part.label}>
                      <div className={cn("flex flex-wrap gap-0.5 p-1 rounded transition-colors hover:bg-muted cursor-help", part.color)}>
                        {part.bits.split('').map((bit, j) => (
                          <span key={j} className={cn("w-2 h-3 flex items-center justify-center rounded-[1px]", bit === '1' ? "bg-current text-white" : "bg-muted text-muted-foreground")}>
                            {bit}
                          </span>
                        ))}
                      </div>
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-divider">
                  {analysis.binaryView?.map((part, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("size-2 rounded-full", part.color.replace('text-', 'bg-'))} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{part.label}</span>
                        <span className="text-[10px] font-mono font-bold">{part.bits.length} bits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Technical Profile */}
              <Card className="p-6 bg-muted/10">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-sm">
                  <Cpu className="size-4" /> {t("uuid.technicalProfile")}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-divider pb-2">
                    <span className="text-xs font-bold opacity-50 uppercase">{t("uuid.variantField")}</span>
                    <span className="text-xs font-mono font-bold">{analysis.variant}</span>
                  </div>
                  {analysis.timestamp && (
                    <div className="flex justify-between border-b border-divider pb-2">
                      <span className="text-xs font-bold opacity-50 uppercase">{t("uuid.embeddedTime")}</span>
                      <span className="text-xs font-mono font-bold flex items-center gap-2">
                        <Clock className="size-3" /> {analysis.timestamp.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {analysis.node && (
                    <div className="flex justify-between border-b border-divider pb-2 text-warning">
                      <span className="text-xs font-bold opacity-50 uppercase">{t("uuid.nodeField")}</span>
                      <span className="text-xs font-mono font-bold">{analysis.node}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-[600px]">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80 text-foreground/50">{t("uuid.controlCenter")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {t("uuid.controlCenterDesc")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
