import type { Loc } from "../error"
import { D2 } from "@terrastruct/d2"
import { visit } from "unist-util-visit"
import { RemarkPluginDataError } from "../error"

interface Source {
  content: string
  loc?: Loc
}

function remarkDiagram() {
  return async (tree: any) => {
    const d2Sources: Array<Source> = []

    visit(tree, (node) => {
      if (node.name === "diagram" && node.type === "containerDirective") {
        const child = node.children && node.children.find((child: any) => child.type === "code")

        if (!child) {
          throw new RemarkPluginDataError({
            plugin: "diagram",
            message: "Diagram directive must contain a code block as its child",
          })
        }

        const data = node.data || (node.data = {})
        const lang = child.lang
        const content = child.value.trim()
        const loc = child.position.start

        // Validate the diagram source
        switch (lang) {
          case "d2":
            d2Sources.push({
              content,
              loc,
            })
            break
          default:
            throw new RemarkPluginDataError({
              plugin: "diagram",
              message: `Unsupported diagram type: ${lang}`,
            })
        }

        // Transform the node to a custom diagram element
        data.hName = "diagram"
        data.hProperties = {
          lang,
          source: content,
          ...node.attributes,
        }

        // Remove children since we've extracted the source
        node.children = []
      }
    })

    if (d2Sources.length > 0) {
      const d2 = new D2()
      for (const source of d2Sources) {
        try {
          await d2.compile(source.content)
        }
        catch (error) {
          throw new RemarkPluginDataError({
            loc: source.loc,
            plugin: "diagram",
            message: `Failed to compile D2 diagram: ${
              error instanceof Error ? error.message : String(error)
            }`,
          })
        }
      }
    }
  }
}

export default remarkDiagram
