import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { Option, Schema } from "effect"
import { getProfileInternal, ProfileSchema, ProfileSpec } from "./profile"

const getProfileFn = createServerFn({ method: "GET" })
  .validator(Schema.decodeUnknownSync(ProfileSpec))
  .handler(({ data }) => getProfileInternal(data).then(
    Option.getOrThrowWith(() => notFound()),
  ),
  )

/**
 * To minimize bundles sent to the client (avoid Markdown conversion on the
 * client), generate hast on the server side.
 */
export function getProfile(data: typeof ProfileSpec.Encoded): Promise<typeof ProfileSchema.Type> {
  return getProfileFn({ data }).then(Schema.decodeUnknownSync(ProfileSchema))
}
