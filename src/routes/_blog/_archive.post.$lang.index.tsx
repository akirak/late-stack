import type { LanguageId } from "@/schemas/common"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option, pipe } from "effect"
import { getLanguageById } from "@/collections/languages"
import { getPostList } from "@/collections/posts"
import { PostListTable } from "@/features/blog/components/PostListTable"

export const Route = createFileRoute("/_blog/_archive/post/$lang/")({
  component: PostArchiveComponent,
  loader: async ({ params }) => {
    const language = pipe(
      getLanguageById(params.lang as LanguageId),
      Option.getOrThrowWith(() => notFound()),
    )
    return { language, posts: await getPostList({
      filters: {
        language: language.id,
      },
    }) }
  },
})

function PostArchiveComponent() {
  const { language, posts } = Route.useLoaderData()

  return (
    <>
      <header>
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
      </header>

      <PostListTable posts={posts} />
    </>
  )
}
