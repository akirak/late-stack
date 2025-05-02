import type { PostMetadata } from "@/collections/posts"
import { getPostList } from "@/collections/posts"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/post/$lang/")({
  component: PostArchiveComponent,
  loader: async ({ params }) => {
    const posts = await getPostList(
      (meta: PostMetadata) => meta.language === params.lang,
    )
    return { posts }
  },
})

function PostArchiveComponent() {
  const { lang } = Route.useParams()
  const { posts } = Route.useLoaderData()
  return (
    <>
      <header>
        List of posts in
        {" "}
        {lang}
      </header>

      <table>
        <thead>
          <tr>
            <th>
              Title
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.slug}>
              <td>
                {post.title}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
