import type { Meta, StoryObj } from "@storybook/react-vite"
import { DateFormat } from "./DateFormat"

const date = new Date("2024-01-01T01:01:01")

const meta = {
  component: DateFormat,
} satisfies Meta<typeof DateFormat>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    date,
  },
}

export const Fallback: Story = {
  args: {
    date: null,
  },
}
