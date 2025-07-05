import type { GlobalProvider } from "@ladle/react"
import React from "react"

import "@/styles/main.css"

export const Provider: GlobalProvider = ({
  children,
}) => (
  <div>
    {children}
  </div>
)
