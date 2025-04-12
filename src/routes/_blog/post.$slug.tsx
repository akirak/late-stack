import { createFileRoute } from "@tanstack/react-router"
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import { Post } from "@/schemas/post"
import {Fragment, jsxs, jsx} from 'react/jsx-runtime'
import { readDataFile } from "@/utils/data"

export const Route = createFileRoute("/_blog/post/$slug")({
  component: PostComponent,
  staleTime: Infinity,
  loader: async ({ params }) => {
    const rawContent = await readDataFile(`posts/${params.slug}.json`)
    const post = JSON.parse(rawContent) as Post
    return {
      post,
    }
  },
})

function PostComponent() {
  const { slug } = Route.useParams()
  const { post } = Route.useLoaderData()

  return (
    <main>
      <h1>
        Category
        {slug}
      </h1>

      <div>
        {toJsxRuntime(post.hastBody, {Fragment, jsxs, jsx})}
      </div>
    </main>
  )
}
