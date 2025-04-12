import { Schema } from "effect"

export const LanguageIdSchema = Schema.String.pipe(
  Schema.length({
    min: 2,
    max: 5,
  }),
  Schema.pattern(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  Schema.brand("LanguageId"),
)

export type LanguageId = typeof LanguageIdSchema.Type

export const GenericSlugSchema = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.trimmed(),
  Schema.lowercased(),
)

export const OptionalDateSchema = Schema.optionalWith(
  Schema.DateFromString,
  {
    as: undefined,
  },
)
