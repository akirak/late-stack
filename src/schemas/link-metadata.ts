import { Option, ParseResult, pipe, Schema } from "effect"

export const OgType = Schema.String.pipe(
  Schema.pattern(
    // Reject malicious inputs
    /^[a-z][\w-]{0,49}(?:\.[a-z][\w-]{0,49}){0,4}$/i,
  ),
)

/**
 * Schema for Open Graph Protocol (OGP) metadata.
 *
 * Only relevant fields are defined.
 */
export class LinkMetadata extends Schema.TaggedClass<LinkMetadata>()("app/LinkMetadata", {
  canonical: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  image: Schema.optional(Schema.String),
  imageAlt: Schema.optional(Schema.String),
  imageWidth: Schema.optional(Schema.Int),
  imageHeight: Schema.optional(Schema.Int),
  siteName: Schema.optional(Schema.String),
  ogType: Schema.optional(OgType),
}) {}

export const LinkMetadataSchema = Schema.asSchema(LinkMetadata)

export const RawHtmlMetadata = Schema.Record({
  key: Schema.String,
  value: Schema.String,
})

/**
 * Parsing metadata from HTML meta tags.
 *
 * See <https://web-toolbox.dev/en/tools/ogp-checker>
 */
export const OgpMetadataFromHtml = Schema.transformOrFail(
  RawHtmlMetadata,
  LinkMetadataSchema,
  {
    strict: true,
    decode: (record, _, ast) => {
      try {
        const imageWidth = pipe(
          Option.fromNullable(record["og:image:width"]),
          Option.map(Schema.decodeUnknownSync(Schema.NumberFromString)),
          Option.getOrUndefined,
        )
        const imageHeight = pipe(
          Option.fromNullable(record["og:image:height"]),
          Option.map(Schema.decodeUnknownSync(Schema.NumberFromString)),
          Option.getOrUndefined,
        )
        const canonical = pipe(
          Option.fromNullable(record["og:url"] || record["twitter:url"] || record.canonical),
          Option.map(Schema.decodeUnknownSync(Schema.URL)),
          Option.map(url => url.toString()),
          Option.getOrUndefined,
        )
        const image = pipe(
          Option.fromNullable(record["og:image"] || record["twitter:image"]),
          Option.map(Schema.decodeUnknownSync(Schema.URL)),
          Option.map(url => url.toString()),
          Option.getOrUndefined,
        )
        const ogType = pipe(
          Option.fromNullable(record["og:type"]),
          Option.map(Schema.decodeUnknownSync(OgType)),
          Option.getOrUndefined,
        )

        return ParseResult.succeed(new LinkMetadata({
          canonical,
          title: record["og:title"] || record["twitter:title"] || record.title,
          siteName: record["og:site_name"],
          description: record["og:description"] || record["twitter:description"] || record.description,
          image,
          imageAlt: record["og:image:alt"],
          imageWidth,
          imageHeight,
          ogType,
        }))
      }
      catch (error) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            record,
            `Failed to decode OGP metadata from HTML: ${error instanceof Error ? error.message : String(error)}`,
          ),
        )
      }
    },
    encode: (meta, _options, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          meta,
          "Cannot convert back to JSON",
        ),
      ),
  },
)

/**
 * Schema for oembed API response.
 *
 * @see https://oembed.com/
 */
export class Oembed extends Schema.TaggedClass<Oembed>()("app/Oembed", {
  url: Schema.String,
  author_name: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  author_url: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  html: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  width: Schema.optionalWith(Schema.Number, {
    nullable: true,
  }),
  height: Schema.optionalWith(Schema.Number, {
    nullable: true,
  }),
  type: Schema.String,
  cache_age: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  provider_name: Schema.String,
  provider_url: Schema.String,
  version: Schema.String,
  title: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  thumbnail_url: Schema.optionalWith(Schema.String, {
    nullable: true,
  }),
  thumbnail_width: Schema.optionalWith(Schema.Number, {
    nullable: true,
  }),
  thumbnail_height: Schema.optionalWith(Schema.Number, {
    nullable: true,
  }),
}) {}

export const OembedSchema = Schema.asSchema(Oembed)
