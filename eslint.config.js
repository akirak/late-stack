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
