import type { PostSchema, PostSlugSchema } from "@/schemas/post"
import type { Option } from "effect"
import path from "node:path"
import { PostMetadataSchema } from "@/schemas/post"
import { readJsonDataFile, readTextStreamFromDataFile } from "@/utils/data"
import { Schema } from "effect"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export type PostMetadata = typeof PostMetadataSchema.Type

const PostDir = "posts"

const PostsIndexFile = "posts.index.jsonl"

interface PageOptions {
  limit?: number
}

const DefaultLimit = 25

export async function getPost(slug: PostSlug): Promise<Option.Option<Post>> {
  return await readJsonDataFile<Post>(path.join(PostDir, `${slug}.json`))
}

export function getPostList({ limit }: PageOptions = {}): PostMetadata[] {
  const thisLimit = limit ?? DefaultLimit
  const stream = readTextStreamFromDataFile(PostsIndexFile)
  const result: PostMetadata[] = []
  let count = 0
  stream.on("data", (chunk) => {
    if (typeof chunk === "string") {
      result.push(Schema.decodeUnknownSync(PostMetadataSchema)(JSON.parse(chunk)))
      count += 1
    }
    else {
      throw new TypeError("undecoded input while reading the post list")
    }
    if (count === thisLimit) {
      stream.close()
    }
  })
  return result
}
