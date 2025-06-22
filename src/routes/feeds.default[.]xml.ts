import type { NonEmptyArray } from "effect/Array"
import * as fs from "node:fs"
import path from "node:path"
import { createServerFileRoute } from "@tanstack/react-start/server"
import { Option, pipe, Schema } from "effect"
import { PostMetadataSchema, PostSchema } from "@/schemas/post"
import { getDataDir, readJsonDataFileSync } from "@/utils/data"
import { hastToHtml } from "@/utils/hast"
import { generateAtomFeed } from "@/utils/rss"

const baseUrl = "https://jingsi.space"

export const ServerRoute = createServerFileRoute("/feeds/default.xml").methods({
  GET: async () => {
    try {
      // Get latest 10 posts metadata
      const dataPath = path.resolve(getDataDir(), "posts.index.jsonl")

      if (!fs.existsSync(dataPath)) {
        console.warn("posts.index.jsonl not found. Running build first to generate post data.")
        return []
      }

      const fileContent = fs.readFileSync(dataPath, "utf-8")
      const postList = fileContent
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(line => JSON.parse(line))
        .map((post: unknown) => Schema.decodeUnknownSync(PostMetadataSchema)(post))

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
        toUpdated: (post: typeof PostMetadataSchema.Type) => pipe(
          post.publicationDate,
          Option.getOrElse(() => new Date()),
        ),
        toEntry: (post: typeof PostMetadataSchema.Type) => {
          const data = pipe(
            readJsonDataFileSync<typeof PostSchema.Encoded>(
              path.join("post", `${post.slug}.${post.language}.json`),
            ),
            Option.getOrThrow,
            Schema.decodeUnknownSync(PostSchema),
          )
          const _cdata = hastToHtml(data.hastBody)
          return {
            title: post.title,
            href: `${baseUrl}/post/${post.language}/${post.slug}`,
            id: post.slug,
            published: Option.getOrUndefined(post.publicationDate),
            _cdata,
          }
        },
      }, postList as NonEmptyArray<typeof PostMetadataSchema.Type>)

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
