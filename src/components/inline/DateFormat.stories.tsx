import type { Story } from "@ladle/react"
import { DateFormat } from "./DateFormat"

const date = new Date("2024-01-01T01:01:01")

export const Default: Story = () => <DateFormat date={date} />

export const Fallback: Story = () => <DateFormat date={null} />
