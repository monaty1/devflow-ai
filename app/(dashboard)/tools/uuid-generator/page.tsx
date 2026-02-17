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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Fingerprint,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Download,
  List,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Database,
  ChevronDown,
} from "lucide-react";
import { useUuidGenerator } from "@/hooks/use-uuid-generator";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { UuidInfo, UuidVersion, UuidFormat } from "@/types/uuid-generator";

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
    validate,
    reset,
    exportBulk,
  } = useUuidGenerator();

  const [activeTab, setActiveTab] = useState<"generate" | "analyze">("generate");
  const [analyzeInput, setAnalyzeInput] = useState("");
  const [exportFormat, setExportFormat] = useState<"text" | "json" | "csv" | "sql">("text");

  const VERSIONS: { id: UuidVersion; label: string; desc: string }[] = [
    { id: "v4", label: "Version 4 (Random)", desc: t("uuid.v4Desc") },
    { id: "v7", label: "Version 7 (Time-sortable)", desc: t("uuid.v7Desc") },
    { id: "v1", label: "Version 1 (Time-based)", desc: t("uuid.v1Desc") },
    { id: "nil", label: "Nil UUID", desc: t("uuid.nilDesc") },
    { id: "max", label: "Max UUID", desc: t("uuid.maxDesc") },
  ];

  const FORMATS: { id: UuidFormat; label: string }[] = [
    { id: "standard", label: t("uuid.formatStandard") },
    { id: "uppercase", label: t("uuid.formatUppercase") },
    { id: "no-hyphens", label: t("uuid.formatNoHyphens") },
    { id: "braces", label: t("uuid.formatBraces") },
    { id: "urn", label: t("uuid.formatUrn") },
  ];

  const analysisColumns: ColumnConfig[] = [
    { name: "FIELD", uid: "field" },
    { name: "VALUE", uid: "value" },
    { name: "STATUS", uid: "status" },
  ];

  const analysisData = useMemo(() => {
    if (!analysis) return [];
    return [
      { id: "valid", field: "Validity", value: analysis.isValid ? "Valid UUID" : "Invalid", status: analysis.isValid ? "good" : "bad" },
      { id: "version", field: "Version", value: `v${analysis.version}`, status: "neutral" },
      { id: "variant", field: "Variant", value: analysis.variant, status: "neutral" },
      { 
        id: "time", 
        field: "Timestamp", 
        value: analysis.timestamp ? analysis.timestamp.toLocaleString() : "Not Applicable", 
        status: analysis.timestamp ? "info" : "neutral" 
      },
      { 
        id: "mac", 
        field: "Node (MAC)", 
        value: analysis.node || "Hidden / Random", 
        status: analysis.node ? "warning" : "good" 
      },
    ];
  }, [analysis]);

  const renderAnalysisCell = (item: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "field":
        return <span className="font-bold text-xs uppercase text-muted-foreground">{item.field}</span>;
      case "value":
        return <span className="font-mono text-sm">{item.value}</span>;
      case "status":
        const color = item.status === "good" ? "success" : item.status === "bad" ? "danger" : item.status === "warning" ? "warning" : "default";
        return <StatusBadge variant={color}>{item.status.toUpperCase()}</StatusBadge>;
      default:
        return item[columnKey];
    }
  };

  const handleExport = () => {
    if (!result?.uuids.length) return;
    const content = exportBulk(result.uuids, exportFormat);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(t("uuid.toastExported", { format: exportFormat.toUpperCase() }), "success");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(k) => setActiveTab(k as any)}
              variant="underlined"
              classNames={{ tabList: "gap-6 mb-4", cursor: "bg-primary" }}
            >
              <Tab key="generate" title={t("uuid.tabGenerate")} />
              <Tab key="analyze" title={t("uuid.tabParse")} />
            </Tabs>

            {activeTab === "generate" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("uuid.versionTitle")}</label>
                  <div className="grid gap-2">
                    {VERSIONS.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => updateConfig("version", v.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border transition-all text-left",
                          config.version === v.id 
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                            : "bg-muted/30 border-transparent hover:bg-muted/50"
                        )}
                      >
                        <span className="text-xs font-bold">{v.label}</span>
                        <span className="text-[10px] opacity-60">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("uuid.quantity")}</label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={1000} 
                      value={config.quantity.toString()} 
                      onChange={(e) => updateConfig("quantity", parseInt(e.target.value) || 1)}
                      variant="bordered"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("uuid.formatTitle")}</label>
                    <select
                      className="w-full h-10 rounded-xl border border-divider bg-background px-3 text-sm"
                      value={config.format}
                      onChange={(e) => updateConfig("format", e.target.value as UuidFormat)}
                    >
                      {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                </div>

                <Button 
                  onPress={generate} 
                  color="primary"
                  className="w-full h-12 font-bold shadow-lg shadow-primary/20"
                >
                  <Sparkles className="size-4 mr-2" /> {t("uuid.generate")}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("uuid.parseInputLabel")}</label>
                  <textarea
                    value={analyzeInput}
                    onChange={(e) => setAnalyzeInput(e.target.value)}
                    placeholder={t("uuid.parsePlaceholder")}
                    className="h-32 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
                  />
                </div>
                <Button 
                  onPress={() => analyze(analyzeInput)} 
                  color="secondary"
                  className="w-full h-12 font-bold shadow-lg shadow-secondary/20"
                  isDisabled={!analyzeInput.trim()}
                >
                  <Search className="size-4 mr-2" /> {t("uuid.parse")}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "generate" && result ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <List className="size-5 text-primary" />
                  Generated UUIDs ({result.uuids.length})
                </h3>
                <div className="flex gap-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button size="sm" variant="flat" endContent={<ChevronDown className="size-3" />}>
                        Export: {exportFormat.toUpperCase()}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu onAction={(k) => setExportFormat(k as any)}>
                      <DropdownItem key="text">Text List</DropdownItem>
                      <DropdownItem key="json">JSON Array</DropdownItem>
                      <DropdownItem key="csv">CSV File</DropdownItem>
                      <DropdownItem key="sql">SQL Insert</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button size="sm" color="primary" onPress={handleExport}>
                    <Download className="size-3 mr-1" /> Download
                  </Button>
                  <CopyButton getText={() => exportBulk(result.uuids, "text")} label={t("uuid.copyAll")} />
                </div>
              </div>

              <Card className="p-0 border-primary/20 shadow-xl overflow-hidden h-[600px] flex flex-col">
                <pre className="p-6 font-mono text-sm leading-relaxed overflow-auto flex-1 bg-background text-foreground/80">
                  {exportBulk(result.uuids, exportFormat)}
                </pre>
              </Card>
            </>
          ) : activeTab === "analyze" && analysis ? (
            <>
              {/* Security Audit Card */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className={cn(
                  "p-6 border-l-4",
                  analysis.isExposed ? "border-l-warning bg-warning/5" : "border-l-success bg-success/5"
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full",
                      analysis.isExposed ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                    )}>
                      {analysis.isExposed ? <ShieldAlert className="size-6" /> : <ShieldCheck className="size-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t("uuid.securityAudit")}</h3>
                      <p className="text-sm opacity-80 mt-1">
                        {analysis.isExposed ? t("uuid.leakWarning") : t("uuid.secureRandom")}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm uppercase text-muted-foreground">{t("uuid.entropyScore")}</h3>
                    <span className="font-mono font-bold text-2xl">{analysis.entropyScore}%</span>
                  </div>
                  <Progress 
                    value={analysis.entropyScore} 
                    color={analysis.entropyScore > 80 ? "success" : analysis.entropyScore > 50 ? "warning" : "danger"} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    {t("uuid.collisionProb")}
                  </p>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card className="p-0 overflow-hidden shadow-lg border-divider">
                <DataTable
                  columns={analysisColumns}
                  data={analysisData}
                  filterField="field"
                  renderCell={renderAnalysisCell}
                  initialVisibleColumns={["field", "value", "status"]}
                />
              </Card>
            </>
          ) : (
            <Card className="p-20 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center text-center h-full">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="size-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2 opacity-80">UUID Command Center</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Generate cryptographically secure identifiers or audit existing ones for privacy leaks (MAC Address/Timestamp).
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
