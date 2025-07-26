import type { LanguageId } from "@/schemas/common"
import type { SocialLink } from "@/schemas/social"
import { Option, pipe, Schema } from "effect"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { makeGitHubAccount } from "@/features/social/utils"
import { LanguageIdSchema, LanguagePropertiesSchema } from "@/schemas/common"
import { SocialLinkSchema, WhoIAmNotSiteSchema } from "@/schemas/social"
import { getLanguageById } from "../languages"
import whoIAmNotData from "./who-i-am-not.json"

export const ProfileSpec = Schema.Struct({
  lang: LanguageIdSchema,
})

export const ProfileSchema = Schema.Struct({
  language: LanguagePropertiesSchema,
  fullName: Schema.String,
  taglineHast: Schema.Any,
  descriptionHast: Schema.Any,
  postscriptHast: Schema.Any,
  /** Only social sites that are meant for contacting should be listed */
  socialLinks: Schema.Array(SocialLinkSchema),
  whoIAmNotEntries: Schema.Array(WhoIAmNotSiteSchema),
})

type SocialLinks = typeof ProfileSchema.Type.socialLinks

export type Profile = typeof ProfileSchema.Encoded

function getSocialLinksByLanguage(lang: LanguageId): SocialLinks {
  const github = makeGitHubAccount("akirak")
  const bluesky = {
    login: "akirakom.bsky.social‬",
    url: "https://bsky.app/profile/akirakom.bsky.social",
    site: "bluesky",
  } satisfies SocialLink

  switch (lang) {
    case "en": {
      return [github, bluesky]
    }
    case "ja": {
      return [github]
    }
    default: {
      return []
    }
  }
}

const tagline = `
I am Akira Komamura (he/him, Japanese). After self-teaching Linux and functional
programming, I started using Emacs in 2017. I am currently working for the IT
industry in Japan for a living.
`

const globalDescription = `
## Interests

I am interested in streamlining workflows inside Emacs, along with the use of
Org mode and its underlying infrastructure management.

I am trying to be free from expensive hardware and expensive subscription
programmes that only rich people can afford. Thus I have been a user of desktop
Linux distributions. I also embrace reproducibility, idempotency, composability,
evolvability, and operational transparency, so I have been using NixOS since
2020.

In the future, I might apply knowledge of web development to build a more
comprehensive environment for Org mode users, especially those who are
interested in using Org mode for personal knowledge and task management. AI has
raised the bar. As alternatives grow more capable, I feel the need to pursue
a higher path in what I build.

## Projects

My open source projects are available on [my GitHub profile](https://github.com/akirak).
Most of them are related to Emacs, Org mode, and Nix, and primarily intended to
serve myself. I have received a thousand stars in total, but quite a few of them
are still half-done. I also worked on [Emacs Twist](https://github.com/emacs-twist/),
which is somewhat a work in progress.

I am also a co-maintainer of [nix-emacs-ci](https://github.com/purcell/nix-emacs-ci),
which underpins continuous integration for a large proportion of Emacs packages.

## Support

### Receiving

I am currently not receiving any support or sponsorship. Given my current
situation, I am not actively seeking sponsorships.

### Giving

I support several open-source projects and people — primarily
hard-working maintainers of projects I am interested in. The platforms
I use for this are [GitHub Sponsors](https://github.com/akirak?tab=sponsoring),
[Open Collective](https://opencollective.com/akira-komamura), and
[Patreon](https://www.patreon.com/) (anonymously).

## Contact

I don’t attend offline meetups. If you want to talk, use one of the social
accounts.
`

const postscript = `
The word in the domain name *jingsi* (靜思) means *meditation* in Mandarin Chinese.
I don't practise meditation, though — It's a word my Taiwanese landlord used
on her LINE account. I acquired this domain while I was in Taiwan, and it's
just that.

*Trivium is the singular form of trivia. In classical education, it refers
to grammar, logic, and rhetoric — the three foundational liberal arts.*
`

export async function getProfileInternal({ lang }: typeof ProfileSpec.Type): Promise<Option.Option<Profile>> {
  const language = pipe(
    getLanguageById(lang),
    Option.getOrUndefined,
  )

  if (!language) {
    return Option.none()
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize, {
      ...defaultSchema,
      clobberPrefix: "",
    })

  const fromMarkdown = async (markdown: string) => {
    try {
      return await processor.run(processor.parse(markdown))
    }
    catch (error) {
      throw new Error("Failed to process markdown", {
        cause: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  const fullName = "Akira Komamura"

  // Validate and type the imported JSON data
  const whoIAmNotEntries = Schema.decodeUnknownSync(Schema.Array(WhoIAmNotSiteSchema))(whoIAmNotData)

  return Option.some({
    language,
    fullName,
    whoIAmNotEntries,
    taglineHast: await fromMarkdown(tagline),
    descriptionHast: await fromMarkdown(globalDescription),
    postscriptHast: await fromMarkdown(postscript),
    socialLinks: getSocialLinksByLanguage(lang),
  })
}
