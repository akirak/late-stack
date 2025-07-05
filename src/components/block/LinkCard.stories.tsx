import type { Story } from "@ladle/react"
import { LinkCard } from "./LinkCard"

export const WithImage: Story = () => (
  <LinkCard
    headingLevel={3}
    title="Example Link Card"
    description="This is an example of a link card component."
    url="https://example.com"
    image="https://via.placeholder.com/150"
  />
)

export const WithoutImage: Story = () => (
  <LinkCard
    headingLevel={3}
    title="Example Link Card without Image"
    description="This is an example of a link card component."
    url="https://example.com"
  />
)

export const WithoutDescription: Story = () => (
  <LinkCard
    headingLevel={3}
    title="Example Link Card"
    url="https://example.com"
  />
)

export const WithoutTitle: Story = () => (
  <LinkCard
    headingLevel={3}
    url="https://example.com"
  />
)
