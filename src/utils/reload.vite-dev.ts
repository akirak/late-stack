import type { RouteUpdate } from "@/dev/types"
import { useMatchRoute, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

export interface CustomRouteReload {
  path: string
}

export function useRouteReload() {
  const router = useRouter()
  const matchRoute = useMatchRoute()

  useEffect(() => {
    import.meta.hot!.on("routes-reload", ({ entries }: { entries: RouteUpdate[] }) => {
      if (entries.some(entry => entry.type === "reload" && matchRoute(entry.matchRoute))) {
        router.invalidate()
      }
    })
  }, [matchRoute, router])
}
