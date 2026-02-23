import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const NON_TEST_FILES = ["**/*.{js,jsx,ts,tsx,mjs,cjs}"];
const TEST_FILES = ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{ts,tsx}", "**/__tests__/**"];

const eslintConfig = [
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
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
