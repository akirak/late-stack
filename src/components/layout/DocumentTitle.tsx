import { useRouterState } from "@tanstack/react-router"
import { Array, pipe } from "effect"

export function DocumentTitle({ title }: { title: string }) {
  const matches = useRouterState({ select: s => s.matches })

  const suffix = pipe(
    [...matches].filter(d => d.context.titleSuffix),
    Array.map(d => d.context.titleSuffix),
    Array.dedupeAdjacent,
    Array.join(""),
  )

  return (
    <title>
      {`${title}${suffix}`}
    </title>
  )
}
