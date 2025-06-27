import type { Element } from "expressive-code/hast"
import { useEffect, useState } from "react"
import { ExpressiveCodeEngine } from "rehype-expressive-code"
import * as EC from "@/styles/expressive-code"
import { hastToJsx } from "@/utils/hast"

export function CodeBlock({ language, code }: { language: string, code: string }) {
  const [ast, setAst] = useState<null | Element>(null)

  useEffect(() => {
    const update = async () => {
      const config = await EC.loadConfig()
      const engine = new ExpressiveCodeEngine(config)
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
