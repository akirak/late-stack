import { createFileRoute } from "@tanstack/react-router"
import { getPostList } from "@/collections/posts"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
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
    <Container>
      <Header>
        <h1 aria-label="Title of the entire site">jingsi.space</h1>
      </Header>

      <main>
        <PostListTable posts={posts} />
      </main>
    </Container>
  )
}
