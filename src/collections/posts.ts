import type { PostSlugSchema } from "@/schemas/post"
import events from "node:events"
import path from "node:path"
import readline from "node:readline"
import { PostMetadataSchema, PostSchema } from "@/schemas/post"
import { readJsonDataFile, readTextStreamFromDataFile } from "@/utils/data"
import { Option, Schema } from "effect"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export type PostMetadata = typeof PostMetadataSchema.Type

const PostDir = "posts"

const PostsIndexFile = "posts.index.jsonl"

interface PageOptions {
  limit?: number
}

const DefaultLimit = 25

export const getPost: (slug: PostSlug) => Promise<Option.Option<Post>>
  = slug => readJsonDataFile(path.join(PostDir, `${slug}.json`))
    .then(Option.map(Schema.decodeUnknownSync(PostSchema)))

export async function getPostList({ limit }: PageOptions = {}): Promise<PostMetadata[]> {
  const thisLimit = limit ?? DefaultLimit
  const stream = readTextStreamFromDataFile(PostsIndexFile)
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })
  const result: PostMetadata[] = []
  let count = 0
  rl.on("line", (line) => {
    if (typeof line === "string") {
      if (line.length > 0) {
        result.push(Schema.decodeUnknownSync(PostMetadataSchema)(JSON.parse(line)))
        count += 1
      }
    }
    else {
      throw new TypeError("undecoded input while reading the post list")
    }
    if (count === thisLimit) {
      rl.close()
    }
  })
  await events.once(rl, "close")
  return result
}
