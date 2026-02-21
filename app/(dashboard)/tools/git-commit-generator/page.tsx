"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Tabs,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  TextArea,
  Input,
  Checkbox,
} from "@heroui/react";
import {
  GitCommit,
  RotateCcw,
  Sparkles,
  Terminal,
  Github,
  FileDiff,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  LayoutList,
  History,
  ListPlus,
  AlertTriangle,
} from "lucide-react";
import { useGitCommitGenerator } from "@/hooks/use-git-commit-generator";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CommitType, CommitResult } from "@/types/git-commit-generator";
import { getCommitTypeInfo } from "@/lib/application/git-commit-generator";

export default function GitCommitGeneratorPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const {
    config,
    message,
    validation,
    history,
    commitTypes,
    diffInput,
    setDiffInput,
    updateConfig,
    generate,
    generateBatch,
    analyze,
    reset,
    clearHistory,
  } = useGitCommitGenerator();

  const [activeTab, setActiveTab] = useState<"composer" | "changelog" | "history" | string>("composer");
  const [batchInput, setBatchInput] = useState("");
  const batchMessages = useMemo(() => {
    if (!batchInput.trim()) return [];
    return generateBatch(batchInput.split("\n"));
  }, [batchInput, generateBatch]);

  const historyColumns: ColumnConfig[] = [
    { name: t("table.colMessage"), uid: "message", sortable: true },
    { name: t("table.colType"), uid: "type", sortable: true },
    { name: t("table.colScope"), uid: "scope" },
    { name: t("table.colActions"), uid: "actions" },
  ];

  const renderHistoryCell = useCallback((item: CommitResult, columnKey: React.Key) => {
    const key = columnKey.toString();
    switch (key) {
      case "message":
        return (
          <div className="flex flex-col gap-0.5 max-w-[300px]">
            <span className="font-mono text-xs font-black truncate text-primary">{item.message.split("\n")[0]}</span>
            <span className="text-[9px] opacity-40 font-mono italic truncate">{item.timestamp}</span>
          </div>
        );
      case "type":
        const info = getCommitTypeInfo(item.type);
        return <Chip size="sm" variant="primary" className="font-black text-[10px] uppercase">{info.emoji} {item.type}</Chip>;
      case "scope":
        return item.scope ? <Chip size="sm" variant="primary" color="default" className="font-bold text-[9px] uppercase">{item.scope}</Chip> : <span className="opacity-20">-</span>;
      case "actions":
        return <CopyButton text={item.message} size="sm" variant="ghost" />;
      default:
        return String(item[key as keyof CommitResult] ?? "");
    }
  }, []);

  const handleDiffAnalysis = () => {
    if (!diffInput.trim()) return;
    analyze();
    addToast(t("gitCommit.diffAnalyzed"), "success");
  };

  const changelog = useMemo(() => {
    return history.map(h => `- ${h.message.split('\n')[0]}`).join('\n');
  }, [history]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={GitCommit}
        gradient="from-slate-700 to-zinc-900"
        title={t("gitCommit.title")}
        description={t("gitCommit.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="git-commit-generator" input={config.description} output={message || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                {t("gitCommit.commitArchitect")}
              </h3>
              <div className="flex gap-1">
                <StatusBadge variant={config.description.length > 50 ? "warning" : "success"}>
                  {config.description.length}/72
                </StatusBadge>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("gitCommit.typeLabel")}</label>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="outline" className="w-full justify-between h-10 font-bold uppercase text-[10px]">
                        {config.type ? (
                          <span className="flex items-center gap-2">
                            {getCommitTypeInfo(config.type).emoji} {config.type}
                          </span>
                        ) : t("gitCommit.selectType")}
                        <ChevronRight className="size-3 rotate-90 opacity-40" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      selectionMode="single"
                      selectedKeys={new Set([config.type])}
                      onSelectionChange={(k) => updateConfig("type", Array.from(k)[0] as CommitType)}
                      className="max-h-64 overflow-auto"
                    >
                      {commitTypes.map(commitType => (
                        <DropdownItem key={commitType.type}>
                          <div className="flex items-center gap-2">
                            <span className="mr-2">{commitType.emoji}</span>
                            <div className="flex flex-col">
                              <span className="font-bold">{commitType.label}</span>
                              <span className="text-[10px] opacity-60">{commitType.description}</span>
                            </div>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("gitCommit.scopeLabel")}</label>
                  <Input 
                    variant="primary"
                    placeholder={t("gitCommit.scopePlaceholder")}
                    value={config.scope} 
                    onChange={(e) => updateConfig("scope", e.target.value)} 
                    className="font-bold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("gitCommit.summaryLabel")}</label>
                <Input
                  variant="primary"
                  placeholder={t("gitCommit.descriptionPlaceholder")}
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      if (validation.isValid) generate();
                    }
                  }}
                  className="font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("gitCommit.descBody")}</label>
                  <button
                    type="button"
                    onClick={() => updateConfig("body", config.body + "\n- ")}
                    className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline"
                    aria-label={t("gitCommit.addPoint")}
                  >
                    <ListPlus className="size-2.5" aria-hidden="true" /> {t("gitCommit.addPoint")}
                  </button>
                </div>
                <TextArea
                  placeholder={t("gitCommit.bodyPlaceholder")}
                  value={config.body}
                  onChange={(e) => updateConfig("body", e.target.value)}
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{t("gitCommit.refsLabel")}</label>
                    <Input 
                      variant="primary"
                      placeholder={t("gitCommit.issuesPlaceholder")}
                      value={config.issueRef} 
                      onChange={(e) => updateConfig("issueRef", e.target.value)} 
                      className="font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-2 justify-end pb-1.5">
                    <Checkbox
                      isSelected={config.useEmojis}
                      onChange={(v: boolean) => updateConfig("useEmojis", v)}
                      className="text-[10px] font-black uppercase"
                    >
                      {t("gitCommit.useGitmoji")}
                    </Checkbox>
                    <Checkbox
                      isSelected={config.requireIssue}
                      onChange={(v: boolean) => updateConfig("requireIssue", v)}
                      className="text-[10px] font-black uppercase"
                    >
                      {t("gitCommit.mandatoryIssue")}
                    </Checkbox>
                  </div>
                </div>

                {validation.errors.length > 0 && (
                  <div className="space-y-2 p-3 bg-danger/5 border border-danger/20 rounded-xl">
                    {validation.errors.map((err, i) => (
                      <p key={i} className="text-[10px] text-danger font-bold flex items-center gap-2">
                        <AlertTriangle className="size-3" /> {err}
                      </p>
                    ))}
                  </div>
                )}

                <Button onPress={generate} variant="primary" className="w-full h-12 font-black shadow-xl shadow-primary/20 text-md" isDisabled={!validation.isValid}>
                  <Sparkles className="size-4 mr-2" /> {t("gitCommit.forgeMessage")}
                </Button>
            </div>
          </Card>

          {/* Quick Diff Analysis */}
          <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
            <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2 tracking-widest">
              <FileDiff className="size-4" /> {t("gitCommit.aiDiffAuditor")}
            </h3>
            <TextArea
              placeholder={t("gitCommit.pasteDiff")}
              className="h-32 w-full resize-none rounded-xl border border-divider bg-background p-3 font-mono text-[10px] mb-3 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              onChange={(e) => setDiffInput(e.target.value)}
              value={diffInput}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (diffInput.trim()) handleDiffAnalysis();
                }
              }}
              aria-label={t("gitCommit.pasteDiff")}
            />
            <Button size="sm" variant="ghost" className="w-full font-black text-secondary" onPress={handleDiffAnalysis} isDisabled={!diffInput.trim()}>
              {t("gitCommit.analyzePrefill")}
            </Button>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs
            selectedKey={activeTab as string}
            onSelectionChange={(k) => setActiveTab(k as string)}
            variant="primary"
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label={t("gitCommit.ariaOutputView")}>
                <Tabs.Tab id="composer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4" /> <span>{t("gitCommit.resultTab")}</span>
                  </div>
                </Tabs.Tab>
                <Tabs.Tab id="changelog">
                  <div className="flex items-center gap-2">
                    <LayoutList className="size-4" /> <span>{t("gitCommit.sessionChangelog")}</span>
                  </div>
                </Tabs.Tab>
                <Tabs.Tab id="history">
                  <div className="flex items-center gap-2">
                    <History className="size-4" /> <span>{t("gitCommit.registryTab")}</span>
                  </div>
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="composer">
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="p-0 border-divider shadow-xl overflow-hidden bg-background">
                  <div className="p-4 border-b border-divider bg-muted/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-foreground rounded-full flex items-center justify-center border border-default-200 shadow-lg">
                        <Github className="size-4 text-background" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">git-preview</span>
                        <span className="text-[9px] opacity-40 font-mono">main · a1b2c3d</span>
                      </div>
                    </div>
                    <CopyButton text={message || ""} />
                  </div>
                  <div className="p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                    {message ? (
                      <div className="space-y-2">
                        <p className="font-black text-primary underline decoration-primary/20 underline-offset-4">{message.split("\n")[0]}</p>
                        <p className="text-muted-foreground">{message.split("\n").slice(1).join("\n")}</p>
                      </div>
                    ) : (
                      <span className="opacity-20 italic">{t("gitCommit.forgingMessage")}</span>
                    )}
                  </div>
                  <div className="p-4 border-t border-divider bg-muted/5 flex gap-2">
                     <CopyButton text={`git commit -m "${(message || "").replace(/"/g, '\\"')}"`} label={t("gitCommit.copyCli")} className="flex-1 h-10 font-bold" />
                  </div>
                </Card>

                {/* Validation Audit */}
                <Card className="p-6">
                  <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                    <ShieldCheck className="size-3 text-emerald-500 dark:text-emerald-400" /> {t("gitCommit.compliance")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>{t("gitCommit.conventionalCommits")}</span>
                      <StatusBadge variant={validation.isValid ? "success" : "error"}>
                        {validation.isValid ? t("gitCommit.passed") : t("gitCommit.failed")}
                      </StatusBadge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>{t("gitCommit.headerLength")}</span>
                      <StatusBadge variant={config.description.length <= 72 ? "success" : "error"}>
                        {t("gitCommit.chars", { count: String(config.description.length) })}
                      </StatusBadge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>{t("gitCommit.bodySeparation")}</span>
                      <StatusBadge variant={config.body ? "success" : "info"}>{config.body ? "YES" : "N/A"}</StatusBadge>
                    </div>
                  </div>
                </Card>
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="changelog">
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="p-0 border-divider shadow-xl overflow-hidden h-[300px] flex flex-col border-none">
                  <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Terminal className="size-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">{t("gitCommit.autoChangelog")}</span>
                    </div>
                    <CopyButton text={changelog} />
                  </div>
                  <pre className="p-8 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background text-foreground/80">
                    <code>{changelog || t("gitCommit.noChangelog")}</code>
                  </pre>
                </Card>

                {/* Batch Generation */}
                <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
                  <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2 tracking-widest">
                    <ListPlus className="size-3" /> {t("gitCommit.batchGenerate")}
                  </h3>
                  <TextArea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={t("gitCommit.batchPlaceholder")}
                    className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-3 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 shadow-inner mb-3"
                    aria-label={t("gitCommit.batchGenerate")}
                  />
                  {batchMessages.length > 0 && (
                    <div className="space-y-2">
                      {batchMessages.map((msg, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-indigo-500/10">
                          <span className="font-mono text-xs text-primary truncate mr-2">{msg}</span>
                          <CopyButton text={msg} size="sm" variant="ghost" />
                        </div>
                      ))}
                      <CopyButton
                        text={batchMessages.join("\n")}
                        label={t("gitCommit.copyAllMessages")}
                        className="w-full mt-2 font-bold"
                      />
                    </div>
                  )}
                </Card>
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="history">
              <Card className="p-0 overflow-hidden shadow-xl border-divider h-[600px] animate-in fade-in slide-in-from-right-4 duration-500 border-none">
                <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest">{t("gitCommit.commitRegistry")}</span>
                  <Button size="sm" variant="ghost" onPress={clearHistory} className="font-black text-[9px] text-danger">{t("gitCommit.wipeCache")}</Button>
                </div>
                <DataTable
                  columns={historyColumns}
                  data={history}
                  filterField="message"
                  renderCell={renderHistoryCell}
                  initialVisibleColumns={["message", "type", "actions"]}
                  emptyContent={t("gitCommit.registryEmpty")}
                />
              </Card>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
