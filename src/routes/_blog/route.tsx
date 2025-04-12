import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog")({
  component: BlogLayout,
})

function BlogLayout() {
  return (
    <div>
      <header>Blog layout</header>

      <Outlet />
    </div>
  )
}
