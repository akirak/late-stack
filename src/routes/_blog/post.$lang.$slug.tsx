import { createFileRoute } from "@tanstack/react-router"
import { getPost } from "@/collections/posts.client"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import { hastToJsx } from "@/utils/hast"
import { pageMeta } from "@/utils/seo"

export const Route = createFileRoute("/_blog/post/$lang/$slug")({
  component: PostComponent,
  loader: async ({ params }) => {
    return {
      post: await getPost(params),
    }
  },
  head: ({ loaderData }) => ({
    meta: pageMeta({
      ogType: "article",
      title: loaderData!.post.title,
    }),
  }),
})

function PostComponent() {
  const { post } = Route.useLoaderData()

  return (
    <Container>
      <Header>
        <h1>
          {post.title}
        </h1>
      </Header>

      <main>
        {hastToJsx(post.hastBody)}
      </main>
    </Container>
  )
}
