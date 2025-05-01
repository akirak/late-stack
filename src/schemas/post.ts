import { Option, Schema } from "effect"
import { GenericSlugSchema, LanguageIdSchema, OptionalDateSchema } from "./common"

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
  hastBody: Schema.Any,
})

/**
 * Schema for the metadata of a post which corresponds to the YAML header.
 */
export const PostMetadataSchema = PostSchema.omit("hastBody").pipe(
  Schema.filter(
    (meta) => {
      if (!meta.draft && Option.isNone(meta.publicationDate)) {
        return {
          path: ["publicationDate"],
          message: "A non-draft post must have a publicationDate metadata. Set the metadata, or set the draft status to true",
        }
      }
    },
  ),
)
