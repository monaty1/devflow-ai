import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      // ── Strategic Coverage: 100/80/0 ──────────────────────
      //
      // CORE:       lib/application/*.ts — Pure business logic (enforced per-file)
      // IMPORTANT:  components/shared/ with existing tests — UI components
      // INFRA:      types/, config/, stores, barrels — TypeScript enforced, excluded
      //
      include: [
        // CORE — per-file thresholds enforced
        "lib/application/**/*.ts",
        // IMPORTANT — components with existing test coverage
        "components/shared/status-badge.tsx",
        "components/shared/tool-header.tsx",
        "components/shared/toast-container.tsx",
      ],
      exclude: [
        "**/*.d.ts",
        "**/index.ts",
        "**/*.test.{ts,tsx}",
        // Worker source strings — not executable code, just string constants
        "**/worker-source.ts",
        // INFRASTRUCTURE — TypeScript enforces correctness
        "types/**",
        "config/**",
        "lib/utils.ts",
        "lib/stores/**",
        "hooks/use-gsap.ts",
        "hooks/use-translation.ts",
        "hooks/use-tool-history.ts",
      ],
      thresholds: {
        perFile: true,
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/domain": path.resolve(__dirname, "./domain"),
      "@/application": path.resolve(__dirname, "./application"),
      "@/infrastructure": path.resolve(__dirname, "./infrastructure"),
      "@/types": path.resolve(__dirname, "./types"),
    },
  },
});
