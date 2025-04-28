import type { JsxElement } from "node_modules/hast-util-to-jsx-runtime/lib/types"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"

export function hastToJsx(hastTree: any): JsxElement {
  return toJsxRuntime(hastTree, { Fragment, jsxs, jsx })
}
