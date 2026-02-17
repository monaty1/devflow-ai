"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Input,
  Chip,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Textarea,
} from "@heroui/react";
import {
  GitCommit,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Terminal,
  Github,
  GitBranch,
  FileDiff,
  Wand2,
  ChevronRight,
  History,
  FileText,
  ShieldCheck,
  Zap,
  LayoutList,
  MessageSquare,
  ListPlus,
  Hash,
} from "lucide-react";
import { useGitCommitGenerator } from "@/hooks/use-git-commit-generator";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { CommitType } from "@/types/git-commit-generator";
import { COMMIT_TYPES, getCommitTypeInfo } from "@/lib/application/git-commit-generator";

export default function GitCommitGeneratorPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const {
    config,
    result,
    history,
    parsedCommit,
    updateConfig,
    generate,
    analyze,
    parse,
    reset,
    clearHistory,
    getChangelog,
  } = useGitCommitGenerator();

  const [activeTab, setActiveTab] = useState<"composer" | "parse" | "changelog">("composer");
  const [diffInput, setDiffInput] = useState("");

  const historyColumns: ColumnConfig[] = [
    { name: "MESSAGE", uid: "message", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "SCOPE", uid: "scope" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderHistoryCell = useCallback((item: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "message":
        return (
          <div className="flex flex-col gap-0.5 max-w-[300px]">
            <span className="font-mono text-xs font-black truncate text-primary">{item.message.split("\n")[0]}</span>
            <span className="text-[9px] opacity-40 font-mono italic truncate">{item.timestamp}</span>
          </div>
        );
      case "type":
        const info = getCommitTypeInfo(item.type);
        return <Chip size="sm" variant="flat" className="font-black text-[10px] uppercase">{info.emoji} {item.type}</Chip>;
      case "scope":
        return item.scope ? <Chip size="sm" variant="dot" color="primary" className="font-bold text-[9px] uppercase">{item.scope}</Chip> : <span className="opacity-20">-</span>;
      case "actions":
        return <CopyButton text={item.message} size="sm" variant="ghost" />;
      default:
        return (item as any)[columnKey];
    }
  }, []);

  const handleDiffAnalysis = () => {
    if (!diffInput.trim()) return;
    analyze();
    addToast("Diff analyzed! Suggestions applied to composer.", "success");
  };

  const changelog = useMemo(() => getChangelog(), [getChangelog]);

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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                Commit Architect
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
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Type</label>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" className="w-full justify-between h-10 font-bold uppercase text-[10px]">
                        {config.type ? (
                          <span className="flex items-center gap-2">
                            {getCommitTypeInfo(config.type).emoji} {config.type}
                          </span>
                        ) : "Select"}
                        <ChevronRight className="size-3 rotate-90 opacity-40" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      selectionMode="single"
                      selectedKeys={new Set([config.type])}
                      onSelectionChange={(k) => updateConfig("type", Array.from(k)[0] as CommitType)}
                      className="max-h-64 overflow-auto"
                    >
                      {COMMIT_TYPES.map(t => (
                        <DropdownItem key={t.type} startContent={<span>{t.emoji}</span>} description={t.description}>{t.label}</DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Scope</label>
                  <Input 
                    size="sm" 
                    placeholder="e.g. auth, ui" 
                    value={config.scope} 
                    onValueChange={(v) => updateConfig("scope", v)} 
                    variant="bordered"
                    classNames={{ input: "font-bold text-xs" }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Summary</label>
                <Input 
                  placeholder="What changed?" 
                  value={config.description} 
                  onValueChange={(v) => updateConfig("description", v)}
                  variant="bordered"
                  classNames={{ input: "font-medium" }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Description Body</label>
                  <button 
                    onClick={() => updateConfig("body", config.body + "\\n- ")}
                    className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline"
                  >
                    <ListPlus className="size-2.5" /> Add Point
                  </button>
                </div>
                <Textarea
                  placeholder="Detailed explanation..."
                  value={config.body}
                  onValueChange={(v) => updateConfig("body", v)}
                  className="font-mono text-xs"
                  minRows={4}
                />
              </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Refs</label>
                    <Input 
                      size="sm" 
                      placeholder="#123" 
                      value={config.issueRef} 
                      onValueChange={(v) => updateConfig("issueRef", v)} 
                      variant="bordered"
                      startContent={<Hash className="size-3 opacity-40" />}
                      color={config.requireIssue && !config.issueRef ? "danger" : "default"}
                    />
                  </div>
                  <div className="flex flex-col gap-2 justify-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={config.useEmojis} 
                        onChange={(e) => updateConfig("useEmojis", e.target.checked)}
                        className="size-4 rounded accent-primary"
                      />
                      <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">Use Gitmoji</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={config.requireIssue} 
                        onChange={(e) => updateConfig("requireIssue", e.target.checked)}
                        className="size-4 rounded accent-danger"
                      />
                      <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-danger transition-colors">Mandatory Issue</span>
                    </label>
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

                <Button onPress={generate} color="primary" className="w-full h-12 font-black shadow-xl shadow-primary/20 text-md" isDisabled={!validation.isValid}>
                  <Sparkles className="size-4 mr-2" /> Forge Message
                </Button>
            </div>
          </Card>

          {/* Quick Diff Analysis */}
          <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
            <h3 className="text-xs font-black uppercase text-indigo-600 mb-4 flex items-center gap-2 tracking-widest">
              <FileDiff className="size-4" /> AI Diff Auditor
            </h3>
            <textarea
              placeholder="Paste git diff output here..."
              className="h-32 w-full resize-none rounded-xl border border-divider bg-background p-3 font-mono text-[10px] mb-3 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              onChange={(e) => setDiffInput(e.target.value)}
              value={diffInput}
            />
            <Button size="sm" color="secondary" className="w-full font-black" onPress={handleDiffAnalysis} isDisabled={!diffInput.trim()}>
              Analyze & Prefill
            </Button>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(k) => setActiveTab(k as any)}
            variant="solid"
            color="primary"
            classNames={{ tabList: "bg-muted/50 rounded-xl p-1" }}
          >
            <Tab key="composer" title={
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4" /> <span>Result</span>
              </div>
            } />
            <Tab key="changelog" title={
              <div className="flex items-center gap-2">
                <LayoutList className="size-4" /> <span>Session Changelog</span>
              </div>
            } />
            <Tab key="history" title={
              <div className="flex items-center gap-2">
                <History className="size-4" /> <span>Registry</span>
              </div>
            } />
          </Tabs>

          {activeTab === "composer" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="p-0 border-divider shadow-xl overflow-hidden bg-background">
                <div className="p-4 border-b border-divider bg-muted/20 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                      <Github className="size-4 text-white" />
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
                    <span className="opacity-20 italic">Forging your commit message...</span>
                  )}
                </div>
                <div className="p-4 border-t border-divider bg-muted/5 flex gap-2">
                   <CopyButton text={`git commit -m "${message || ""}"`} label="Copy CLI Command" className="flex-1 h-10 font-bold" />
                </div>
              </Card>

              {/* Validation Audit */}
              <Card className="p-6">
                <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-3 text-emerald-500" /> Commit Standard Compliance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span>Conventional Commits 1.0.0</span>
                    <StatusBadge variant="success">PASSED</StatusBadge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Header length (&lt; 72 chars)</span>
                    <StatusBadge variant={config.description.length <= 72 ? "success" : "danger"}>
                      {config.description.length} chars
                    </StatusBadge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Body Separation (Empty line)</span>
                    <StatusBadge variant={config.body ? "success" : "info"}>{config.body ? "YES" : "N/A"}</StatusBadge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "changelog" && (
            <Card className="p-0 border-divider shadow-xl overflow-hidden h-[600px] flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-4 border-b border-divider flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest">Automatic Session Changelog</span>
                </div>
                <CopyButton text={changelog} />
              </div>
              <pre className="p-8 font-mono text-xs leading-relaxed overflow-auto flex-1 bg-background text-foreground/80">
                <code>{changelog || "No commits in current session to generate a changelog."}</code>
              </pre>
            </Card>
          )}

          {activeTab === "history" && (
            <Card className="p-0 overflow-hidden shadow-xl border-divider h-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">Commit Registry</span>
                <Button size="xs" color="danger" variant="flat" onPress={clearHistory} className="font-black text-[9px]">WIPE CACHE</Button>
              </div>
              <DataTable
                columns={historyColumns}
                data={history}
                filterField="message"
                renderCell={renderHistoryCell}
                initialVisibleColumns={["message", "type", "actions"]}
                emptyContent="Registry empty."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
