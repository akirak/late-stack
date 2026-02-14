import * as React from "react"
import styles from "./layout.module.css"

/**
 * Navigation component for the content.
 */
export function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className={styles.nav}>
      {children}
    </nav>
  )
}
