import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api")({
  component: () => <div>API Route</div>,
})
