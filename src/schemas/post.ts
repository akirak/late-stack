import { Schema } from "effect"
import { GenericSlugSchema, LanguageIdSchema, OptionalDateSchema } from "./common"

export const ReadingTimeSchema = Schema.Struct({
  text: Schema.String,
  minutes: Schema.Number,
  time: Schema.Number,
  words: Schema.Number,
})

export const PostSlugSchema = GenericSlugSchema.pipe(
  Schema.brand("PostSlug"),
)

/**
 * Schema for the entire post.
 */
export const PostSchema = Schema.Struct({
  fileName: Schema.String,
  slug: PostSlugSchema,
  title: Schema.String,
  language: LanguageIdSchema,
  description: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  // category: Schema.optional(Schema.String),
  // tags: Schema.Array(Schema.String),
  publicationDate: OptionalDateSchema,
  draft: Schema.optionalWith(
    Schema.Boolean,
    {
      default: () => false,
      nullable: true,
    },
  ),
  readingTime: ReadingTimeSchema,
  hastBody: Schema.Any,
})

/**
 * Schema for the metadata of a post, excluding the body content, which is
 * stored in the index.
 */
export const PostMetadataSchema = PostSchema.omit("hastBody")

/**
 * Schema for parsing the YAML front matter of a post.
 */
export const PostMetadataHeaderSchema = PostSchema.omit("hastBody", "readingTime").pipe(
  Schema.filter(
    (meta) => {
      if (!meta.draft && (meta.description === null || meta.description === undefined)) {
        return {
          path: ["description"],
          message: "A non-draft post must have a description metadata. Set the metadata, or set the draft status to true",
        }
      }
      if (!meta.draft && (meta.publicationDate === null || meta.publicationDate === undefined)) {
        return {
          path: ["publicationDate"],
          message: "A non-draft post must have a publicationDate metadata. Set the metadata, or set the draft status to true",
        }
      }
    },
  ),
)
