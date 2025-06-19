import type { NonEmptyReadonlyArray } from "effect/Array"
import type { PostMetadata } from "@/collections/posts/list"
import { createServerFileRoute } from "@tanstack/react-start/server"
import { Option, pipe } from "effect"
import { getPostOnServer } from "@/collections/posts/item"
import { getPostListOnServer } from "@/collections/posts/list"
import { hastToHtml } from "@/utils/hast"
import { generateAtomFeed } from "@/utils/rss"

const baseUrl = "https://jingsi.space"

export const ServerRoute = createServerFileRoute("/feeds/default.xml").methods({
  GET: async () => {
    try {
      // Get latest 10 posts metadata
      const postList = await getPostListOnServer({
        page: { offset: 0, limit: 10 },
      })

      if (postList.length === 0) {
        return new Response("No posts available", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        })
      }

      const atomXml = generateAtomFeed({
        self: `${baseUrl}/feeds/default.xml`,
        title: "TanStack Blog",
        subtitle: "Latest posts from the TanStack Blog",
        baseUrl,
        toUpdated: (post: PostMetadata) => pipe(
          post.publicationDate,
          Option.getOrElse(() => new Date()),
        ),
        toEntry: (post: PostMetadata) => {
          const data = getPostOnServer({
            slug: post.slug,
            lang: post.language,
          })
          const _cdata = hastToHtml(data.hastBody)
          return {
            title: post.title,
            href: `${baseUrl}/post/${post.language}/${post.slug}`,
            id: post.slug,
            published: Option.getOrUndefined(post.publicationDate),
            _cdata,
          }
        },
      }, postList as NonEmptyReadonlyArray<PostMetadata>)

      return new Response(atomXml, {
        headers: {
          "Content-Type": "application/atom+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      })
    }
    catch (error) {
      console.error("Error generating RSS feed:", error)
      return new Response("RSS feed not available", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }
  },
})
