function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function DateFormat({ date }: { date?: Date | null }) {
  if (!date) {
    return null
  }

  return (
    <time dateTime={date.toISOString()}>
      {formatDate(date)}
    </time>
  )
}
