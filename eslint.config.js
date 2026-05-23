import antfu from "@antfu/eslint-config"
import pluginRouter from "@tanstack/eslint-plugin-router"
import jsxA11y from "eslint-plugin-jsx-a11y"

export default antfu({
  react: true,
  formatters: true,
  stylistic: {
    quotes: "double",
    semi: false,
  },
  ignores: [
    "**/*.gen.ts",
    "src/contents/**/*.md",
    "storybook-static",
  ],
  rules: {
    "array-callback-return": "off",
    // Effect uses many of them
    "no-lone-blocks": "off",
    "no-empty": "off",
    // Don't insert `new` into `extends Data.TaggedError` declarations.
    "unicorn/throw-new-error": "off",
    // TanStack Router route modules export a `Route` object by design.
    "react-refresh/only-export-components": ["error", { allowExportNames: ["Route"] }],
    // Avoid this until it is supported well
    "e18e/prefer-array-to-sorted": "off",
    // Harmful for EFfect-TS codebase
    "antfu/top-level-function": "off",
  },
}, {
  files: [
    "**/*.jsx",
    "**/*.tsx",
  ],
  rules: {
    // Enforce the rewrite to `function` keyword only in JSX components
    "antfu/top-level-function": "error",
  },
}, jsxA11y.flatConfigs.recommended, {
  files: [
    "tests/e2e/**/*.ts",
  ],
  rules: {
    "test/consistent-test-it": "off",
  },
}, {
  files: [
    "tests/**/*.ts",
  ],
  rules: {
    "no-console": "off",
  },
}, pluginRouter.configs["flat/recommended"], {
  files: [
    "src/routes/**/*.tsx",
  ],
  rules: {
    "react-refresh/only-export-components": "off",
  },
})
