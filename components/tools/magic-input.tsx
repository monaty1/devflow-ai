"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

type DetectedType =
  | "json"
  | "cron"
  | "jwt"
  | "base64"
  | "sql"
  | "regex"
  | "code"
  | "uuid"
  | null;

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

  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(trimmed)) {
    return "sql";
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
  const router = useRouter();
  const { t } = useTranslation();

  const detectedType = useMemo(() => detectInputType(input.trim()), [input]);

  const handleAction = (tool: string) => {
    localStorage.setItem("magic-input", input);
    router.push(`/tools/${tool}`);
  };

  const getActions = () => {
    switch (detectedType) {
      case "json":
        return [
          { label: t("magic.formatJson"), tool: "json-formatter", icon: FileJson },
          { label: t("magic.convertTs"), tool: "dto-matic", icon: Code2 },
        ];
      case "cron":
        return [
          { label: t("magic.explainCron"), tool: "cron-builder", icon: Clock },
        ];
      case "jwt":
        return [
          { label: t("magic.decodeToken"), tool: "base64", icon: Binary },
        ];
      case "base64":
        return [
          { label: t("magic.decodeBase64"), tool: "base64", icon: Binary },
        ];
      case "uuid":
        return [
          { label: t("magic.analyzeUuid"), tool: "uuid-generator", icon: Search },
        ];
      case "regex":
        return [
          { label: t("magic.explainRegex"), tool: "regex-humanizer", icon: Regex },
        ];
      case "code":
        return [
          { label: t("magic.reviewCode"), tool: "code-review", icon: Sparkles },
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
          <div className="absolute right-3 top-3 flex gap-2">
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
