"use client";

import { useState, useCallback } from "react";
import { Linkedin, Link2, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("share.shareOnX")}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("share.shareOnLinkedIn")}
      >
        <Linkedin className="size-4" />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
