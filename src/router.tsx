import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultStaleTime: Infinity,
    defaultPreload: "intent",
    defaultErrorComponent: err => (
      <div>
        <p>
          {err.error.message}
        </p>
      </div>
    ),
    defaultNotFoundComponent: () => <p>not found</p>,
    scrollRestoration: true,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
