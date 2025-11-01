import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

const tsRecommended = tseslint.configs["flat/recommended"];
const tsFilePatterns = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*.cts",
  "src/**/*.mts",
];
const [tsBaseConfig, ...tsAdditionalConfigs] = tsRecommended;
const baseLanguageOptions = tsBaseConfig.languageOptions ?? {};
const typedTsConfigs = tsAdditionalConfigs.map((config) => ({
  ...config,
  files: tsFilePatterns,
}));

export default [
  {
    ignores: ["dist", "node_modules", "runtime", "services", "config"],
  },
  {
    ...tsBaseConfig,
    files: tsFilePatterns,
    languageOptions: {
      ...baseLanguageOptions,
      parser: tsParser,
      parserOptions: {
        ...(baseLanguageOptions.parserOptions ?? {}),
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...typedTsConfigs,
  {
    files: tsFilePatterns,
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
