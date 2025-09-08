import type { Option } from "effect"
import type { LanguageId } from "@/schemas/common"
import { Array, pipe, Schema } from "effect"
import { LanguagePropertiesSchema } from "@/schemas/common"

type LanguageProperties = typeof LanguagePropertiesSchema.Type

const UsedLanguages: readonly LanguageProperties[]
  = Schema.decodeUnknownSync(Schema.Array(LanguagePropertiesSchema))([
    {
      id: "en",
      englishName: "English",
    },
    {
      id: "ja",
      localName: "日本語",
      englishName: "Japanese",
    },
  ])

export function getLanguageById(id: LanguageId): Option.Option<LanguageProperties> {
  return pipe(
    UsedLanguages,
    Array.findFirst(language => language.id === id),
  )
}

export function getAvailableLanguages() {
  return UsedLanguages
}
