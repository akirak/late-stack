import { Schema } from "effect"

export const LangId = Schema.String.pipe(Schema.brand("LangId"))

export type LangId = typeof LangId.Type
