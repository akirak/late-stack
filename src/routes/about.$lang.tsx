import { createFileRoute } from "@tanstack/react-router"
import { getProfile } from "@/collections/about/server"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import SocialLinks from "@/features/social/components/SocialLinks"
import { hastToJsx } from "@/utils/hast"
import { pageMeta } from "@/utils/seo"

export const Route = createFileRoute("/about/$lang")({
  component: AboutComponent,
  loader: ({ params }) => getProfile(params),
  head: ({ loaderData, params }) => ({
    meta: pageMeta({
      ogType: "article",
      title: `${loaderData!.fullName} (${params.lang})`,
      description: "About the author of jingsi.space. This page provides information about the author's background, social accounts, and website purpose.",
    }),
  }),
})

function AboutComponent() {
  const { taglineHast, descriptionHast, postscriptHast, socialLinks } = Route.useLoaderData()

  return (
    <Container>
      <Header>
        <h1 id="page-heading">About the Author</h1>
      </Header>

      <main aria-labelledby="page-heading" className="typography">
        {
          // TODO: Extract a React component
        }
        <div className="admonition admonition-warning">
          <div className="admonition-header">
            <span className="admonition-icon" aria-hidden="true">⚠️️</span>
            Disclaimer: Not Intended for Recruitment
          </div>
          <div className="admonition-content">
            This page is intended for readers of this blog. It provides context about the author and the purpose of the website. It is not designed for recruitment or hiring inquiries.
          </div>
        </div>

        {hastToJsx(taglineHast)}

        <SocialLinks items={socialLinks} />

        {hastToJsx(descriptionHast)}

        <hr />

        <h2>Trivium</h2>

        {hastToJsx(postscriptHast)}
      </main>
    </Container>
  )
}
