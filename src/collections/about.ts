import type { LocalProfile, SocialLink } from "@/schemas/about"
import type { LanguageId } from "@/schemas/common"
import { Option } from "effect"

const defaultFullName = "Akira Komamura"

export type SocialLink = typeof SocialLink.Type

export type LocalProfile = typeof LocalProfile.Type

export function getLocalProfile(lang: LanguageId): Option.Option<LocalProfile> {
  switch (lang) {
    case "en": {
      return Option.some({
        fullName: defaultFullName,
        socialLinks: [],
      })
    }

    case "ja": {
      return Option.some({
        fullName: defaultFullName,
        socialLinks: [],
      })
    }

    default: {
      return Option.none() as Option.Option<LocalProfile>
    }
  }
}
