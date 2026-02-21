"use client";

import { useState } from "react";
import { InputGroup } from "@heroui/react";
import { Button } from "@/components/ui";
import { Eye, EyeOff, ExternalLink, Check, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import type { AIProviderType } from "@/types/ai";
import { cn } from "@/lib/utils";

interface ApiKeyGuideProps {
  open: boolean;
  onClose: () => void;
}

interface ProviderOption {
  id: AIProviderType;
  nameKey: string;
  descKey: string;
  badge: "free" | "freeTier" | "paid";
  url: string | null;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: "pollinations",
    nameKey: "guide.ai.provider.pollinations",
    descKey: "guide.ai.provider.pollinationsDesc",
    badge: "free",
    url: null,
  },
  {
    id: "gemini",
    nameKey: "guide.ai.provider.gemini",
    descKey: "guide.ai.provider.geminiDesc",
    badge: "freeTier",
    url: "https://aistudio.google.com/apikey",
  },
  {
    id: "groq",
    nameKey: "guide.ai.provider.groq",
    descKey: "guide.ai.provider.groqDesc",
    badge: "freeTier",
    url: "https://console.groq.com/keys",
  },
  {
    id: "openrouter",
    nameKey: "guide.ai.provider.openrouter",
    descKey: "guide.ai.provider.openrouterDesc",
    badge: "paid",
    url: "https://openrouter.ai/keys",
  },
];

export function ApiKeyGuide({ open, onClose }: ApiKeyGuideProps) {
  const { t } = useTranslation();
  const { setByokKey, setByokProvider } = useAISettingsStore();

  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<AIProviderType>("pollinations");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);
  const needsKey = provider !== "pollinations";
  const totalSteps = needsKey ? 3 : 2;

  function handleActivate() {
    if (needsKey && apiKey.trim()) {
      setByokKey(apiKey.trim());
      setByokProvider(provider);
    }
    handleClose();
  }

  function handleClose() {
    setStep(0);
    setProvider("pollinations");
    setApiKey("");
    setShowKey(false);
    onClose();
  }

  function handleNext() {
    if (step === 0 && !needsKey) {
      // Skip step 2 (get key) for Pollinations
      setStep(2);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step === 2 && !needsKey) {
      setStep(0);
    } else {
      setStep((s) => s - 1);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-6 pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("guide.ai.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("guide.ai.subtitle")}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 px-6 pt-4">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepIndex = !needsKey && i === 1 ? 2 : i;
            return (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  stepIndex <= step ? "bg-primary" : "bg-muted"
                )}
              />
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Choose provider */}
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">
                {t("guide.ai.step1.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("guide.ai.step1.subtitle")}
              </p>
              <div className="grid gap-2">
                {PROVIDERS.map((p) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    onPress={() => setProvider(p.id)}
                    className={cn(
                      "flex h-auto items-center justify-between rounded-lg border p-3 text-left",
                      provider === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {t(p.nameKey)}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {t(p.descKey)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        p.badge === "free"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : p.badge === "freeTier"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {t(`guide.ai.${p.badge}`)}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Get key (only if provider needs key) */}
          {step === 1 && needsKey && selectedProvider && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                {t("guide.ai.step2.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("guide.ai.step2.subtitle")}
              </p>
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </span>
                  {t("guide.ai.step2.instruction1")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </span>
                  {t("guide.ai.step2.instruction2")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </span>
                  {t("guide.ai.step2.instruction3")}
                </li>
              </ol>
              {selectedProvider.url && (
                <a
                  href={selectedProvider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("guide.ai.step2.getKey")}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Step 3: Paste and activate (or Pollinations confirmation) */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                {t("guide.ai.step3.title")}
              </h3>
              {needsKey ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("guide.ai.step3.subtitle")}
                  </p>
                  <InputGroup className="w-full">
                    <InputGroup.Input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                      placeholder={t("guide.ai.step3.placeholder")}
                    />
                    <InputGroup.Suffix>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={() => setShowKey((s) => !s)}
                        aria-label={
                          showKey
                            ? t("guide.ai.step3.hideKey")
                            : t("guide.ai.step3.showKey")
                        }
                      >
                        {showKey ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                </>
              ) : (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-center">
                  <Check className="mx-auto mb-2 size-8 text-green-500" />
                  <p className="font-medium text-foreground">
                    {t("guide.ai.step3.ready")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("guide.ai.step3.readyDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-6 pt-4">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onPress={handleBack}>
              {t("guide.ai.back")}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onPress={handleClose}>
              {t("guide.ai.close")}
            </Button>
          )}

          {step < 2 ? (
            <Button size="sm" onPress={handleNext}>
              {t("guide.ai.next")}
            </Button>
          ) : (
            <Button
              size="sm"
              onPress={handleActivate}
              isDisabled={needsKey && !apiKey.trim()}
            >
              {needsKey
                ? t("guide.ai.step3.activate")
                : t("guide.ai.close")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
