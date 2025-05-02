import type { PostSlugSchema } from "@/schemas/post"
import type { Pagination } from "@/utils/pagination"
import path from "node:path"
import { PostMetadataSchema, PostSchema } from "@/schemas/post"
import { readJsonDataFileWithSchema, readJsonLinesDataFileWithSchema } from "@/utils/data"
import { DefaultPagination } from "@/utils/pagination"
import { Function } from "effect"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export type PostMetadata = typeof PostMetadataSchema.Type

const PostDir = "posts"

const PostsIndexFile = "posts.index.jsonl"

export function getPost(slug: PostSlug) {
  return readJsonDataFileWithSchema(
    PostSchema,
    path.join(PostDir, `${slug}.json`),
  )
}

type EncodedMetadata = typeof PostMetadataSchema.Encoded

export function getPostList(predicate?: (meta: PostMetadata) => boolean, page?: Pagination) {
  return readJsonLinesDataFileWithSchema<PostMetadata, EncodedMetadata>(
    PostsIndexFile,
    PostMetadataSchema,
    predicate ?? Function.constTrue,
    page ?? DefaultPagination,
  )
}
