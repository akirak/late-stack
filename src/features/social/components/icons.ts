import type { ComponentType } from "react"
import type { IconProps } from "@/components/icons/types"
import type { SocialSiteId } from "@/schemas/social"
import { lazy } from "react"

type IconMap = {
  [key in SocialSiteId]: ComponentType<IconProps>;
}

export const socialIcons: IconMap = {
  github: lazy(() => import("@/components/icons/GitHubIcon")),
  bluesky: lazy(() => import("@/components/icons/BlueskyIcon")),
}
