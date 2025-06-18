import { createFileRoute } from "@tanstack/react-router"
import { getPost } from "@/collections/posts"
import { Container } from "@/components/layout/Container"
import { DocumentTitle } from "@/components/layout/DocumentTitle"
import { Header } from "@/components/layout/Header"
import { hastToJsx } from "@/utils/hast"

export const Route = createFileRoute("/_blog/post/$lang/$slug")({
  component: PostComponent,
  loader: async ({ params }) => {
    return {
      post: await getPost(params),
    }
  },
})

function PostComponent() {
  const { post } = Route.useLoaderData()

  return (
    <Container>
      <Header>
        <h1>
          {post.title}
        </h1>
        <DocumentTitle title={post.title} />
      </Header>

      <main>
        {hastToJsx(post.hastBody)}
      </main>
    </Container>
  )
}
