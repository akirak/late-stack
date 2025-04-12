import antfu from "@antfu/eslint-config"
import pluginRouter from "@tanstack/eslint-plugin-router"

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
  ...pluginRouter.configs["flat/recommended"],
})
