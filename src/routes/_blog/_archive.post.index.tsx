import { createFileRoute } from "@tanstack/react-router"
import { getPostList } from "@/collections/posts"
import { PostListTable } from "@/features/blog/components/PostListTable"

export const Route = createFileRoute("/_blog/_archive/post/")({
  component: PostArchiveComponent,
  loader: async () => {
    return { posts: await getPostList({}) }
  },
})

function PostArchiveComponent() {
  const { posts } = Route.useLoaderData()
  return (
    <>
      <header>
        List of posts
      </header>

      <PostListTable posts={posts} />
    </>
  )
}
