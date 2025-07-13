import { visit } from "unist-util-visit"

/**
 * A remark plugin that adds target="_blank" and rel="noopener noreferrer" to
 * links.
 */
function remarkLinkAttributes() {
  return (tree: any) => {
    visit(tree, "link", (node) => {
      if (node.url) {
        const data = node.data || (node.data = {})
        const hProperties = data.hProperties || (data.hProperties = {})

        hProperties.target = "_blank"
        hProperties.rel = "noopener noreferrer"
      }
    })
  }
}

export default remarkLinkAttributes
