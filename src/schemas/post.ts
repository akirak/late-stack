import { Schema } from "effect"

export const PostMetadataSchema = Schema.Struct({
  // id: Schema.String,
  slug: Schema.String,
  title: Schema.String,
  // content: Schema.String,
  /*
  publishDate: Schema.Date,
  category: Schema.String,
  tags: Schema.Array(Schema.String),
  draft: Schema.optional(Schema.String),
  excerpt: Schema.optional(Schema.String),
  */
})

export type PostMetadata = typeof PostMetadataSchema.Type

export const PostSchema = Schema.Struct({
  ...PostMetadataSchema.fields,
  hastBody: Schema.Any,
})

export type Post = typeof PostSchema.Type
