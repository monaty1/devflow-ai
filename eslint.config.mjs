import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  security.configs.recommended,
  {
    rules: {
      // TypeScript strict mode (noPropertyAccessFromIndexSignature) requires bracket
      // notation for index signatures. This rule flags ALL bracket access as injection
      // risk, but our keys are typed enums, config objects, and validated strings — not
      // user-controlled input. Disabling globally to match TS architecture.
      "security/detect-object-injection": "off",

      // Allow underscore-prefixed params to signal "intentionally unused" without
      // triggering warnings. Common TS convention for interface-required params.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
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
