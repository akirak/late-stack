import type { PostMetadataSchema, PostSchema, PostSlugSchema } from "@/schemas/post"
import type { Option } from "effect"
import path from "node:path"
import { readJsonDataFile } from "@/utils/data"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export type PostMetadata = typeof PostMetadataSchema.Type

const PostDir = "posts"

export async function getPost(slug: PostSlug): Promise<Option.Option<Post>> {
  return await readJsonDataFile<Post>(path.join(PostDir, `${slug}.json`))
}
