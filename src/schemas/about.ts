import type { LangId } from "@/schemas/common"
import type { Option } from "effect"
import { Schema } from "effect"

export const IconType = Schema.Literal("lucid")

export const Icon = Schema.Struct({
  type: IconType,
  id: Schema.String,
})

export const SocialLink = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  iconIds: Schema.String,
})

export type SocialLink = typeof SocialLink.Type

export const LocalProfile = Schema.Struct({
  fullName: Schema.String,
  socialLinks: Schema.Array(SocialLink),
})

export type LocalProfile = typeof LocalProfile.Type

export interface AboutCollectionApi {
  getLocalProfile: (lang: LangId) => Option.Option<LocalProfile>
}
