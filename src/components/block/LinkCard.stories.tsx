import type { Meta, StoryObj } from "@storybook/react-vite"
import LinkCard from "./LinkCard"

const meta = {
  component: LinkCard,
} satisfies Meta<typeof LinkCard>

export default meta

type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    headingLevel: 3,
    title: "Example Link Card",
    description: "This is an example of a link card component.",
    url: "https://example.com",
    image: "https://placehold.co/150",
  },
}

export const WithoutImage: Story = {
  args: {
    headingLevel: 3,
    title: "Example Link Card without Image",
    description: "This is an example of a link card component.",
    url: "https://example.com",
  },
}

export const WithoutDescription: Story = {
  args: {
    headingLevel: 3,
    title: "Example Link Card",
    url: "https://example.com",
  },
}

export const WithoutTitle: Story = {
  args: {
    headingLevel: 3,
    url: "https://example.com",
  },
}
