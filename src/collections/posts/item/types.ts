import type { PostSchema } from "@/schemas/post"
import { Schema } from "effect"
import { LanguageIdSchema } from "@/schemas/common"
import { PostSlugSchema } from "@/schemas/post"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

export const PostSpec = Schema.Struct({
  slug: PostSlugSchema,
  lang: LanguageIdSchema,
})
