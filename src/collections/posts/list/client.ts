import type { PostMetadata } from "./types"
import { createServerFn } from "@tanstack/react-start"
import { Schema } from "effect"
import { PostMetadataSchema } from "@/schemas/post"
import { getPostListInternal } from "./internal"
import { PostListSpec } from "./types"

const getPostListFn = createServerFn({ method: "GET" })
  .validator(Schema.decodeUnknownSync(PostListSpec))
  .handler(({ data }) => getPostListInternal(data))

export function getPostList(data: typeof PostListSpec.Encoded): Promise<readonly PostMetadata[]> {
  return getPostListFn({ data }).then(Schema.decodeUnknownSync(Schema.Array(PostMetadataSchema)))
}
