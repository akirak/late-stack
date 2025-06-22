import type { PostFilterSchema, PostListSpec, PostMetadata } from "./types"
import type { Pagination } from "@/utils/pagination"
import { Schema } from "effect"
import { constTrue } from "effect/Function"
import { PostMetadataSchema } from "@/schemas/post"
import { readJsonLinesDataFileFiltered } from "@/utils/data"
import { PaginationSchema } from "@/utils/pagination"
import { PostsIndexFile } from "./types"

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

export function getPostListInternal({ page, filters }: typeof PostListSpec.Type) {
  return readJsonLinesDataFileFiltered<typeof PostMetadataSchema.Type, typeof PostMetadataSchema.Encoded>(
    PostsIndexFile,
    PostMetadataSchema,
    page ?? DefaultPagination,
    filters && toPostFilter(filters),
  )
}
