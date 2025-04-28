import { Schema } from "effect"
import { GenericSlugSchema, LanguageIdSchema } from "./common"

export const PostSlugSchema = GenericSlugSchema.pipe(
  Schema.brand("PostSlug"),
)

/**
 * Schema for the entire post.
 */
export const PostSchema = Schema.Struct({
  slug: PostSlugSchema,
  title: Schema.String,
  language: LanguageIdSchema,
  // category: Schema.optional(Schema.String),
  // tags: Schema.Array(Schema.String),
  publicationDate: Schema.optionalWith(Schema.Date, {
    nullable: true
  }),
  draft: Schema.Boolean,
  hastBody: Schema.Any,
})

/**
 * Schema for the metadata of a post which corresponds to the YAML header.
 */
export const PostMetadataSchema = PostSchema.omit("hastBody").pipe(
  Schema.filter(
    (meta) => {
      if (!meta.draft && !meta.publicationDate) {
        return {
          path: ["publicationDate"],
          message: "A non-draft post must have a publicationDate metadata. Set the metadata, or set the draft status to true",
        }
      }
    },
  ),
)
