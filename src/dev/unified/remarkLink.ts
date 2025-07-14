import type { Array } from "effect"
import type GithubSlugger from "github-slugger"
import { Effect, Match, Option, Runtime, Schema } from "effect"
import { visit } from "unist-util-visit"
import { ExternalUrlParser } from "../../schemas/external-url"
import { LinkMetadata, Oembed } from "../../schemas/link-metadata"
import { LinkMetadataService } from "../link-metadata/layer"
import { OembedService } from "../oembed/layer"

interface Options {
  headingLevel: number
  id?: string
}

const makeLinkBlock = Match.type<typeof ExternalUrlParser.Type>().pipe(
  Match.tag("app/YoutubeVideoSource", source => (node: any, _options?: Options, metadata?: LinkMetadata | Oembed) => {
    if (metadata instanceof Oembed) {
      metadata = undefined
    }

    const data = node.data || (node.data = {})
    data.hName = "div"
    data.hProperties = {
      ...data.hProperties,
      className: "youtube-embed",
      style: "position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;",
    }

    // Replace the node with an iframe
    node.children.unshift({
      type: "paragraph",
      data: {
        hName: "iframe",
        hProperties: {
          src: source.embedUrl,
          title: metadata?.title,
          width: "560",
          height: "315",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: true,
          style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
        },
      },
    })
  }),
  Match.tag("app/TwitterTweetSource", _source => (node: any, options?: Options, oembed?: LinkMetadata | Oembed) => {
    if (oembed instanceof LinkMetadata) {
      oembed = undefined
    }

    // Replace the node with an OembedFrame component
    if (oembed?.html) {
      const data = node.data || (node.data = {})
      data.hName = "oembed-frame"
      data.hProperties = {
        ...data.hProperties,
        id: options?.id,
        className: "twitter-embed",
        title: oembed.title || `Tweet by ${oembed.author_name}`,
        html: oembed.html,
        width: oembed.width,
        height: oembed.height,
        sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
      }

      // Clear children since the component will handle rendering
      node.children = []
    }
  }),
  Match.tag("app/GenericExternalSource", source => (node: any, options?: Options, metadata?: LinkMetadata | Oembed) => {
    if (metadata instanceof Oembed) {
      metadata = undefined
    }

    const url = metadata?.canonical || source.url

    const data = node.data || (node.data = {})
    data.hName = "div"
    data.hProperties = {
      className: "link-card-container",
    }
    node.children = [{
      type: "paragraph",
      data: {
        hName: "link-card",
        hProperties: {
          url,
          headingLevel: options?.headingLevel || 3,
          ...(metadata ?? {}),
        },
      },
    }]
  }),
  Match.exhaustive,
)

export interface RemarkLinkOptions {
  runtime?: Runtime.Runtime<LinkMetadataService | OembedService>
  slugger: GithubSlugger
}

// Heading level
let parentDepth = 1

function remarkLink(options?: RemarkLinkOptions) {
  const { runtime } = options || {}

  return async (tree: any) => {
    // Collect all link directives that need OGP metadata
    const linkNodes: Array<{ node: any, headingLevel: number, source: typeof ExternalUrlParser.Type }> = []

    visit(tree, (node, index, parent) => {
      // Track the depth of the current heading to set the heading level
      // correctly
      if (node.type === "heading") {
        // Reset parent depth for headings
        parentDepth = node.depth
        return
      }

      if (node.type === "definition") {
        const url = node.url
        if (!url)
          return

        try {
          const source = Schema.decodeSync(ExternalUrlParser)(url)

          if (parent && typeof index === "number") {
            const linkBlockNode = {
              type: "containerDirective",
              name: "link",
              attributes: { href: source.metadataUrl },
              children: [],
              data: {},
            }

            parent.children.splice(index + 1, 0, linkBlockNode)
            linkNodes.push({ node: linkBlockNode, headingLevel: parentDepth + 1, source })
          }
        }
        catch (e) {
          // Not a valid external URL, skip
          console.error(`Error while parsing the definition link to ${url}`, e)
        }
        return
      }

      if (
        node.type === "containerDirective"
        || node.type === "leafDirective"
        || node.type === "textDirective"
      ) {
        if (node.name !== "link")
          return null

        // The node can contain a link element as the first child, which has a
        // url.
        const href = node.attributes?.href ?? node.label ?? node.children[0]?.url

        if (!href)
          return

        const source = Schema.decodeSync(ExternalUrlParser)(href)

        // Store node info for OGP fetching (only for block-level directives)
        if ((node.type === "leafDirective" || node.type === "containerDirective")
          && runtime) {
          linkNodes.push({ node, headingLevel: parentDepth + 1, source })
        }

        switch (node.type) {
          case "textDirective": {
            const data = node.data || (node.data = {})
            data.hName = "a"
            data.hProperties = {
              ...data.hProperties,
              href,
              target: "_blank",
              rel: "noopener noreferrer",
            }
            break
          }
          case "leafDirective": {
            if (!runtime) {
              makeLinkBlock(source)(node, { headingLevel: parentDepth + 1 })
            }
            break
          }
          case "containerDirective": {
            if (!runtime) {
              makeLinkBlock(source)(node, { headingLevel: parentDepth + 1 })
            }
            break
          }
        }
      }
    })

    // Fetch OGP metadata for all collected links
    if (runtime && linkNodes.length > 0) {
      const effects = linkNodes.map(({ source }) => Match.value(source).pipe(
        Match.tag("app/TwitterTweetSource", source => OembedService.pipe(
          Effect.andThen(
            service =>
              service.get(source.oembedUrl).pipe(
                Effect.map(result => [source.metadataUrl, result] as [string, Option.Option<Oembed> | Option.Option<LinkMetadata>]),
              ),
          ),
        )),
        Match.orElse(source => LinkMetadataService.pipe(
          Effect.andThen(
            service =>
              service.get(source.metadataUrl).pipe(
                Effect.map(result => [source.metadataUrl, result] as [string, Option.Option<Oembed> | Option.Option<LinkMetadata>]),
              ),
          ),
        )),
      ))

      const results = await Runtime.runPromise(runtime)(
        Effect.all(effects, { concurrency: 5 }),
      )

      // Create separate maps for different metadata types
      const metadataMap = new Map(
        results.map(([url, result]: [string, Option.Option<Oembed> | Option.Option<LinkMetadata>]) =>
          [url, Option.getOrUndefined(result as Option.Option<any>)] as [string, LinkMetadata | Oembed | undefined],
        ),
      )

      // Apply metadata to nodes
      linkNodes.forEach(({ node, headingLevel, source }) => {
        const metadata = metadataMap.get(source.metadataUrl)
        const id = (options?.slugger && source._tag === "app/TwitterTweetSource") ? options.slugger.slug(`tweet-${source.id}`) : undefined
        makeLinkBlock(source)(node, { id, headingLevel }, metadata)
      })
    }
  }
}

export default remarkLink
