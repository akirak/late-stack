import type { AboutCollectionApi, LocalProfile } from "@/schemas/about"
import type { LangId } from "@/schemas/common"
import { Option } from "effect"

const defaultFullName = "Akira Komamura"

function getLocalProfile(lang: LangId) {
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

export const about: AboutCollectionApi = {
  getLocalProfile,
}
