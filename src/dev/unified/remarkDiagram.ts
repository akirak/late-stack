import type { Loc } from "../error"
import { D2 } from "@terrastruct/d2"
import { visit } from "unist-util-visit"
import { RemarkPluginDataError } from "../error"

function setDiagramSvg(node: any, { svg, codeLanguage, code }: { svg: string, codeLanguage: string, code: string }) {
  const data = node.data || (node.data = {})
  data.hName = "diagram"
  data.hProperties = {
    code,
    codeLanguage,
    __html: svg,
    ...data.hProperties,
  }
  data.hChildren = []
}

function remarkDiagram() {
  return async (tree: any) => {
    const contexts: Array<{ node: any, lang: string, code: string, loc: Loc }> = []

    visit(tree, (node) => {
      if (node.name === "diagram" && node.type === "containerDirective") {
        const child = node.children && node.children.find((child: any) => child.type === "code")

        if (!child) {
          throw new RemarkPluginDataError({
            plugin: "diagram",
            message: "Diagram directive must contain a code block as its child",
          })
        }

        const lang = child.lang
        const code = child.value.trim()
        const loc = child.position.start

        // Validate the diagram source
        switch (lang) {
          case "d2":
            contexts.push({
              node,
              lang,
              code,
              loc,
            })
            break
          default:
            throw new RemarkPluginDataError({
              plugin: "diagram",
              message: `Unsupported diagram type: ${lang}`,
            })
        }
      }
    })

    if (contexts.length > 0) {
      const d2 = new D2()
      for (const context of contexts) {
        try {
          switch (context.lang) {
            case "d2": {
              const result = await d2.compile(context.code)
              const svg = await d2.render(result.diagram, {
                ...result.renderOptions,
                noXMLTag: true,
              })
              setDiagramSvg(context.node, {
                svg,
                codeLanguage: context.lang,
                code: context.code,
              })
              break
            }
          }
        }
        catch (error) {
          throw new RemarkPluginDataError({
            loc: context.loc,
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
