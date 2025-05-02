import { Schema } from "effect"

const DefaultLimit = 30

export const PaginationSchema = Schema.Struct({
  offset: Schema.optionalWith(
    Schema.Number,
    {
      default: () => 0,
    },
  ),
  limit: Schema.optionalWith(
    Schema.Number,
    {
      default: () => DefaultLimit,
    },
  ),
})

export type Pagination = typeof PaginationSchema.Type

export type PaginationEncoded = typeof PaginationSchema.Encoded

export const DefaultPagination = Schema.decodeUnknownSync(PaginationSchema)({})
