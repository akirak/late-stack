import type { PostMetadata } from "@/collections/posts.client"
import { Link } from "@tanstack/react-router"
import { DateFormat } from "@/components/inline/DateFormat"

export function PostListTable({ posts }: { posts: readonly PostMetadata[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>
            Title
          </th>
          <th>
            Date published
          </th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={post.slug}>
            <td>
              <Link
                to="/post/$lang/$slug"
                params={{
                  lang: post.language,
                  slug: post.slug,
                }}
              >
                {post.title}
              </Link>
            </td>
            <td>
              <DateFormat date={post.publicationDate} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
