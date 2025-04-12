import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/post/")({
  component: PostArchiveComponent,
})

function PostArchiveComponent() {
  return (
    <>
      <header>
        List of posts
      </header>

      <ul>
        <li>
          Post 1
        </li>
        <li>
          Post 2
        </li>
      </ul>
    </>
  )
}
