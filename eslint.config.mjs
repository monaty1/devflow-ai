import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // External files
    "system_prompts_leaks-main/**",
    // HeroUI v3 docs (third-party demos, not our code)
    ".heroui-docs/**",
    // Generated coverage reports
    "coverage/**",
  ]),
]);

export default eslintConfig;
