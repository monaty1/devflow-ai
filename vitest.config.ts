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
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/application/**/*.ts",
        "lib/domain/**/*.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/index.ts",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
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
