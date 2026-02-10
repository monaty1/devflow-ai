"use client";

import { Card } from "@heroui/react";
import { useFadeIn, useStaggerIn } from "@/hooks/use-gsap";
import { Github, Linkedin, Mail, Code2, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  const headerRef = useFadeIn();
  const cardsRef = useStaggerIn("> *", 0.15);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        ref={headerRef}
        className="container mx-auto max-w-3xl px-4 py-20 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold">About DevFlow AI</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Built by a developer who got tired of juggling 10 different tools
          every time he worked with AI APIs. DevFlow AI centralizes everything
          into one clean, fast, developer-first platform.
        </p>
      </section>

      {/* Mission Cards */}
      <section ref={cardsRef} className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Code2 className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Built for Developers</h3>
            <p className="text-sm text-muted-foreground">
              Clean APIs, TypeScript-first, fast feedback loops. No enterprise
              bloat, no unnecessary complexity.
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <Heart className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Open & Transparent</h3>
            <p className="text-sm text-muted-foreground">
              Open source core. No hidden costs, no vendor lock-in. Use your own
              AI keys or run everything locally.
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <Zap className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Speed First</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 16 + Turbopack. Sub-second interactions.
              Performance is never an afterthought.
            </p>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                name: "Next.js 16",
                category: "Framework",
                color: "bg-gray-100 dark:bg-gray-800",
              },
              {
                name: "React 19",
                category: "UI Library",
                color: "bg-blue-50 dark:bg-blue-900/30",
              },
              {
                name: "TypeScript 5.7",
                category: "Language",
                color: "bg-purple-50 dark:bg-purple-900/30",
              },
              {
                name: "Tailwind v4",
                category: "Styling",
                color: "bg-cyan-50 dark:bg-cyan-900/30",
              },
              {
                name: "HeroUI v3",
                category: "Components",
                color: "bg-pink-50 dark:bg-pink-900/30",
              },
              {
                name: "Vitest",
                category: "Testing",
                color: "bg-emerald-50 dark:bg-emerald-900/30",
              },
              {
                name: "GSAP",
                category: "Animations",
                color: "bg-amber-50 dark:bg-amber-900/30",
              },
              {
                name: "Zustand",
                category: "State",
                color: "bg-indigo-50 dark:bg-indigo-900/30",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`rounded-xl p-4 text-center ${tech.color}`}
              >
                <p className="font-semibold text-foreground">{tech.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tech.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Let&apos;s Connect</h2>
        <p className="mb-8 text-muted-foreground">
          Have questions, feedback or just want to say hi?
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-muted p-3 transition-colors hover:bg-muted/80"
          >
            <Github className="size-5 text-foreground" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
          >
            <Linkedin className="size-5 text-blue-600 dark:text-blue-400" />
          </a>
          <a
            href="mailto:contact@devflow.ai"
            className="rounded-full bg-purple-50 p-3 transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
          >
            <Mail className="size-5 text-purple-600 dark:text-purple-400" />
          </a>
        </div>
      </section>
    </div>
  );
}
