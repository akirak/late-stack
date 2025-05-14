import path from "node:path"
import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { Option, Schema } from "effect"
import { LanguageIdSchema } from "@/schemas/common"
import { PostSchema, PostSlugSchema } from "@/schemas/post"
import { readJsonDataFile } from "@/utils/data"

export type PostSlug = typeof PostSlugSchema.Type

export type Post = typeof PostSchema.Type

const PostDir = "posts"

const PostSpec = Schema.Struct({
  slug: PostSlugSchema,
  lang: LanguageIdSchema,
})

function getPostInternal({ slug, lang }: typeof PostSpec.Type) {
  return readJsonDataFile<typeof PostSchema.Encoded>(
    path.join(PostDir, `${slug}.${lang}.json`),
  )
}

const getPostFn = createServerFn({ method: "GET" })
  .validator(Schema.decodeUnknownSync(PostSpec))
  .handler(({ data }) =>
    getPostInternal(data).then(Option.getOrThrowWith(() => notFound()),
    ))

export function getPost(data: typeof PostSpec.Encoded) {
  return getPostFn({ data }).then(Schema.decodeUnknownSync(PostSchema))
}
