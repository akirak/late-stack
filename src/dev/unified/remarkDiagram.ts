import type GithubSlugger from "github-slugger"
import type { Loc } from "../error"
import { Effect, Runtime } from "effect"
import { visit } from "unist-util-visit"
import { D2 } from "../commands/d2"
import { RemarkPluginDataError } from "../error"

export interface RemarkDiagramOptions {
  runtime?: Runtime.Runtime<D2>
  slugger: GithubSlugger
}

function setDiagramSvg(node: any, { className, id, title, svg, codeLanguage, code }: { className?: string, id: string, title?: string, svg: string, codeLanguage: string, code: string }) {
  const data = node.data || (node.data = {})
  data.hName = "diagram"
  data.hProperties = {
    ...data.hProperties,
    id,
    title,
    className,
    code,
    codeLanguage,
    __html: svg,
  }
  data.hChildren = []
}

function remarkDiagram(options: RemarkDiagramOptions) {
  const { runtime, slugger } = options

  return async (tree: any) => {
    const contexts: Array<{ className?: string, id: string, title?: string, node: any, lang: string, code: string, loc: Loc }> = []

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
        const title = node.attributes?.title
        const id = `diagram-${slugger.slug(title || "untitled")}`
        // TODO: Validate class names against a schema
        const class_ = node.attributes?.class
        const className = class_
          ? class_.split(" ").map((c: string) =>
              `diagram-${c.trim()}`,
            ).join(" ")
          : undefined

        // Validate the diagram source
        switch (lang) {
          case "d2":
            contexts.push({
              className,
              node,
              lang,
              code,
              loc,
              title,
              id,
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
                D2.pipe(
                  Effect.andThen(service =>
                    service.renderSvg(context.code, { noXMLTag: true }),
                  ),
                  Effect.scoped,
                ),
              )
              setDiagramSvg(context.node, {
                svg,
                className: context.className,
                codeLanguage: context.lang,
                code: context.code,
                title: context.title,
                id: context.id,
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
