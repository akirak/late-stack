import type { PostSpec } from "./types"
import { pipe, Schema } from "effect"
import { PostSchema } from "@/schemas/post"
import { getPostInternalSync } from "./internal"

export function getPostSync(data: typeof PostSpec.Type) {
  return pipe(
    getPostInternalSync(data),
    Schema.decodeUnknownSync(PostSchema),
  )
}
