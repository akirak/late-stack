import type { BundledShikiTheme, ExpressiveCodeEngineConfig } from "expressive-code"
import { loadShikiTheme } from "expressive-code"

const themeNames = ["github-light", "github-dark"] satisfies BundledShikiTheme[]

export async function loadConfig(): Promise<ExpressiveCodeEngineConfig> {
  const themes = await Promise.all(
    themeNames.map(name => loadShikiTheme(name)),
  )

  return {
    themes,
    themeCssSelector: (theme) => {
      const match = theme && theme.name.match(/(dark|light)/)
      if (match) {
        return `[data-theme=${match[1]}]`
      }
      return false
    },
    styleOverrides: {
      codeFontFamily: "var(--font-mono)",
      uiFontFamily: "var(--font-system)",
    },
  }
}
