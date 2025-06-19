import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog")({
  component: BlogLayout,
  head: () => ({
    links: [
      { rel: "alternate", href: "/feeds/default.xml", type: "application/atom+xml" },
    ],
  }),
})

function BlogLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
