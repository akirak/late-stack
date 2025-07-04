import { createFileRoute } from "@tanstack/react-router"
import { Option } from "effect"
import { getPost } from "@/collections/posts.client"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import { hastToJsx } from "@/utils/hast"
import { pageMeta } from "@/utils/seo"
import { useSticky } from "@/utils/sticky"

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
      description: Option.getOrUndefined(
        loaderData!.post.description,
      ),
    }),
  }),
})

function PostComponent() {
  const { post } = Route.useLoaderData()

  // Make the headings sticky. Exclude link cards.
  useSticky("main :where(h2, h3, h4, h5, h6)")

  return (
    <Container>
      <Header>
        <h1>
          {post.title}
        </h1>
      </Header>

      <main className="typography">
        {hastToJsx(post.hastBody)}
      </main>
    </Container>
  )
}
