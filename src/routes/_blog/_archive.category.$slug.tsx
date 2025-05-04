import { getPostList } from "@/collections/posts"
import { PostListTable } from "@/features/blog/components/PostListTable"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/category/$slug")({
  component: CategoryComponent,
  loader: async () => {
    const posts = await getPostList(
      // (meta: PostMetadata) => meta.category === params.slug,
    )
    return { posts }
  },
})

function CategoryComponent() {
  const { slug } = Route.useParams()
  const { posts } = Route.useLoaderData()

  return (
    <main>
      <h1>
        Category
        {slug}
      </h1>

      <PostListTable posts={posts} />
    </main>
  )
}
