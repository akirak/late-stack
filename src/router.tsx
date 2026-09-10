import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createTanStackRouter({
    context: {
      titleSuffix: ` — jingsi.space`,
    },
    routeTree,
    defaultStaleTime: Infinity,
    defaultPreload: "intent",
    defaultErrorComponent: err => (
      <div>
        <p>{err.error instanceof Error ? err.error.message : String(err.error)}</p>
      </div>
    ),
    defaultNotFoundComponent: () => <p>not found</p>,
    scrollRestoration: true,
  })

  return router
}
