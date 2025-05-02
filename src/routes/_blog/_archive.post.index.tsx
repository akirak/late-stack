import { getPostList } from "@/collections/posts"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_blog/_archive/post/")({
  component: PostArchiveComponent,
  loader: async () => {
    const posts = await getPostList()
    return { posts }
  },
})

function PostArchiveComponent() {
  const { posts } = Route.useLoaderData()
  return (
    <>
      <header>
        List of posts
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
