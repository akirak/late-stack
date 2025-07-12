interface MatchRoute {
  to: string
  params?: Record<string, unknown>
}

export interface RouteUpdate {
  type: "reload" | "delete"
  matchRoute: MatchRoute
}
