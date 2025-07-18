import type { SocialLink } from "@/schemas/social"

export function makeGitHubAccount(login: string): SocialLink {
  return {
    login,
    url: `https://github.com/${login}`,
    site: "github",
  }
}
