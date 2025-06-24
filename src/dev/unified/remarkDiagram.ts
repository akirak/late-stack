import type { Loc } from "../error"
import { Effect, Runtime } from "effect"
import { visit } from "unist-util-visit"
import { D2Service } from "../d2/layer"
import { RemarkPluginDataError } from "../error"

export interface RemarkDiagramOptions {
  runtime?: Runtime.Runtime<D2Service>
}

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

function remarkDiagram(options?: RemarkDiagramOptions) {
  const { runtime } = options || {}

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

    if (contexts.length > 0 && runtime) {
      for (const context of contexts) {
        try {
          switch (context.lang) {
            case "d2": {
              const svg = await Runtime.runPromise(runtime)(
                D2Service.pipe(
                  Effect.andThen(service =>
                    service.render(context.code, { noXMLTag: true }),
                  ),
                  Effect.scoped,
                ),
              )
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
    else if (contexts.length > 0 && !runtime) {
      throw new RemarkPluginDataError({
        plugin: "diagram",
        message: "D2 runtime not provided but diagrams found",
      })
    }
  }
}

export default remarkDiagram
