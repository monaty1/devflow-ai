"use client";

import { useState, useMemo } from "react";
import { Card, Button, TextArea } from "@heroui/react";
import {
  Sparkles,
  FileJson,
  Clock,
  Binary,
  Code2,
  Regex,
  Search,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import type { ToolRoute } from "@/hooks/use-smart-navigation";

type DetectedType =
  | "json"
  | "cron"
  | "jwt"
  | "base64"
  | "regex"
  | "code"
  | "uuid"
  | null;

const DETECTION_LABELS: Record<Exclude<DetectedType, null>, string> = {
  json: "JSON",
  cron: "Cron",
  jwt: "JWT",
  base64: "Base64",
  regex: "Regex",
  code: "Code",
  uuid: "UUID",
};

function detectInputType(trimmed: string): DetectedType {
  if (!trimmed) return null;

  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }

  if (/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/.test(trimmed)) {
    return "cron";
  }

  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed)) {
    return "jwt";
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return "uuid";
  }

  if (trimmed.length > 20 && /^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0) {
    return "base64";
  }

  if (trimmed.startsWith("/") && trimmed.endsWith("/")) {
    return "regex";
  }

  if (trimmed.includes("function") || trimmed.includes("const") || trimmed.includes("import ") || trimmed.includes("class ")) {
    return "code";
  }

  return null;
}

export function MagicInput() {
  const [input, setInput] = useState("");
  const { navigateTo } = useSmartNavigation();
  const { t } = useTranslation();

  const detectedType = useMemo(() => detectInputType(input.trim()), [input]);

  const handleAction = (tool: ToolRoute) => {
    navigateTo(tool, input);
  };

  const getActions = () => {
    switch (detectedType) {
      case "json":
        return [
          { label: t("magic.formatJson"), tool: "json-formatter" as ToolRoute, icon: FileJson },
          { label: t("magic.convertTs"), tool: "dto-matic" as ToolRoute, icon: Code2 },
        ];
      case "cron":
        return [
          { label: t("magic.explainCron"), tool: "cron-builder" as ToolRoute, icon: Clock },
        ];
      case "jwt":
        return [
          { label: t("magic.decodeToken"), tool: "base64" as ToolRoute, icon: Binary },
        ];
      case "base64":
        return [
          { label: t("magic.decodeBase64"), tool: "base64" as ToolRoute, icon: Binary },
        ];
      case "uuid":
        return [
          { label: t("magic.analyzeUuid"), tool: "uuid-generator" as ToolRoute, icon: Search },
        ];
      case "regex":
        return [
          { label: t("magic.explainRegex"), tool: "regex-humanizer" as ToolRoute, icon: Regex },
        ];
      case "code":
        return [
          { label: t("magic.reviewCode"), tool: "code-review" as ToolRoute, icon: Sparkles },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <Card className="p-1 shadow-md border-primary/20 ring-4 ring-primary/5 transition-all focus-within:ring-primary/20">
      <div className="relative">
        <div className="absolute left-4 top-4 text-muted-foreground">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("magic.placeholder")}
          className="w-full resize-none bg-transparent px-12 py-4 text-base placeholder:text-muted-foreground/50 focus:outline-none min-h-[60px]"
          rows={Math.min(5, Math.max(2, input.split("\n").length))}
          aria-label={t("magic.ariaLabel")}
        />
        {detectedType && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t("magic.detected")}: {DETECTION_LABELS[detectedType]}
            </span>
            {actions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant="primary"
                className="shadow-sm"
                onPress={() => handleAction(action.tool)}
              >
                <action.icon className="mr-1.5 size-3.5" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
