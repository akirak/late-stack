import { Match, Schema } from "effect"
import { visit } from "unist-util-visit"
import { ExternalUrlParser } from "../../schemas/external-url"

const makeLinkBlock = Match.type<typeof ExternalUrlParser.Type>().pipe(
  Match.tag("app/YoutubeVideoSource", source => (node: any) => {
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
  Match.tag("app/GenericExternalSource", source => (node: any) => {
    const data = node.data || (node.data = {})
    data.hName = "div"
    data.hProperties = {
      ...data.hProperties,
    }

    node.children.unshift({
      type: "link",
      data: {
        hName: "a",
        hProperties: {
          href: source.url,
        },
      },
    })
  }),
  Match.exhaustive,
)

function remarkLink() {
  return (tree: any) => {
    visit(tree, (node) => {
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

        switch (node.type) {
          case "textDirective": {
            const data = node.data || (node.data = {})
            data.hName = "a"
            data.hProperties = {
              ...data.hProperties,
              href,
            }
            break
          }
          case "leafDirective": {
            makeLinkBlock(source)(node)
            break
          }
          case "containerDirective": {
            console.error("Unimplemented containerDirective")
            break
          }
        }
      }
    })
  }
}

export default remarkLink
