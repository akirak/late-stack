import type { AppRouteContext } from "@/types/route"
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import * as React from "react"
import appCss from "@/styles/main.css?url"
import { useRouteReload } from "@/utils/reload"
import "@/types/css"

const getServerTheme = createServerFn({ method: "GET" }).handler(
  async () => {
    const theme = getCookie("theme")
    if (theme === "light" || theme === "dark") {
      return theme
    }
    return undefined
  },
)

const setServerTheme = createServerFn({ method: "POST" })
  .validator((theme: string) => theme)
  .handler(
    ({ data: theme }) => {
      setCookie("theme", theme, {
        path: "/",
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
      })
    },
  )

export const Route = createRootRouteWithContext<AppRouteContext>()({
  loader: async () => {
    const theme = await getServerTheme()
    return {
      theme,
    }
  },
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Manrope:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "alternate", type: "application/atom+xml", title: "RSS", href: "/feeds/default.xml" },
    ],
  }),
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useLoaderData()

  useRouteReload()

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
      || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    const newTheme = (currentTheme === "dark") ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", newTheme)
    setServerTheme({ data: newTheme })
  }

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="site">
        <header className="root-header">
          <a href="/" aria-label="Go to home page of jingsi.space">
            <span className="hidden">
              jingsi.space
            </span>
            <svg
              role="img"
              viewBox="0 0 440 440"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ color: "#c583c0", borderRadius: "100%", height: "var(--logo-height)" }}
            >
              <rect width="440" height="440" fill="#e5e5e5" />
              <path
                d="M 35 35 L 385 35 L 385 175 L 315 175 L 315 245 L 245 245 L 245 315 L 175 315 L 175 245 L 105 245 L 105 175 L 35 175 Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </header>

        <nav className="root-nav">
          <ul aria-label="Main navigation menu">
            <li>
              <Link to="/post">
                Archive
              </Link>
            </li>
            <li>
              <Link to="/about">
                About
              </Link>
            </li>
            <li>
              <a href="/feeds/default.xml" aria-label="RSS feed">
                <svg width="16" height="16" viewBox="-3 0 17 17"><path d="M.926 12.818a1.403 1.403 0 1 1 0 1.984 1.402 1.402 0 0 1 0-1.984zm10.531 2.357a1.03 1.03 0 0 1-1.029-1.03 8.775 8.775 0 0 0-.694-3.438A8.826 8.826 0 0 0 1.591 5.31a1.03 1.03 0 1 1 0-2.059 10.817 10.817 0 0 1 4.24.857 10.893 10.893 0 0 1 3.463 2.334 10.867 10.867 0 0 1 3.19 7.703 1.027 1.027 0 0 1-1.027 1.029zm-4.538 0a1.03 1.03 0 0 1-1.029-1.03 4.297 4.297 0 0 0-4.299-4.298 1.03 1.03 0 0 1 0-2.059 6.362 6.362 0 0 1 5.857 3.883 6.298 6.298 0 0 1 .5 2.475 1.03 1.03 0 0 1-1.029 1.029z" fill="currentColor" /></svg>
                <span className="hidden">
                  RSS
                </span>
              </a>
            </li>
            <li>
              <a href="https://github.com/akirak" aria-label="GitHub profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="hidden">
                  GitHub
                </span>
              </a>
            </li>
            <li>
              <button type="button" onClick={toggleTheme} aria-label="Toggle theme">
                <span className="hidden">
                  Toggle theme
                </span>
              </button>
            </li>
          </ul>
        </nav>

        {children}

        <footer className="root-footer">
          <div aria-label="Copyright of this site">
            © 2025
            {" "}
            <Link to="/about">Akira Komamura</Link>
          </div>

          <div aria-label="License of this site">
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              aria-label="Read the license of this site content"
            >
              CC BY-NC-SA 4.0
            </a>
          </div>
        </footer>

        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
