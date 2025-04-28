import { Schema } from "effect"

export const Category = Schema.Struct({
  id: Schema.String,
  slug: Schema.String,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  featuredImage: Schema.optional(Schema.String),
})

export type Category = typeof Category.Type

export interface CategoryApi {

}
