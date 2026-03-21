import { createFileRoute } from "@tanstack/react-router"
import { getPostListAsync } from "@/collections/posts/list/server"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import { PostListTable } from "@/features/blog/components/PostListTable"
import { pageMeta } from "@/utils/seo"

export const Route = createFileRoute("/_blog/_archive/posts/")({
  component: PostArchiveComponent,
  loader: async () => {
    return { posts: await getPostListAsync({}) }
  },
  head: () => ({
    meta: pageMeta({
      ogType: "website",
      title: "Blog Archive",
      description: "View the archive of all blog posts on jingsi.space.",
    }),
  }),
})

function PostArchiveComponent() {
  const { posts } = Route.useLoaderData()
  return (
    <Container>
      <Header>
        <h1>List of Posts</h1>
      </Header>

      <main>
        <PostListTable posts={posts} />
      </main>
    </Container>
  )
}
