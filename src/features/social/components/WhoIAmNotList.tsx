import type { WhoIAmNotSite } from "@/schemas/social"
import { Suspense } from "react"
import { Admonition } from "@/components/block/Admonition"
import { socialIcons } from "./icons"

function InlineIconFallback() {
  return (
    <span
      className="social-icon-fallback"
      aria-hidden="true"
    />
  )
}

function WhoIAmNotSiteItem({ site }: { site: WhoIAmNotSite }) {
  const IconComponent = site.icon ? socialIcons[site.icon] : null

  return (
    <tr>
      <td>
        <span className="inline-flex items-center gap-xs">
          {IconComponent && (
            <Suspense fallback={<InlineIconFallback />}>
              <IconComponent width={12} height={12} />
            </Suspense>
          )}
          {site.name}
        </span>
      </td>
      <td>
        <a href={site.url} target="_blank" rel="noreferrer noopener">
          {site.url}
        </a>
      </td>
      <td>
        🚫
        {" "}
        {site.accounts.map((account, index) => (
          <span key={account}>
            {index > 0 && ", "}
            <code>{account}</code>
          </span>
        ))}
      </td>
    </tr>
  )
}

export default function WhoIAmNotList({ entries }: { entries: readonly WhoIAmNotSite[] }) {
  return (
    <Admonition
      type="error"
      title="Who I Am Not"
      icon="🪪"
      id="who-i-am-not"
    >
      <p>If you're trying to contact me, please note that some accounts with similar names are not affiliated with me.</p>

      <details>
        <summary>
          See a list of unrelated accounts
        </summary>
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>URL</th>
              <th>Accounts</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(site => (
              <WhoIAmNotSiteItem key={site.name} site={site} />
            ))}
          </tbody>
        </table>
        <p><em>(They might be great people—just not me.)</em></p>
      </details>
    </Admonition>
  )
}
