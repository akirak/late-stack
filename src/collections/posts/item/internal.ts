import type { PostSpec } from "./types"
import type { PostSchema } from "@/schemas/post"
import path from "node:path"
import { readJsonDataFile, readJsonDataFileSync } from "@/utils/data"

export const PostDir = "posts"

export function getPostInternal({ slug, lang }: typeof PostSpec.Type) {
  return readJsonDataFile<typeof PostSchema.Encoded>(
    path.join(PostDir, `${slug}.${lang}.json`),
  )
}

export function getPostInternalSync({ slug, lang }: typeof PostSpec.Type) {
  return readJsonDataFileSync<typeof PostSchema.Encoded>(
    path.join(PostDir, `${slug}.${lang}.json`),
  )
}
