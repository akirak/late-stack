import type { LanguageId } from "@/schemas/common"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option, pipe } from "effect"
import { Header } from "react-aria-components"
import { getLanguageById } from "@/collections/languages"
import { getPostList } from "@/collections/posts.client"
import { Container } from "@/components/layout/Container"
import { PostListTable } from "@/features/blog/components/PostListTable"
import { pageMeta } from "@/utils/seo"

export const Route = createFileRoute("/_blog/_archive/post/$lang/")({
  component: PostArchiveComponent,
  loader: async ({ params }) => {
    const language = pipe(
      getLanguageById(params.lang as LanguageId),
      Option.getOrThrowWith(() => notFound()),
    )
    return {
      language,
      posts: await getPostList({
        filters: {
          language: language.id,
        },
      }),
    }
  },
  head: ({ loaderData }) => ({
    meta: pageMeta({
      ogType: "website",
      title: `Blog Archive [${loaderData!.language.englishName}]`,
    }),
  }),
})

function PostArchiveComponent() {
  const { language, posts } = Route.useLoaderData()

  return (
    <Container>
      <Header>
        <h1>
          List of posts in
          {" "}
          {
            language.englishName
              ? (
                  <span title={language.englishName}>
                    {language.localName}
                  </span>
                )
              : (
                  <span>
                    {language.localName}
                  </span>
                )
          }
        </h1>
      </Header>

      <main>
        <PostListTable posts={posts} />
      </main>
    </Container>
  )
}
