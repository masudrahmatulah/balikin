import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...tseslint.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/", "node_modules/", "drizzle/"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
    },
  },
];

export default eslintConfig;
