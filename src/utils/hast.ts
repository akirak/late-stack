import type { JsxElement } from "node_modules/hast-util-to-jsx-runtime/lib/types"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { Diagram } from "@/components/block/Diagram"
import { LinkCard } from "@/components/block/LinkCard"
import LiteYouTube from "@/components/block/LiteYouTube"
import OembedFrame from "@/components/block/OembedFrame"

export function hastToJsx(hastTree: any): JsxElement {
  return toJsxRuntime(hastTree, {
    Fragment,
    jsxs,
    jsx,
    components: {
      "diagram": Diagram,
      "link-card": LinkCard,
      "lite-youtube": LiteYouTube,
      "oembed-frame": OembedFrame,
    },
  })
}

// Simple HAST to HTML converter for RSS feeds
export function hastToHtml(node: any): string {
  if (!node)
    return ""

  if (typeof node === "string") {
    return node
  }

  if (node.type === "text") {
    return node.value || ""
  }

  if (node.type === "element") {
    const tagName = node.tagName
    const props = node.properties || {}
    const children = node.children || []

    // Convert properties to attributes
    const attrs = Object.entries(props)
      .map(([key, value]) => {
        if (key === "className") {
          return `class="${Array.isArray(value) ? value.join(" ") : value}"`
        }
        if (typeof value === "boolean" && value) {
          return key
        }
        if (typeof value === "string" || typeof value === "number") {
          return `${key}="${value}"`
        }
        return ""
      })
      .filter(Boolean)
      .join(" ")

    const attrsStr = attrs ? ` ${attrs}` : ""
    const innerHTML = children.map(hastToHtml).join("")

    // Self-closing tags
    if (["img", "br", "hr", "input", "meta", "link"].includes(tagName)) {
      return `<${tagName}${attrsStr} />`
    }

    return `<${tagName}${attrsStr}>${innerHTML}</${tagName}>`
  }

  if (node.type === "root") {
    const children = node.children || []
    return children.map(hastToHtml).join("")
  }

  return ""
}

export function hastShallowHeadings(hastTree: any): { id?: string, text: string, level: number }[] {
  if (!hastTree || !hastTree.children) {
    return []
  }

  // Filter out non-heading elements
  return hastTree.children.map((node: any) => {
    if (node.type === "element") {
      const match = /^h([1-6])$/.exec(node.tagName)
      if (!match) {
        return null
      }
      return {
        id: node.properties.id,
        text: node.children.filter(
          (child: any) => child.type === "text",
        ).map(
          (child: any) => child.value,
        ).join(""),
        level: Number.parseInt(match[1], 10),
      }
    }
  }).filter((o: any) => !!o)
}
