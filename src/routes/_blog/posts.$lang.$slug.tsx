import { createFileRoute } from "@tanstack/react-router"
import { Option } from "effect"
import { getPost } from "@/collections/posts.client"
import { Toc } from "@/components/block/Toc"
import { DateFormat } from "@/components/inline/DateFormat"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import { Nav } from "@/components/layout/Nav"
import { hastShallowHeadings, hastToJsx } from "@/utils/hast"
import { pageMeta } from "@/utils/seo"
import { useSticky } from "@/utils/sticky"

export const Route = createFileRoute("/_blog/posts/$lang/$slug")({
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
  useSticky("main :where(h2, h3, h4, h5, h6):not(.link-card-title)")

  return (
    <Container>
      <Header id="post-header">
        <h1>
          {post.title}
        </h1>
        <ul className="post-meta">
          {
            Option.isSome(post.publicationDate) && (
              <li aria-label="Publication date">
                <DateFormat date={post.publicationDate} />
              </li>
            )
          }
          <li
            aria-label="Estimated reading time"
            title={`${post.readingTime.text} — ${post.readingTime.words} words`}
          >
            {post.readingTime.text}
          </li>
        </ul>
      </Header>

      <Nav>
        <section>
          <h2>Table of Contents</h2>
          <h3 className="self">
            <a
              href="#post-header"
              onClick={(e) => {
                window.scrollTo({ top: 0 })
                // If the scroll behavior is smooth, not instance, the hash will
                // be updated many times during scrolling. Thus the hash needs
                // to be cleared after the scroll ends.
                window.addEventListener("scrollend", () => {
                  window.location.hash = ""
                }, { once: true })
                e.preventDefault()
              }}
              aria-label="Go to the beginning of the post"
            >
              {post.title}
            </a>
          </h3>
          <Toc headings={hastShallowHeadings(post.hastBody)} />
        </section>
      </Nav>

      <main className="typography">
        {hastToJsx(post.hastBody)}
      </main>
    </Container>
  )
}
