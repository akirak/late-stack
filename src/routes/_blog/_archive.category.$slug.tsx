import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/category/$slug")({
  component: CategoryComponent,
})

function CategoryComponent() {
  const { slug } = Route.useParams()

  return (
    <main>
      <h1>
        CategoryComponent
        {slug}
      </h1>
    </main>
  )
}
