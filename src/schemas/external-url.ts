import { Schema } from "effect"
import { ParseResult } from "effect"

export class YoutubeVideoSource extends Schema.TaggedClass<YoutubeVideoSource>()("app/YoutubeVideoSource", {
  id: Schema.String,
}) {
  get embedUrl() {
    return `https://www.youtube.com/embed/${this.id}`
  }

  get videoUrl() {
    return `https://www.youtube.com/v/${this.id}`
  }
}

export class GenericExternalSource extends Schema.TaggedClass<GenericExternalSource>()("app/GenericExternalSource", {
  url: Schema.String,
}) { }

const YoutubeVideoUrlParser = Schema.transformOrFail(
  Schema.String,
  YoutubeVideoSource,
  {
    strict: true,
    decode: (url, _, ast) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          const id = match[1]
          return ParseResult.succeed(new YoutubeVideoSource({
            id,
          }))
        }
      }

      return ParseResult.fail(
        new ParseResult.Type(
          ast,
          url,
          "Invalid YouTube URL format",
        ),
      )
    },
    encode: (input, _options, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          input,
          "Cannot convert back to a string",
        ),
      ),
  },
)

const GenericExternalUrlParser = Schema.transformOrFail(
  Schema.String,
  GenericExternalSource,
  {
    strict: true,
    decode: url => ParseResult.succeed(new GenericExternalSource({
      url,
    })),
    encode: (input, _options, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          input,
          "Cannot convert back to a string",
        ),
      ),
  },
)

export const ExternalUrlParser = Schema.Union(
  YoutubeVideoUrlParser,
  GenericExternalUrlParser,
)
