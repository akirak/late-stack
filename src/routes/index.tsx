import { createFileRoute } from "@tanstack/react-router"
import { getSocialLinksByLanguage } from "@/collections/about/profile"
import { getPostList } from "@/collections/posts.client"
import { Container } from "@/components/layout/Container"
import { Header } from "@/components/layout/Header"
import { PostListTable } from "@/features/blog/components/PostListTable"
import SocialLinks from "@/features/social/components/SocialLinks"
import { siteMeta } from "@/utils/seo"

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async () => {
    return { posts: await getPostList({}) }
  },
  head: () => ({
    meta: siteMeta({
      ogType: "website",
      title: "jingsi.space",
      description: "A personal blog by Akira Komamura",
    }),
  }),
})

function HomeComponent() {
  const { posts } = Route.useLoaderData()
  const socialLinks = getSocialLinksByLanguage("en")

  return (
    <Container>
      <Header>
        <h1 aria-label="Title of the entire site">jingsi.space</h1>
      </Header>

      <div className="flex flex-col items-center gap-4">
        <SocialLinks items={socialLinks} />
      </div>

      <main>
        <PostListTable posts={posts} />
      </main>
    </Container>
  )
}
