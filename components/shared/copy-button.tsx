"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@heroui/react";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** Static text to copy */
  text?: string;
  /** Dynamic text getter (called at copy time) */
  getText?: () => string;
  /** Optional label shown next to the icon */
  label?: string;
  /** HeroUI Button variant */
  variant?: "ghost" | "outline" | "primary" | "secondary" | "tertiary";
  /** HeroUI Button size */
  size?: "sm" | "md" | "lg";
  /** Disable the button */
  isDisabled?: boolean;
  /** Extra class names */
  className?: string;
  /** Accessible label (defaults to translated "Copy to clipboard") */
  ariaLabel?: string;
}

export function CopyButton({
  text,
  getText,
  label,
  variant = "ghost",
  size = "sm",
  isDisabled = false,
  className,
  ariaLabel,
}: CopyButtonProps) {
  const { t } = useTranslation();
  const resolvedAriaLabel = ariaLabel ?? t("common.copyToClipboard");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleCopy = useCallback(async () => {
    const value = getText ? getText() : text;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [text, getText]);

  return (
    <Button
      variant={variant}
      size={size}
      isDisabled={isDisabled}
      onPress={handleCopy}
      className={cn(label ? undefined : "min-w-0 px-2", className)}
      {...(label ? {} : { "aria-label": resolvedAriaLabel })}
    >
      {copied ? (
        <Check className={cn("size-4 text-success", label && "mr-1")} />
      ) : (
        <Copy className={cn("size-4", label && "mr-1")} />
      )}
      {label}
    </Button>
  );
}
