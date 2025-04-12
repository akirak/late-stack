import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive")({
  component: ArchiveLayout,
})

function ArchiveLayout() {
  return (
    <>
      <header>
        Archive
      </header>

      <Outlet />
    </>
  )
}
