import type { Element } from "expressive-code/hast"
import { useEffect, useState } from "react"
import { ExpressiveCodeEngine } from "rehype-expressive-code"
import { hastToJsx } from "@/utils/hast"

const engine = new ExpressiveCodeEngine({})

export function CodeBlock({ language, code }: { language: string, code: string }) {
  const [ast, setAst] = useState<null | Element>(null)

  useEffect(() => {
    const update = async () => {
      const obj = await engine.render({
        code,
        language,
        props: {
          frame: "code",
        },
      })
      setAst(obj.renderedGroupAst)
    }
    update()
  }, [language, code])

  if (!ast) {
    return null
  }

  return (
    <>
      {hastToJsx(ast)}
    </>
  )
}
