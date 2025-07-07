import { Schema } from "effect"
import { LanguageIdSchema } from "@/schemas/common"
import { PostSchema } from "@/schemas/post"
import { PaginationSchema } from "@/utils/pagination"

// eslint-disable-next-line unused-imports/no-unused-vars
const PostMetadataSchema = PostSchema.omit("hastBody")

export type PostMetadata = typeof PostMetadataSchema.Type

export const PostsIndexFile = "posts.index.jsonl"

export const PostFilterSchema = Schema.Struct({
  language: Schema.optional(LanguageIdSchema),
})

export const PostListSpec = Schema.Struct({
  page: Schema.optional(PaginationSchema),
  filters: Schema.optional(PostFilterSchema),
})
