import { Schema } from "effect"

export const IconTypeSchema = Schema.Literal("lucid")

export const IconSchema = Schema.Struct({
  type: IconTypeSchema,
  id: Schema.String,
})

export const SocialLinkSchema = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  iconIds: Schema.String,
})

export const LocalProfileSchema = Schema.Struct({
  fullName: Schema.String,
  socialLinks: Schema.Array(SocialLinkSchema),
})
