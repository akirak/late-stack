declare module "react-lite-youtube-embed" {
  import type { ComponentType } from "react"

  interface LiteYouTubeEmbedProps {
    id: string
    title?: string
    playlist?: boolean
    poster?: string
    noCookie?: boolean
    activatedClass?: string
    iframeClass?: string
    playerClass?: string
    wrapperClass?: string
    onIframeAdded?: () => void
    rel?: string
    thumbnail?: string
    webp?: boolean
    aspectHeight?: number
    aspectWidth?: number
    params?: string
    announce?: string
  }

  const LiteYouTubeEmbed: ComponentType<LiteYouTubeEmbedProps>
  export default LiteYouTubeEmbed
}
