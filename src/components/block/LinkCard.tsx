import type { JSX } from "react"
import type { LinkMetadata } from "@/schemas/link-metadata"

export type LinkCardProps = Omit<LinkMetadata, "_tag"> & {
  url: string
  headingLevel: number
}

function LinkCardSite({ domain }: { domain: string }) {
  return (
    <div className="link-card-site">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}`}
        alt="Favicon"
        width="16"
        height="16"
        aria-hidden="true"
      />
      <span>{domain}</span>
    </div>
  )
}

export function LinkCard({
  url,
  title,
  image,
  imageAlt,
  description,
  headingLevel,
}: LinkCardProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card"
      title={title}
    >
      {image && (
        <div className="link-card-image">
          <img
            src={image}
            alt={imageAlt || "Link preview"}
          />
        </div>
      )}
      <div>
        <LinkCardSite domain={new URL(url).hostname} />
        <HeadingTag
          className="link-card-title truncate-single-line"
        >
          {
            title || url
          }
        </HeadingTag>
        { description && (
          <p
            className="link-card-description truncate-single-line"
            title={description}
          >
            {description}
          </p>
        )}
      </div>
    </a>
  )
}
