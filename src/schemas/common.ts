import { Option, Schema } from "effect"

/**
 * Schema for a language code, e.g. "en". To prevent errors caused by mistyping,
 * only supported languages are accepted in this schema.
 */
export const LanguageIdSchema = Schema.String.pipe(
  Schema.filter(lang => ["en", "ja"].includes(lang)),
)

export type LanguageId = typeof LanguageIdSchema.Type

/**
 * Schema for information on a natural language used in this site.
 */
export const LanguagePropertiesSchema = Schema.Struct({
  id: LanguageIdSchema,
  localName: Schema.String,
  englishName: Schema.optional(Schema.String),
})

/**
 * Schema for a generic slug type. You can create a branded type from this for
 * slugs for a specific collection type.
 */
export const GenericSlugSchema = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.trimmed(),
  Schema.lowercased(),
)

/**
 * Schema for date and time format that is used across this project.
 */
const DateFromISOString = Schema.DateFromString

/**
 * Schema for an optional date field in a struct.
 */
export const OptionalDateSchema = Schema.optionalWith(
  DateFromISOString,
  {
    as: "Option",
    nullable: true,
    onNoneEncoding: () => Option.some(null),
  },
)
