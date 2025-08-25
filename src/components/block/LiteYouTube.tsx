import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"

export interface LiteYouTubeProps {
  id: string
  title?: string
  className?: string
}

export default function LiteYouTube({
  id,
  title,
  className = "",
}: LiteYouTubeProps) {
  return (
    <div className={`youtube-embed ${className}`}>
      <LiteYouTubeEmbed
        id={id}
        title={title || "YouTube video"}
      />
    </div>
  )
}
