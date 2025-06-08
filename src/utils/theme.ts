export function toggleTheme() {
  try {
    const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const savedTheme = localStorage.getItem("theme")
    const currentTheme = savedTheme || defaultTheme
    const newTheme = (currentTheme === "dark") ? "light" : "dark"
    if (newTheme === defaultTheme) {
      document.documentElement.removeAttribute("data-theme")
      localStorage.removeItem("theme")
    }
    else {
      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)
    }
  }
  catch (e) {
    console.error(`Failed to toggle theme: ${e}`)
  }
}
