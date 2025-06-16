import { createFileRoute } from "@tanstack/react-router"
import { getPostList } from "@/collections/posts"
import { PostListTable } from "@/features/blog/components/PostListTable"

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async () => {
    return { posts: await getPostList({}) }
  },
})

function HomeComponent() {
  const { posts } = Route.useLoaderData()
  return (
    <main>
      <h1>jingsi.space</h1>

      <PostListTable posts={posts} />
    </main>
  )
}
