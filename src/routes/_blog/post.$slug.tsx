import type { PostSlug } from "@/collections/posts"
import { getPost } from "@/collections/posts"
import { hastToJsx } from "@/utils/hast"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option } from "effect"

export const Route = createFileRoute("/_blog/post/$slug")({
  component: PostComponent,
  staleTime: Infinity,
  loader: async ({ params }) => {
    return {
      post: await getPost(params.slug as PostSlug).then(
        Option.getOrThrowWith(() => notFound()),
      ),
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
