import { visit } from "unist-util-visit"

function remarkAdmonitions() {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective"
        || node.type === "leafDirective"
        || node.type === "textDirective"
      ) {
        if (!/^(?:tip|info|warning|error)$/.test(node.name))
          return

        const data = node.data || (node.data = {})
        data.hName = "div"
        const className = `admonition admonition-${node.name}`
        data.hProperties = {
          ...data.hProperties,
          className,
        }

        // Add admonition title
        if (node.type === "containerDirective") {
          const titleText = node.attributes?.title || node.name.charAt(0).toUpperCase() + node.name.slice(1)
          const titleNode = {
            type: "paragraph",
            data: {
              hName: "div",
              hProperties: { className: "admonition-title" },
            },
            children: [
              {
                type: "text",
                value: titleText,
              },
            ],
          }
          node.children.unshift(titleNode)
        }
      }
    })
  }
}

export default remarkAdmonitions
