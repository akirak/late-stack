import { Schema } from "effect"
import { LanguageIdSchema } from "./common"

export const SocialSiteSchema = Schema.Literal(
  "github",
  "bluesky",
)

export type SocialSiteId = typeof SocialSiteSchema.Type

export const SocialLinkSchema = Schema.Struct({
  // My login ID on the site
  login: Schema.String,
  // Profile URL
  url: Schema.String,
  // Web site or service I use. Used for generate an icon
  site: SocialSiteSchema,
  // Primary language I use on the site
  language: Schema.optional(LanguageIdSchema),
})

export type SocialLink = typeof SocialLinkSchema.Type

export const WhoIAmNotSiteSchema = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  icon: Schema.optional(SocialSiteSchema),
  accounts: Schema.Array(Schema.String),
})

export type WhoIAmNotSite = typeof WhoIAmNotSiteSchema.Type
