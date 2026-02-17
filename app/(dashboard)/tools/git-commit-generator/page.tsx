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
} from "lucide-react";
import { useGitCommitGenerator } from "@/hooks/use-git-commit-generator";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { ToolHeader } from "@/components/shared/tool-header";
import { CopyButton } from "@/components/shared/copy-button";
import { DataTable, type ColumnConfig } from "@/components/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { CommitType, CommitResult } from "@/types/git-commit-generator";
import { COMMIT_TYPES, getCommitTypeInfo } from "@/lib/application/git-commit-generator";

export default function GitCommitGeneratorPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const {
    config,
    message,
    validation,
    history,
    parsedCommit,
    isAnalyzing,
    setField,
    setConfig,
    generate,
    analyzeDiff,
    parse,
    reset,
    clearHistory,
  } = useGitCommitGenerator();

  const [activeTab, setActiveTab] = useState<"generate" | "parse" | "history">("generate");
  const [diffInput, setDiffInput] = useState("");

  const historyColumns: ColumnConfig[] = [
    { name: "MESSAGE", uid: "message", sortable: true },
    { name: "TYPE", uid: "type", sortable: true },
    { name: "SCOPE", uid: "scope" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderHistoryCell = useCallback((item: CommitResult, columnKey: React.Key) => {
    switch (columnKey) {
      case "message":
        return (
          <span className="font-mono text-xs truncate max-w-[300px] block" title={item.message}>
            {item.message.split("\n")[0]}
          </span>
        );
      case "type":
        const info = getCommitTypeInfo(item.type);
        return (
          <Chip size="sm" variant="flat" className="capitalize">
            {info.emoji} {item.type}
          </Chip>
        );
      case "scope":
        return item.scope ? (
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{item.scope}</span>
        ) : (
          <span className="text-muted-foreground opacity-50">-</span>
        );
      case "actions":
        return <CopyButton text={item.message} size="sm" variant="ghost" />;
      default:
        return (item as any)[columnKey];
    }
  }, []);

  const handleDiffAnalysis = () => {
    if (!diffInput.trim()) {
      addToast("Please paste a git diff first", "warning");
      return;
    }
    analyzeDiff(diffInput);
    setActiveTab("generate");
    setDiffInput("");
    addToast("Diff analyzed! Type and scope suggestions applied.", "success");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToolHeader
        icon={GitCommit}
        gradient="from-slate-700 to-zinc-800"
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
        {/* Main Interface */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(k) => setActiveTab(k as any)}
              variant="underlined"
              classNames={{ tabList: "gap-6 mb-6", cursor: "bg-primary" }}
            >
              <Tab key="generate" title="Composer" />
              <Tab key="parse" title="Parse / Analyze" />
              <Tab key="history" title="History" />
            </Tabs>

            {activeTab === "generate" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Type</label>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="bordered" className="w-full justify-between capitalize text-left">
                          {config.type ? (
                            <span className="flex items-center gap-2">
                              {getCommitTypeInfo(config.type).emoji} {config.type}
                            </span>
                          ) : "Select Type"}
                          <ChevronRight className="size-4 rotate-90" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu 
                        selectionMode="single"
                        selectedKeys={new Set([config.type])}
                        onSelectionChange={(k) => setField("type", Array.from(k)[0] as CommitType)}
                        className="max-h-[300px] overflow-y-auto"
                      >
                        {COMMIT_TYPES.map((t) => (
                          <DropdownItem key={t.type} startContent={<span className="text-lg">{t.emoji}</span>} description={t.description}>
                            {t.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Scope</label>
                    <Input 
                      placeholder="e.g. auth, api, ui" 
                      value={config.scope}
                      onValueChange={(v) => setField("scope", v)}
                      variant="bordered"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Short Description</label>
                  <Input 
                    placeholder="imperative, lowercase, no period (e.g. add google login)" 
                    value={config.description}
                    onValueChange={(v) => setField("description", v)}
                    variant="bordered"
                    className={cn(
                      config.description.length > 50 ? "text-warning" : "",
                      config.description.length > 72 ? "text-danger" : ""
                    )}
                    endContent={
                      <span className={cn("text-xs", config.description.length > 72 ? "text-danger font-bold" : "text-muted-foreground")}>
                        {config.description.length}/72
                      </span>
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Long Body (Optional)</label>
                  <textarea
                    placeholder="Motivation for the change and contrasts with previous behavior"
                    value={config.body}
                    onChange={(e) => setField("body", e.target.value)}
                    className="h-32 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Breaking Change</label>
                    <Input 
                      placeholder="Description of breaking change" 
                      value={config.breakingChange}
                      onValueChange={(v) => setField("breakingChange", v)}
                      variant="bordered"
                      color={config.breakingChange ? "danger" : "default"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Issue References</label>
                    <Input 
                      placeholder="#123, JIRA-456" 
                      value={config.issueRef}
                      onValueChange={(v) => setField("issueRef", v)}
                      variant="bordered"
                      startContent={<Github className="size-4 text-muted-foreground" />}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-divider">
                    <input 
                      type="checkbox" 
                      checked={config.useEmojis} 
                      onChange={(e) => setField("useEmojis", e.target.checked)}
                      className="size-4 rounded accent-primary"
                    />
                    <span className="text-sm font-medium">Use Gitmoji</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "parse" && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-divider">
                  <h3 className="font-bold flex items-center gap-2 mb-2">
                    <FileDiff className="size-4 text-primary" />
                    Smart Diff Analysis
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Paste output from <code>git diff --cached</code> to auto-detect type and scope.
                  </p>
                  <textarea
                    value={diffInput}
                    onChange={(e) => setDiffInput(e.target.value)}
                    placeholder="diff --git a/src/main.ts b/src/main.ts..."
                    className="h-32 w-full resize-none rounded-lg border border-divider bg-background p-3 font-mono text-xs mb-3 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button 
                    size="sm" 
                    color="secondary" 
                    onPress={handleDiffAnalysis} 
                    className="font-bold w-full"
                    isLoading={isAnalyzing}
                  >
                    <Wand2 className="size-3 mr-2" /> Analyze & Fill Form
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Parse Existing Message</label>
                  <textarea
                    placeholder="Paste a commit message to validate..."
                    className="h-24 w-full resize-none rounded-xl border border-divider bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onChange={(e) => parse(e.target.value)}
                  />
                </div>

                {parsedCommit && (
                  <Card className="p-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-bold opacity-60">Type:</span> {parsedCommit.type}</div>
                      <div><span className="font-bold opacity-60">Scope:</span> {parsedCommit.scope || "-"}</div>
                      <div className="col-span-2"><span className="font-bold opacity-60">Desc:</span> {parsedCommit.description}</div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="p-0">
                <div className="flex justify-end mb-4">
                  <Button size="sm" color="danger" variant="flat" onPress={clearHistory}>Clear History</Button>
                </div>
                <DataTable
                  columns={historyColumns}
                  data={history}
                  filterField="message"
                  renderCell={renderHistoryCell}
                  initialVisibleColumns={["message", "type", "actions"]}
                  emptyContent="No generated commits yet."
                />
              </div>
            )}
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-content1 border-divider shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Github className="size-5" />
                GitHub Preview
              </h3>
              <StatusBadge variant={validation.isValid ? "success" : "danger"}>
                {validation.isValid ? "Valid" : "Issues Found"}
              </StatusBadge>
            </div>

            <div className="border border-divider rounded-md overflow-hidden bg-background">
              <div className="bg-muted/50 p-2 border-b border-divider flex items-center gap-2 text-xs text-muted-foreground">
                <GitBranch className="size-3" />
                <span className="font-mono">main</span>
                <span className="mx-1">·</span>
                <span className="font-mono text-[10px]">a1b2c3d</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="font-bold text-foreground">
                  {message.split("\n")[0] || <span className="opacity-30 italic">Commit header...</span>}
                </div>
                {message.split("\n").slice(1).map((line, i) => (
                  <div key={i} className="text-muted-foreground mt-1 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {!validation.isValid && validation.errors.length > 0 && (
              <div className="mt-4 space-y-2">
                {validation.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-danger bg-danger/10 p-2 rounded-lg">
                    <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-divider flex flex-col gap-3">
              <div className="flex gap-2">
                <Button 
                  color="primary" 
                  className="flex-1 font-bold h-12 shadow-lg shadow-primary/20"
                  onPress={generate}
                  isDisabled={!validation.isValid}
                >
                  <Copy className="size-4 mr-2" /> Copy Message
                </Button>
                <CopyButton text={`git commit -m "${message}"`} label="Cmd" className="h-12 px-6" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground">
                Based on <a href="https://www.conventionalcommits.org/" target="_blank" rel="noreferrer" className="underline hover:text-primary">Conventional Commits 1.0.0</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
