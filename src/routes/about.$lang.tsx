import type { LanguageId } from "@/schemas/common"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Option, pipe } from "effect"
import { getLocalProfile } from "@/collections/about"
import { Container } from "@/components/layout/Container"
import { DocumentTitle } from "@/components/layout/DocumentTitle"
import { Header } from "@/components/layout/Header"

export const Route = createFileRoute("/about/$lang")({
  component: AboutComponent,
  loader: ({ params }) => {
    return {
      localProfile: pipe(
        getLocalProfile(params.lang as LanguageId),
        Option.getOrThrowWith(() => notFound()),
      ),
    }
  },
})

function AboutComponent() {
  const { localProfile: { fullName } } = Route.useLoaderData()
  const { lang } = Route.useParams()

  // Generate unique IDs for aria-labelledby
  const profileHeadingId = "profile-heading"
  const socialAccountsHeadingId = "social-accounts-heading"
  const publishingPlatformsHeadingId = "publishing-platforms-heading"
  const receivingSponsorshipHeadingId = "receiving-sponsorship-heading"
  const givingSponsorshipHeadingId = "giving-sponsorship-heading"
  const websiteInfoHeadingId = "website-info-heading"
  const nameOriginHeadingId = "name-origin-heading"
  const websitePurposeHeadingId = "website-purpose-heading"
  const localizedInfoHeadingId = "localized-info-heading"
  const localSocialAccountsHeadingId = "local-social-accounts-heading"

  return (
    <Container>
      <Header>
        <h1 id="page-heading">About the author</h1>
        <DocumentTitle title={`${fullName} [${lang}]`} />
      </Header>

      <main aria-labelledby="page-heading">

        <div>
          {/* Use section for better semantics */}
          <section aria-labelledby={profileHeadingId}>
            <h2 id={profileHeadingId}>{fullName}</h2>
            <p>
              <strong>Location:</strong>
              {" "}
              My Current Location (e.g., City, Country)
            </p>
          </section>

          {/* Use section for social accounts */}
          <section aria-labelledby={socialAccountsHeadingId}>
            <h3 id={socialAccountsHeadingId}>Social Accounts</h3>
            {/* Subsections for clarity */}
            <section aria-labelledby={publishingPlatformsHeadingId}>
              <h4 id={publishingPlatformsHeadingId}>Publishing Platforms</h4>
              <ul>
                <li>
                  {/* Replace comment with actual SVG */}
                  <a href="#github-link" aria-label="GitHub Profile">
                    {/* SVG for GitHub */}
                  </a>
                </li>
                <li>
                  {/* Replace comment with actual SVG */}
                  <a href="#blog-link" aria-label="Personal Blog">
                    {/* SVG for Personal Blog */}
                  </a>
                </li>
                {/* Add other publishing platforms as needed, using SVG icons */}
              </ul>
            </section>
            <section aria-labelledby={receivingSponsorshipHeadingId}>
              <h4 id={receivingSponsorshipHeadingId}>Sponsorship Platforms (Receiving)</h4>
              <p>Currently not receiving sponsorships.</p>
              {/* Or list platforms if applicable, using SVG icons */}
            </section>
            <section aria-labelledby={givingSponsorshipHeadingId}>
              <h4 id={givingSponsorshipHeadingId}>Sponsorship Platforms (Giving)</h4>
              <ul>
                <li>
                  {/* Replace comment with actual SVG */}
                  <a href="#sponsor-link-1" aria-label="Sponsored Project/Person 1">
                    {/* SVG for Sponsorship Link 1 */}
                  </a>
                </li>
                {/* Add other sponsored links as needed, using SVG icons */}
              </ul>
            </section>
          </section>

          {/* Use section for website info */}
          <section aria-labelledby={websiteInfoHeadingId}>
            <h3 id={websiteInfoHeadingId}>Website Information</h3>
            <section aria-labelledby={nameOriginHeadingId}>
              <h4 id={nameOriginHeadingId}>Name Origin</h4>
              <p>Explanation of how the website got its name.</p>
            </section>
            <section aria-labelledby={websitePurposeHeadingId}>
              <h4 id={websitePurposeHeadingId}>Website Purpose</h4>
              <p>Description of what this portfolio/blog aims to achieve.</p>
            </section>
          </section>

          {/* Use section for localized info */}
          <section aria-labelledby={localizedInfoHeadingId}>
            <h3 id={localizedInfoHeadingId}>Description (Localized)</h3>
            <p>
              Optional biographical description in the current display language.
              Lorem ipsum dolor sit amet...
            </p>
          </section>

          {/* Use section for local social accounts */}
          <section aria-labelledby={localSocialAccountsHeadingId}>
            <h3 id={localSocialAccountsHeadingId}>Local Social Accounts (Optional)</h3>
            <ul>
              <li>
                {/* Replace comment with actual SVG */}
                <a href="#local-social-link-1" aria-label="Local Platform 1">
                  {/* SVG for Local Platform 1 */}
                </a>
              </li>
              {/* Add other local social accounts if applicable, using SVG icons */}
            </ul>
          </section>
        </div>
      </main>
    </Container>
  )
}
