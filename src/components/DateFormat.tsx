import { Option, pipe } from "effect"

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function DateFormat({ date }: { date: Option.Option<Date> }) {
  const dateString = pipe(
    date,
    Option.map(formatDate),
    Option.getOrUndefined,
  )

  return (
    <span>
      {dateString}
    </span>
  )
}
