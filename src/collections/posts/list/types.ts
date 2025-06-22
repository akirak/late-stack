import type { PostMetadataSchema } from "@/schemas/post"
import { Schema } from "effect"
import { LanguageIdSchema } from "@/schemas/common"
import { PaginationSchema } from "@/utils/pagination"

export type PostMetadata = typeof PostMetadataSchema.Type

export const PostsIndexFile = "posts.index.jsonl"

export const PostFilterSchema = Schema.Struct({
  language: Schema.optional(LanguageIdSchema),
})

export const PostListSpec = Schema.Struct({
  page: Schema.optional(PaginationSchema),
  filters: Schema.optional(PostFilterSchema),
})
