import styles from "./layout.module.css"

export function Header({ id, children }: { id?: string, children: React.ReactNode }) {
  return (
    <header id={id} className={styles.header}>
      {children}
    </header>
  )
}
