import type { PostSlug } from "@/collections/posts"
import type { LanguageId } from "@/schemas/common"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option } from "effect"
import { getPost } from "@/collections/posts"
import { hastToJsx } from "@/utils/hast"

export const Route = createFileRoute("/_blog/post/$lang/$slug")({
  component: PostComponent,
  staleTime: Infinity,
  loader: async ({ params: { slug, lang } }) => {
    const post = await getPost(slug as PostSlug, {
      lang: lang as LanguageId,
    }).then(
      Option.getOrThrowWith(() => notFound()),
    )
    return {
      post,
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
