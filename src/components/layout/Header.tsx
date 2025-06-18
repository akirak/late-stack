import styles from "./layout.module.css"

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.header}>
      {children}
    </header>
  )
}
