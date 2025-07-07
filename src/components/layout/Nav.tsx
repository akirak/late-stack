import React from "react"

/**
 * Navigation component for the content.
 */
export function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="main-nav">
      {children}
    </nav>
  )
}
