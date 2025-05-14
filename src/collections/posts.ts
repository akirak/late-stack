import type { LanguageId } from "@/schemas/common"
import type { PostSlugSchema } from "@/schemas/post"
import type { Pagination } from "@/utils/pagination"
import path from "node:path"
import { Function } from "effect"
import { PostMetadataSchema, PostSchema } from "@/schemas/post"
import { readJsonDataFileWithSchema, readJsonLinesDataFileWithSchema } from "@/utils/data"
import { DefaultPagination } from "@/utils/pagination"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export type PostMetadata = typeof PostMetadataSchema.Type

const PostDir = "posts"

const PostsIndexFile = "posts.index.jsonl"

interface PostOptions {
  lang: LanguageId
}

export function getPost(slug: PostSlug, { lang }: PostOptions) {
  return readJsonDataFileWithSchema(
    PostSchema,
    path.join(PostDir, `${slug}.${lang}.json`),
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
