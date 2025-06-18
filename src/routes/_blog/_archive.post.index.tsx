import { createFileRoute } from "@tanstack/react-router"
import { getPostList } from "@/collections/posts"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
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
    <Container>
      <Header>
        <h1>List of posts</h1>
      </Header>

      <main>
        <PostListTable posts={posts} />
      </main>
    </Container>
  )
}
