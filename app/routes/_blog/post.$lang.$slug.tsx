import { createFileRoute } from "@tanstack/react-router"
import { getPost } from "../../../src/collections/posts/item"
import { hastToJsx } from "../../../src/utils/hast"

export const Route = createFileRoute("/_blog/post/$lang/$slug")({
  component: PostComponent,
  loader: async ({ params }) => {
    return {
      post: await getPost(params),
    }
  },
})

function PostComponent() {
  const { post } = Route.useLoaderData()

  return (
    <main>
      <h1>
        {post.title}
      </h1>

      <div>
        {hastToJsx(post.hastBody)}
      </div>
    </main>
  )
}
