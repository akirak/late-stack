import { Option, pipe } from "effect"

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function DateFormat({ date }: { date: Option.Option<Date> }) {
  const value = pipe(
    date,
    Option.getOrUndefined,
  )

  if (!value)
    return null

  return (
    <time dateTime={value.toISOString()}>
      {formatDate(value)}
    </time>
  )
}
