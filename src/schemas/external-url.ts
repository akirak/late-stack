import { ParseResult, Schema } from "effect"

export class TwitterTweetSource extends Schema.TaggedClass<TwitterTweetSource>()("app/TwitterTweetSource", {
  tweetUrl: Schema.String,
}) {
  get id() {
    const match = this.tweetUrl.match(/\/status\/(\d+)/)
    return match ? match[1] : null
  }

  get oembedUrl() {
    return `https://publish.twitter.com/oembed?url=${encodeURIComponent(this.tweetUrl)}`
  }

  get metadataUrl() {
    return this.tweetUrl
  }
}

export class YoutubeVideoSource extends Schema.TaggedClass<YoutubeVideoSource>()("app/YoutubeVideoSource", {
  id: Schema.String,
}) {
  get embedUrl() {
    return `https://www.youtube.com/embed/${this.id}`
  }

  get videoUrl() {
    return `https://www.youtube.com/watch?v=${this.id}`
  }

  get metadataUrl() {
    return `https://www.youtube.com/watch?v=${this.id}`
  }
}

export class GenericExternalSource extends Schema.TaggedClass<GenericExternalSource>()("app/GenericExternalSource", {
  url: Schema.String,
}) {
  get metadataUrl() {
    return this.url
  }
}

const TweetUrlParser = Schema.transformOrFail(
  Schema.String,
  TwitterTweetSource,
  {
    strict: true,
    decode: (url, _, ast) => {
      const pattern = /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/

      const match = url.match(pattern)
      if (match && match[1] && match[2]) {
        const tweetUrl = `https://twitter.com/${match[1]}/status/${match[2]}`
        return ParseResult.succeed(new TwitterTweetSource({
          tweetUrl,
        }))
      }

      return ParseResult.fail(
        new ParseResult.Type(
          ast,
          url,
          "Invalid Tweet URL format",
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

// All subtypes should have a field named `metadataUrl` which is used to fetch
// OGP metadata
export const ExternalUrlParser = Schema.Union(
  TweetUrlParser,
  YoutubeVideoUrlParser,
  GenericExternalUrlParser,
)
