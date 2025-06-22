import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { Option, Schema } from "effect"
import { PostSchema } from "@/schemas/post"
import { getPostInternal } from "./internal"
import { PostSpec } from "./types"

const getPostFn = createServerFn({ method: "GET" })
  .validator(Schema.decodeUnknownSync(PostSpec))
  .handler(({ data }) =>
    getPostInternal(data).then(Option.getOrThrowWith(() => notFound()),
    ))

export function getPost(data: typeof PostSpec.Encoded) {
  return getPostFn({ data }).then(Schema.decodeUnknownSync(PostSchema))
}
