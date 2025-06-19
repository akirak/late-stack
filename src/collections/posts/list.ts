import type { Pagination } from "@/utils/pagination"
import { createServerFn } from "@tanstack/react-start"
import { Schema } from "effect"
import { constTrue } from "effect/Function"
import { LanguageIdSchema } from "@/schemas/common"
import { PostMetadataSchema } from "@/schemas/post"
import { readJsonLinesDataFileFiltered } from "@/utils/data"
import { PaginationSchema } from "@/utils/pagination"

export type PostMetadata = typeof PostMetadataSchema.Type

const PostsIndexFile = "posts.index.jsonl"

const PostFilterSchema = Schema.Struct({
  language: Schema.optional(LanguageIdSchema),
})

function toPostFilter(params: typeof PostFilterSchema.Type) {
  if (params.language) {
    return (meta: PostMetadata) => (meta.language === params.language)
  }
  return constTrue
}

const DefaultPagination: Pagination = Schema.decodeUnknownSync(PaginationSchema)({
  offset: 0,
  limit: 30,
})

const PostListSpec = Schema.Struct({
  page: Schema.optional(PaginationSchema),
  filters: Schema.optional(PostFilterSchema),
})

function getPostListInternal({ page, filters }: typeof PostListSpec.Type) {
  return readJsonLinesDataFileFiltered<typeof PostMetadataSchema.Type, typeof PostMetadataSchema.Encoded>(
    PostsIndexFile,
    PostMetadataSchema,
    page ?? DefaultPagination,
    filters && toPostFilter(filters),
  )
}

const getPostListFn = createServerFn({ method: "GET" })
  .validator(Schema.decodeUnknownSync(PostListSpec))
  .handler(({ data }) => getPostListInternal(data))

export function getPostList(data: typeof PostListSpec.Encoded): Promise<readonly PostMetadata[]> {
  return getPostListFn({ data }).then(Schema.decodeUnknownSync(Schema.Array(PostMetadataSchema)))
}

export function getPostListOnServer(args: typeof PostListSpec.Type) {
  return getPostListInternal(args).then(Schema.decodeUnknownSync(Schema.Array(PostMetadataSchema)))
}
