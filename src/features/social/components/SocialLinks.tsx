import type { SocialLinkSchema } from "@/schemas/social"
import styles from "./social.module.css"
import SocialLink from "./SocialLink"

interface SocialLinksProps {
  items: readonly (typeof SocialLinkSchema.Type)[]
}

export default function SocialLinks({ items: socialLinks }: SocialLinksProps) {
  if (socialLinks.length === 0) {
    return null
  }

  return (
    <ul className={styles.links} aria-label="Social media links">
      {socialLinks.map(attrs => (
        <li key={attrs.site}>
          <SocialLink {...attrs} />
        </li>
      ))}
    </ul>
  )
}
