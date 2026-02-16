import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const NON_TEST_FILES = ["**/*.{js,jsx,ts,tsx,mjs,cjs}"];
const TEST_FILES = ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**"];

const eslintConfig = [
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "prettier",
    ],
  }),
  {
    files: NON_TEST_FILES,
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "bun:test",
              message: "Use bun:test only in test files.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "Bun",
          message: "Use the Bun global only in test files.",
        },
      ],
    },
  },
];

export default eslintConfig;
