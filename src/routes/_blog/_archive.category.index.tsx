import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/category/")({
  component: CategoryListComponent,
})

function CategoryListComponent() {
  return (
    <main>
      <h1>List of categories</h1>
    </main>
  )
}
