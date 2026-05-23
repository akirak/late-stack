import { useState } from "react"

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
  const [isActivated, setIsActivated] = useState(false)
  const videoTitle = title || "YouTube video"
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${id}`)
  embedUrl.searchParams.set("autoplay", "1")

  return (
    <div className={`youtube-embed ${className}`}>
      {isActivated
        ? (
            <iframe
              src={embedUrl.toString()}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        : (
            <button
              type="button"
              className="youtube-embed-placeholder"
              style={{ backgroundImage: `url(${thumbnail})` }}
              aria-label={`Play ${videoTitle}`}
              onClick={() => setIsActivated(true)}
            >
              <span className="youtube-embed-play" aria-hidden="true" />
            </button>
          )}
    </div>
  )
}
