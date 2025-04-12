import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/about/")({
  beforeLoad: () => {
    throw redirect({
      to: "/about/$lang",
      params: {
        lang: "en",
      },
    })
  },
  component: () => null,
})
