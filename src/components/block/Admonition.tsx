import type { ReactNode } from "react"

export interface AdmonitionProps {
  type: "info" | "warning" | "error"
  title: string
  icon: ReactNode
  id: string
  children: ReactNode
}

/**
 * React component for rendering admonitions. This should use the same markup
 * structure as the `remark-admonitions` plugin in remarkAdmonitions.ts.
 */
export function Admonition({ type, title, icon, id, children }: AdmonitionProps) {
  const className = `admonition admonition-${type}`

  return (
    <div className={className} role="note" aria-labelledby={id}>
      <div className="admonition-header" id={id}>
        <span className="admonition-icon" aria-hidden="true">
          {icon}
        </span>
        {title}
      </div>
      <div className="admonition-content">
        {children}
      </div>
    </div>
  )
}
