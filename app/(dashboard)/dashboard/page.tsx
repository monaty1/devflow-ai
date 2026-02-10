"use client";

import NextLink from "next/link";
import { Card, Button } from "@heroui/react";
import {
  FileSearch,
  Code2,
  Calculator,
  Eye,
  FolderKanban,
  Regex,
  FileJson,
  Clock,
  Palette,
  Wand2,
  Braces,
  Binary,
  Fingerprint,
  GitCommitHorizontal,
  Globe,
  ArrowRight,
} from "lucide-react";
import { TOOLS_DATA } from "@/config/tools-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSearch,
  Code2,
  Calculator,
  Eye,
  FolderKanban,
  Regex,
  FileJson,
  Clock,
  Palette,
  Wand2,
  Braces,
  Binary,
  Fingerprint,
  GitCommitHorizontal,
  Globe,
};

const COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
  "from-blue-500 to-indigo-600": { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "from-emerald-500 to-teal-600": { color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  "from-amber-500 to-orange-600": { color: "text-amber-500", bgColor: "bg-amber-500/10" },
  "from-purple-500 to-violet-600": { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  "from-rose-500 to-pink-600": { color: "text-rose-500", bgColor: "bg-rose-500/10" },
  "from-cyan-500 to-blue-600": { color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  "from-green-500 to-emerald-600": { color: "text-green-500", bgColor: "bg-green-500/10" },
  "from-violet-500 to-purple-600": { color: "text-violet-500", bgColor: "bg-violet-500/10" },
  "from-sky-500 to-cyan-600": { color: "text-sky-500", bgColor: "bg-sky-500/10" },
  "from-fuchsia-500 to-pink-600": { color: "text-fuchsia-500", bgColor: "bg-fuchsia-500/10" },
  "from-yellow-500 to-amber-600": { color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  "from-indigo-500 to-blue-600": { color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  "from-teal-500 to-emerald-600": { color: "text-teal-500", bgColor: "bg-teal-500/10" },
  "from-orange-500 to-red-600": { color: "text-orange-500", bgColor: "bg-orange-500/10" },
};

const DEFAULT_COLORS = { color: "text-blue-500", bgColor: "bg-blue-500/10" };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome to DevFlow AI
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select a tool to get started with your AI development workflow.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Available Tools
          </div>
          <div className="mt-2 text-3xl font-bold">{TOOLS_DATA.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            All Free & Open Source
          </div>
          <div className="mt-2 text-3xl font-bold">100%</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            No API Keys Required
          </div>
          <div className="mt-2 text-3xl font-bold">0</div>
        </Card>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Your Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS_DATA.map((tool) => {
            const Icon = ICON_MAP[tool.icon];
            const colors = COLOR_MAP[tool.color] ?? DEFAULT_COLORS;
            return (
              <Card
                key={tool.id}
                className="group p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${colors.bgColor} ${colors.color}`}
                  >
                    {Icon ? <Icon className="size-6" /> : <span className="text-lg">🔧</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <NextLink href={`/tools/${tool.slug}`} className="flex items-center gap-2">
                      Open Tool
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </NextLink>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
