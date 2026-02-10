"use client";

import { useState } from "react";
import { Card } from "@heroui/react";
import { useFadeIn, useStaggerIn } from "@/hooks/use-gsap";
import {
  FileSearch,
  Code2,
  Calculator,
  Eye,
  FolderKanban,
  ChevronDown,
} from "lucide-react";

interface DocSection {
  id: string;
  icon: typeof FileSearch;
  title: string;
  description: string;
  features: string[];
  usage: string;
}

const TOOL_DOCS: DocSection[] = [
  {
    id: "prompt-analyzer",
    icon: FileSearch,
    title: "Prompt Analyzer",
    description:
      "Analyze and optimize your AI prompts for better results and security.",
    features: [
      "Quality scoring (1-10) based on clarity, specificity, and structure",
      "Security threat detection (injection attacks, jailbreak attempts)",
      "Token count estimation for cost planning",
      "Actionable improvement suggestions",
      "History tracking for all analyzed prompts",
    ],
    usage:
      "Paste your prompt into the text area and click 'Analyze'. The tool will evaluate quality, detect security issues, and provide suggestions for improvement.",
  },
  {
    id: "code-review",
    icon: Code2,
    title: "Code Review Assistant",
    description:
      "Automated code analysis for security vulnerabilities and best practices.",
    features: [
      "15+ security checks (SQL injection, XSS, hardcoded secrets)",
      "Code smell detection (long functions, deep nesting)",
      "Language-specific analysis (JavaScript, TypeScript, Python)",
      "Line-by-line issue highlighting",
      "Severity ratings (critical, warning, info)",
    ],
    usage:
      "Paste your code, select the language, and click 'Review Code'. Issues will be highlighted with severity levels and specific line numbers.",
  },
  {
    id: "cost-calculator",
    icon: Calculator,
    title: "API Cost Calculator",
    description: "Compare costs across AI providers and optimize your spending.",
    features: [
      "10+ AI models (GPT-4, Claude, Gemini, Llama)",
      "Real-time cost estimation as you type",
      "Side-by-side model comparison",
      "Monthly cost projections",
      "Cost-per-quality analysis",
    ],
    usage:
      "Enter your expected input/output tokens or paste sample text. Select models to compare and see instant cost breakdowns.",
  },
  {
    id: "token-visualizer",
    icon: Eye,
    title: "Token Visualizer",
    description:
      "See exactly how your text gets tokenized by different AI models.",
    features: [
      "Color-coded token breakdown",
      "Multiple tokenizer support (GPT, Claude)",
      "Character vs token count comparison",
      "Export tokenization data",
      "Real-time visualization",
    ],
    usage:
      "Type or paste text to see it broken into tokens. Each token is color-coded for easy identification. Hover for details.",
  },
  {
    id: "context-manager",
    icon: FolderKanban,
    title: "Context Manager",
    description: "Organize and optimize context windows for AI conversations.",
    features: [
      "Document organization with drag-and-drop",
      "Priority levels (critical, high, medium, low)",
      "Token budget tracking",
      "Export to XML, JSON, or Markdown",
      "Multiple context window support",
    ],
    usage:
      "Create context windows, add documents with priorities, and export optimized context for your AI applications.",
  },
];

export default function DocsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const headerRef = useFadeIn();
  const cardsRef = useStaggerIn("> *", 0.1);

  const toggleSection = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        ref={headerRef}
        className="container mx-auto max-w-4xl px-4 py-20"
      >
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to use each DevFlow AI tool effectively. Click on a tool to
          expand its documentation.
        </p>
      </section>

      {/* Tool Documentation */}
      <section ref={cardsRef} className="container mx-auto max-w-4xl px-4 pb-20">
        <div className="space-y-4">
          {TOOL_DOCS.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              {/* Header - Clickable */}
              <button
                type="button"
                onClick={() => toggleSection(doc.id)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <doc.icon className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {doc.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    expandedId === doc.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expandable Content */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  expandedId === doc.id
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border px-6 pb-6 pt-4">
                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="mb-3 font-semibold text-foreground">
                        Features
                      </h3>
                      <ul className="space-y-2">
                        {doc.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Usage */}
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">
                        How to Use
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {doc.usage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Quick Start</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Sign In",
                description: "Create a free account or continue as guest",
              },
              {
                step: "2",
                title: "Choose a Tool",
                description: "Select from 5 powerful AI development tools",
              },
              {
                step: "3",
                title: "Get Results",
                description: "Analyze, optimize, and export your work",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Need Help?</h2>
        <p className="mb-6 text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="mailto:support@devflow.ai"
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Contact Support
          </a>
          <a
            href="https://github.com/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-6 py-2 font-medium transition-colors hover:bg-muted"
          >
            GitHub Issues
          </a>
        </div>
      </section>
    </div>
  );
}
