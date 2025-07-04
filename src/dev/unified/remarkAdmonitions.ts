import type GithubSlugger from "github-slugger"
import { visit } from "unist-util-visit"

export interface RemarkAdmonitionsOptions {
  slugger: GithubSlugger
}

/**
 * Default icon mapping for each admonition type.
 */
const iconMap: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
}

function remarkAdmonitions({ slugger }: RemarkAdmonitionsOptions) {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective"
      ) {
        if (!/^(?:info|warning|error)$/.test(node.name))
          return

        const titleElement = node.children[0]
        const hasTitle = titleElement.data?.directiveLabel
        const title = hasTitle && titleElement.children[0].value
        const content = hasTitle ? node.children.slice(1) : node.children

        const id = `admonition-${slugger.slug(title || node.name)}`

        const data = node.data || (node.data = {})
        data.hName = "div"
        const className = `admonition admonition-${node.name}`
        data.hProperties = {
          ...data.hProperties,
          "role": "note",
          className,
          "aria-labelledby": id,
        }

        // Add admonition header with icon
        const titleText = title || node.name.charAt(0).toUpperCase() + node.name.slice(1)

        const headerNode = {
          type: "paragraph",
          data: {
            hName: "div",
            hProperties: {
              className: "admonition-header",
              id,
            },
          },
          children: [
            {
              type: "emphasis",
              data: {
                hName: "span",
                hProperties: {
                  "className": "admonition-icon",
                  "aria-hidden": true,
                },
              },
              children: [
                { type: "text", value: iconMap[node.name] },
              ],
            },
            {
              type: "text",
              value: titleText,
            },
          ],
        }

        // Wrap existing content in admonition-content div
        const contentWrapper = {
          type: "paragraph",
          data: {
            hName: "div",
            hProperties: {
              className: "admonition-content",
            },
          },
          children: content,
        }

        // Replace children with header and wrapped content
        node.children = [headerNode, contentWrapper]
      }
    })
  }
}

export default remarkAdmonitions
