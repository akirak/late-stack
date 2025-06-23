import type { Element } from "expressive-code/hast"
import { useEffect, useState } from "react"
import { ExpressiveCodeEngine } from "rehype-expressive-code"
import { hastToJsx } from "@/utils/hast"

const engine = new ExpressiveCodeEngine({
  defaultProps: {
  },
})

export function CodeBlock({ lang, source }: { lang: string, source: string }) {
  const [ast, setAst] = useState<null | Element>(null)

  useEffect(() => {
    const update = async () => {
      const obj = await engine.render({
        code: source,
        language: lang,
        props: {
          frame: "code",
        },
      })
      setAst(obj.renderedGroupAst)
    }
    update()
  }, [lang, source])

  if (!ast) {
    return null
  }

  return (
    <>
      {hastToJsx(ast)}
    </>
  )
}
