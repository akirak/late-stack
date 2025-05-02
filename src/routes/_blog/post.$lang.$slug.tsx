import type { PostSlug } from "@/collections/posts"
import { getPost } from "@/collections/posts"
import { hastToJsx } from "@/utils/hast"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option } from "effect"

export const Route = createFileRoute("/_blog/post/$lang/$slug")({
  component: PostComponent,
  staleTime: Infinity,
  loader: async ({ params }) => {
    const post = await getPost(params.slug as PostSlug).then(
      Option.getOrThrowWith(() => notFound()),
    )

    // Check the language.
    if (post.language === params.lang) {
      return {
        post,
      }
    }
    else {
      // The post is not available in the language. The world is complex.
      throw notFound()
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
