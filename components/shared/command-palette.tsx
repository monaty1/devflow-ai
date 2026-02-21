"use client";

import { useRef, useEffect, useState } from "react";
import { Modal } from "@heroui/react";
import { Search, Command as CommandIcon, ArrowRight } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TOOL_ICON_MAP } from "@/config/tool-icon-map";

export function CommandPalette() {
  const { isOpen, query, filteredCommands, close, setQuery, executeCommand } = useCommandPalette();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) executeCommand(cmd);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand]);

  const getIcon = (iconName: string) => {
    const IconComponent = TOOL_ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="size-4 shrink-0" /> : null;
  };

  const tools = filteredCommands.filter((c) => c.type === "tool");
  const actions = filteredCommands.filter((c) => c.type === "action");

  let currentIdx = -1;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && close()}>
      <Modal.Container size="lg">
        <Modal.Dialog className="p-0">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("cmdPalette.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label={t("cmdPalette.placeholder")}
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label={t("cmdPalette.results")}>
            {filteredCommands.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("cmdPalette.noResults")}
              </div>
            )}

            {tools.length > 0 && (
              <>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cmdPalette.tools")}
                </div>
                {tools.map((cmd) => {
                  currentIdx++;
                  const idx = currentIdx;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      role="option"
                      aria-selected={idx === selectedIndex}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        idx === selectedIndex
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      {getIcon(cmd.icon)}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{t(cmd.labelKey)}</span>
                      </div>
                      <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </>
            )}

            {actions.length > 0 && (
              <>
                <div className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cmdPalette.actions")}
                </div>
                {actions.map((cmd) => {
                  currentIdx++;
                  const idx = currentIdx;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      role="option"
                      aria-selected={idx === selectedIndex}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        idx === selectedIndex
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      {getIcon(cmd.icon)}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{t(cmd.labelKey)}</span>
                        <p className="text-xs text-muted-foreground truncate">{t(cmd.descriptionKey)}</p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
              <span>{t("cmdPalette.navigate")}</span>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
              <span>{t("cmdPalette.select")}</span>
            </div>
            <div className="flex items-center gap-1">
              <CommandIcon className="size-3" />
              <span>K</span>
            </div>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
