import type { PostListSpec, PostMetadata } from "./types"
import { Schema } from "effect"
import { PostMetadataSchema } from "@/schemas/post"
import { getPostListInternal } from "./internal"

export function getPostListAsync(data: typeof PostListSpec.Type): Promise<readonly PostMetadata[]> {
  return getPostListInternal(data).then(Schema.decodeUnknownSync(Schema.Array(PostMetadataSchema)))
}
