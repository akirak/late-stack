import type { SocialLinkSchema } from "@/schemas/social"
import { Suspense } from "react"
import { Loading } from "@/components/inline/Loading"
import { socialIcons } from "./icons"

type SocialLinkProps = typeof SocialLinkSchema.Type & {
  className?: string
}

export default function SocialLink({
  login,
  url,
  site,
  language,
  className,
}: SocialLinkProps) {
  const IconComponent = socialIcons[site]

  return (
    <a
      href={url}
      hrefLang={language}
      title={login}
      className={className}
    >
      <Suspense fallback={<Loading />}>
        <IconComponent width="32" height="32" />
      </Suspense>
    </a>
  )
}
