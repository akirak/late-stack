---
slug: start-blog-late
title: Starting a Blog with the LATE Stack in 2025
publicationDate: "2025-07-20T22:00:00+09:00"
language: en
description: "An introduction to the LATE Stack (Lightning CSS, React Aria, TanStack, Effect) for building a custom, type-safe blog from scratch, and the motivation for starting a blog in 2025."
---

In an era dominated by AI, the relevance of personal blogging is often
questioned. In this post, I will explain the rationale for building a new blog
from scratch in 2025 and detail its technical implementation, which I call the
_LATE Stack_.

:::warning[Partly AI-Generated Content]

This post was written with the assistance of AI to improve clarity and generate
some content.

:::

## Background: Blogging in the age of AI

Artificial intelligence (AI) has become ubiquitous. AI models scrape, digest and
remix information from across the web, often presenting it without its original
context. Proprietary AI models also pay for access to content — [companies like
OpenAI sign licence deals][license-deals] with publishers, news organisations,
and research databases.

[license-deals]: https://www.theguardian.com/media/article/2024/may/04/danger-and-opportunity-for-news-industry-as-ai-woos-it-for-vital-human-written-copy "Danger and opportunity for news industry as AI woos it for vital human-written copy"

For publishers and media platforms, this is a crisis. Even as they move content
behind paywalls, [AI companies believe they can eventually bypass publishers
entirely][end-of-publishing]. _(Note that the linked article is behind a
paywall)_.

[end-of-publishing]: https://www.theatlantic.com/technology/archive/2025/06/generative-ai-pirated-articles-books/683009/

The Model Context Protocol (MCP) is gaining traction, enabling agents to fetch
information and perform effects. Despite ongoing security concerns, its adoption
continues to grow, and it is poised to become dominant. As a consequence,
traditional web search is losing relevance, and direct website visitation may
decline.

This raises a question for individuals: Does it still make sense to write a
blog in 2025? Is it too late to even start? It's so over.

From a pessimistic viewpoint, the outlook appears bleak. AI models peruse and
regurgitate content. AI chats generate synthesised responses. Even though they
direct some of the traffic to original sources, your work may be consumed to
fuel a chatbot's reply, often unacknowledged, even at the best scenario.

In this landscape, the purpose of blogging shifts. It is less about utility that
AI can replicate. Perhaps it should be more about [originality][are-blogs-dead].
Or about contexts. Since the old paradigm (writing for everyone) is being lost
or getting no reward, you have to either select whom you serve or just leave the
game.

[are-blogs-dead]: https://www.gnosis.team/post/are-blogs-dead-how-ai-is-changing-content-marketing-forever

## Motivation: Reclaiming control

In an era where AI-generated content floods every platform, building a bespoke
blog system is an act of reclaiming control. It is about more than just
publishing words—it is about shaping the entire experience for both the author
and the readers.

Building a custom platform provides ownership over:

- The architecture for creating, displaying, and discovering content—unencumbered by third-party constraints.
- The user experience, tailored to specific values and vision.
- The developer experience, permitting evolution without vendor lock-in.
- Data and privacy, frequently compromised on “free” AI platforms. This approach retains options such as a paywall.

In this AI era, where automation entices us to outsource creativity,
constructing a custom platform can be a deliberate choice: to author not merely
content, but context. It is a commitment to authenticity, craftsmanship, and
ownership.

This is _platform sovereignty_: **comprehensive control over the stack, from tools
and interface to data and infrastructure**.

There is also a necessity to write. Open-source projects risk being utilised
without credit and merit proper explanation and context.

For technical documentation, tools such as [DeepWiki](https://deepwiki.com/) are
emerging. **Publishing fragmented information deducible from code is less
valuable**. The focus should be on organising information in a coherent and
imparting insights.

For instance, when creating content for Emacs, elucidating the architecture is
insufficient. Demonstrating features in action, as
[alphapapa](https://github.com/alphapapa) advocated, is more efficacious. A
focus on community success would have precipitated this approach sooner.

## Building a custom publishing system from scratch

This website is built mainly in TypeScript, the prevailing choice for frontend
development in 2025. While other languages could be used, “black box” web
frameworks in Rust or Go—marketed as _fast_—are avoided. The priority is not raw
performance but correctness and understanding. When tackling an unfamiliar
domain, sticking to one flexible language is beneficial. Here, it is TypeScript.

:::info[My personal experience with Hugo]

Past experience with [Hugo](https://gohugo.io/) for a personal site (2017–2020)
involved generating Markdown from [Org mode](https://orgmode.org/) files using
[ox-hugo](https://ox-hugo.scripter.co/). Customising it was tough. There was an
issue with TLS, but I left it unfixed due to lack of interest. This
dissatisfaction was partly due to unclear purpose of the website. After all, I
never liked Go for building anything that is not boring.

:::

### Inspiration: Content collections from Astro

[Astro](https://astro.build/) is a web framework designed for content-driven
websites. It does not only excel at performance-oriented static sites. It is
also highly versatile. Its [Islands
Architecture](https://docs.astro.build/en/concepts/islands/) allows for the
integration of multiple UI frameworks like React, Vue and Svelte. Many modern
documentation sites are built with [Astro
Starlight](https://starlight.astro.build/), which is used in [one of my own
projects](https://akirak.github.io/flake-templates/). For rapid static site
development, Astro is an excellent choice.

Astro is built around [content collections][content collections]. A collection
is a set of content entries governed by a schema, with a backend ranging from
static Markdown files to a headless CMS. The data is programmable and
schema-validated, fitting modern schema-driven development.

[content collections]: https://docs.astro.build/en/guides/content-collections/

However, Astro has limitations. It lacks native support for _type-safe routing_,
a feature becoming standard in frameworks like [TanStack
Router](https://tanstack.com/router/latest) and recent [React
Router](https://reactrouter.com/start/framework/routing) versions. This makes
Astro less suitable for interactive applications. While [a third-party
solution][astro-typesafe-routes] exists, its unofficial status makes it risky.
Astro is optimised for content-heavy sites, not complex web apps.

[astro-typesafe-routes]: https://github.com/feelixe/astro-typesafe-routes

Inspired by Astro's collections, this project re-implements the concept in a
React app. React was chosen for its rich ecosystem and capabilities. The main
challenges are managing bundle size and performance. This decision reflects a
core goal: full control over user experience. Purely static sites are less
relevant as serverless environments mature, making dynamic, full-stack
approaches on platforms like [Cloudflare Workers][cloudflare-workers-fullstack]
more appealing.

[cloudflare-workers-fullstack]: https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/

### Rise of Effect-TS

TypeScript wasn't always seen as a first-class backend language. It is a
superset of JavaScript, which originates in the browser.

A key weakness for backend development has been its leaky `try-catch` exception
handling. While some claim TypeScript is a “full-stack language,” experienced
backend developers often remain sceptical.

The JavaScript ecosystem has been frustrating, marked by constant reinvention
and a complex toolchain. The promise of TypeScript as “one language to rule them
all” often fell short, requiring numerous utility libraries, along with a
formatter, linter, and bundler, just to build a single app. This setup forced
developers to manage many parts before addressing core logic.

Enter [Effect](https://effect.website/). After a long development period, it
reached its first stable version last year. While it offers a powerful _effect
system_, It is much more: **a complete, batteries-included application framework
built on TypeScript syntax.** Though it has a learning curve, its robust,
functional approach is compelling. Recently, [Effect entered its early adopter
phase][effect-early-adapter].

[effect-early-adapter]: https://x.com/schickling/status/1938207477096468604

Effect includes a schema library, like Zod, optionally supporting the [Standard
Schema v1][standard schema] specification. This allows seamless integration with
TanStack Router. ChatGPT helped draft an initial specification for _Effect
Collections_, implementing Astro's content collections using Effect schemas.
This approach uses one set of schemas for validating both content and routing
parameters.

[standard schema]: https://standardschema.dev/

## What is the LATE Stack?

The _LATE Stack_ is the name for this project's technology stack. It includes
[Lightning CSS](https://lightningcss.dev/) (L), [React
Aria](https://react-spectrum.adobe.com/react-aria/index.html) (A), [TanStack
Router/Start](https://tanstack.com/start/latest) (T) and
[Effect](https://effect.website/) (E). This stack supports full-stack app
development with end-to-end type safety.

The name is partly a joke. While acronyms like LAMP and MEAN were common,
today's developers mix frameworks to meet needs. Quality attributes matter. The
name LATE also reflects the feeling it may be “too late” to start a blog, a
sentiment this project defies.

The stack's main focus is _maintainability_. The goal is to avoid frequent stack
changes, which waste time better spent on meaningful work. A stable, traceable
system is crucial. This is a conservative choice, but one prioritising developer
experience.

### Lightning CSS

Lightning CSS is a modern, fast CSS parser, transformer, and minifier written in
Rust. It is a faster successor to PostCSS, and [Tailwind CSS has switched
to Lightning CSS][tailwindv4].

[tailwindv4]: https://tailwindcss.com/blog/tailwindcss-v4-alpha

This project uses vanilla CSS, supported by the argument that [vanilla CSS is a
strong contender in 2025][vanillacss]. Recent language advancements have made
extensions like SCSS largely obsolete. Beyond code organisation, writing
standard CSS is the most unopinionated and future-proof styling method, and
Lightning CSS offers modern tooling for it. AI tools (at least Claude Code) can
also generate CSS from the user's prompts.

[vanillacss]: https://ikius.com/blog/why-vanilla-css-is-great

This isn't a rejection of utility-first frameworks like [Tailwind
CSS](https://tailwindcss.com/). While used in other projects, here, vanilla
CSS's directness is preferred as a learning tool and stable foundation.

### React Aria

Though this site is mostly static, there are plans to add interactive elements
using components.

Headless (unstyled) components are widely adopted nowadays. They speed up the
development of high-quality, custom-designed apps, crucial for branded products.
For instance, one might use [Radix
Primitives](https://www.radix-ui.com/primitives)—the foundation for the popular
[shadcn](https://ui.shadcn.com/) library—directly. Headless components save time
compared to building from scratch and offer a solid foundation for
accessibility, including robust keyboard navigation.

React Aria is another top headless component library. Developed and maintained
by Adobe as a free, open-source project, it is known for its best-in-class
accessibility support. While it previously offered only a hooks-based API, the
newer [React Aria Components][react-aria-components] (RAC) provide a
much-improved developer experience.

[react-aria-components]: https://react-spectrum.adobe.com/react-aria/components.html

Both Radix Primitives and React Aria are excellent choices. React Aria was
chosen for its stricter accessibility compliance and superior
internationalisation support, though other options may be considered if needed.

Other alternatives include using [Mantine without its
styles](https://mantine.dev/styles/unstyled/). As native HTML capabilities
improve, reliance on such libraries may decrease over time.

### TanStack Start

In the React ecosystem, Next.js has been dominant for years, with Remix emerging
as a strong competitor. Remix has since merged with React Router, which is also
popular.

[TanStack Router](https://tanstack.com/router/latest) is a newer entrant from
the creators of the widely-used TanStack Query (formerly React Query). The
growing TanStack ecosystem makes it an attractive option to invest in.

Having been used in other applications, TanStack Router's well-integrated data
loading capabilities are particularly suitable for the Effect-based content
collections in this project.

::link[https://betterstack.com/community/comparisons/tanstack-router-vs-react-router/]

[TanStack Start](https://tanstack.com/start/latest) is a framework built on
TanStack Router. It is a full-stack framework, like Next.js or Remix, supporting
various data loading patterns in serverless deployments.

Currently, the framework is still maturing, and its support for major deployment
providers is incomplete. A recent refactor removed the dependency on
[Vinxi](https://vinxi.vercel.app/), causing a temporary regression in its
support for [Nitro][nitro]. The team is working to make Nitro optional. While
this modular approach will be beneficial long-term, it has temporarily removed
the ability to customise server configurations, like cache policies. This should
be resolved soon.

[nitro]: https://nitro.build/

::link[https://github.com/TanStack/router/issues/4404]

### Effect-TS

Finally, there's Effect. Having used it in other projects, it is become
indispensable for writing TypeScript. It is important to note that using the full
[Effect runtime](https://effect.website/docs/runtime/) on the front-end is
discouraged due to its impact on bundle size. Therefore, runtime-dependent
features like concurrency and managed error handling should be avoided in
client-side code. However, Effect remains highly useful even without its
runtime, offering a suite of “batteries-included” modules for functional
programming in TypeScript:

- Functional libraries (e.g. `pipe` function)
- Schemas, supporting Standard Schema
- Utility libraries for strings, arrays, etc.

With its runtime, Effect excels at building concurrent, I/O-bound backend
services. The project's repositories are also a valuable learning resource,
showcasing cutting-edge software development practices.

In this project, Effect is mainly used for schemas and the build pipeline
integrated into Vite.

## Authoring workflow with Effect-TS

After brainstorming the concept of Effect Collections with ChatGPT, it was
implemented within the TanStack application. This section provides an overview
of the system, covering the (1) source format, (2) build pipeline and (3)
deployment.

### Unified: Content as syntax trees

In the Collections API, content is accessed via an abstract TypeScript API,
allowing for virtually any back-end to be supported. For simplicity, however,
this implementation uses the traditional **YAML front matter + Markdown** source
format, common in static site generators and blog systems.

:::warning[Org mode is not directly supported]

In the AI era, Markdown's momentum continues to grow. As a heavy user of Emacs
Org mode, I recognise the complexity involved in Org mode's implementation. The
preference is to define the Markdown pipeline via a syntax tree processor for
stability and predictability. While integrating Org mode remains of interest, it
would require every stage of the pipeline to be precisely specified—which is why
I'm working with syntax trees. In this model, Org would become just another step
in the pipeline.

:::

There is an umbrella ecosystem called [unified][unifiedjs], which is a
collection of libraries for transforming content between various text-based
formats. In this world, content is represented as a _syntax tree_. Each format
has a corresponding syntax tree specification, like `mdast` for Markdown and
`hast` for HTML. By chaining a parser, plugins (transformers) and a compiler
(serialiser), you can create a processor to convert from one format to another.
This enables deeply customisable document conversion pipelines by combining
plugins for different syntax tree specifications. These syntax trees can also be
serialised to JSON, allowing intermediate representations to be saved.

[unifiedjs]: https://unifiedjs.com/

A technical challenge with Markdown is its lack of a precise standard, leading
to numerous variants. The unified ecosystem addresses this by allowing a
specific Markdown flavour to be defined by combining plugins for
[remark](https://github.com/remarkjs/remark) (for Markdown syntax trees) and
[rehype](https://github.com/rehypejs/rehype) (for HTML). The stability of these
ecosystems makes this a relatively safe and reliable approach.

The remark and rehype plugin ecosystem is rich, and custom plugins can also be
created. Several have already been implemented, including one for generating OGP
link cards. The [Content Style Guide](/posts/en/style-guide) is an example post
written in this custom Markdown format. AI coding assistants like Claude are
effective for implementing such plugins.

::link[https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins]

::link[https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins]

It is not always necessary to load data from Markdown files. For a collection of
static data, it would be sufficient to hard-code the data and define a loader
function.

### Implementing the build pipeline with Effect

To catch errors early, posts are processed at build time (during `vite build` or
`vite dev`), not when a request is rendered on the production server.

Since the application uses Vite, the pipeline is integrated as a _Vite plugin_.
The pipeline itself is implemented as an [Effect
layer](https://effect.website/docs/requirements-management/layers/) and executed
on a [ManagedRuntime](https://effect.website/docs/runtime/#managedruntime)
within the Vite server process. This integration is documented in [Content
Pipeline in Vite](/posts/en/vite-content-pipeline).

For blog posts, each Markdown file is processed and saved as a JSON file
containing a `hast` (HTML syntax tree), not a final HTML file. This approach
allows for the use of React components within Markdown content. The `hast` is
transformed into JSX at render time using
[hast-util-to-jsx-runtime][hast-util-to-jsx-runtime]. While this introduces a
minor runtime overhead, it provides a good trade-off between performance and
flexibility.

[hast-util-to-jsx-runtime]: https://github.com/syntax-tree/hast-util-to-jsx-runtime

An index of all posts is also generated as a JSON Lines file, enabling the post
archive to be displayed instantly. To minimise data loading overhead, no
database is used. The post index is sorted by date and read as a stream to
efficiently paginate entries.

:::diagram{.fit}

```d2
direction: right
Markdown: Markdown\npost file {
  shape: page
}

process: Build process {
  mdast: mdast\nsyntax tree
  hast: hast\nsyntax tree\n(sanitised)

  raw metadata: post metadata\nfrom\nfront matter
  metadata: validated metadata

  raw metadata -> metadata: schema validation\n(Effect)
}

assets: Build assets {
  JSON: \$slug.\$lang.json\n(content + metadata) {
    shape: page
  }
  index: post\.index\.jsonl\n(metadata of posts) {
    shape: page
  }
}

Markdown -> process.mdast: remark parser
Markdown -> process.raw metadata: YAML parser
process.mdast -> process.hast: remark & rehype\nplugins
process.hast -> assets.JSON
process.metadata -> assets.JSON

process.metadata -> assets.index
assets.JSON -> JSX: hast-util-\nto-jsx-runtime
```

:::

These files are contained in the build assets and must be deployed to the
server.

### Auxiliary services for the build pipeline

Running the pipeline on an Effect runtime unlocks the full power of the effect
system. Dependencies can be managed with
[layers](https://effect.website/docs/requirements-management/layers/) (which
provide dependency injection), and services can be run
[concurrently](https://effect.website/docs/concurrency/basic-concurrency/). This
results in a superior programming experience.

It is even possible to use Effect services within remark/rehype plugins by
creating and passing a runtime to them. This enables the creation of not only
_pure plugins_ that transform syntax trees but also _effectful plugins_ that can
interact with external services to fetch and incorporate data.

For example, the following effectful plugins have been implemented for this
website:

- Fetching Open Graph Protocol (OGP) metadata for external links in Markdown
  posts. This process runs at build time, ensuring fast page loads for users.
  The external pages are fetched concurrently using an Effect service, as
  detailed in [a dedicated post](/posts/en/effect-ogp).

- Building diagrams from text-to-diagram code via external commands. The
  currently supported syntax is [D2](https://d2lang.com/). Its CLI was chosen
  over the official JavaScript library due to reliability issues. While D2's own
  bugs may lead to a switch in the future, adding support for other CLI-based
  diagramming tools is straightforward thanks to Nix and Effect.

The following code example demonstrates the OGP implementation (some parts are
excluded for brevity; see [the full source
code](https://github.com/akirak/late-stack/) for details):

```ts title="post-pipeline.ts"
import remarkLink from "./unified/remarkLink"

export const PostBuilderLive: Layer.Layer<
  PostBuilder,
  Error | ConfigError,
  Config | Path.Path | FileSystem.FileSystem | LinkMetadataService | D2
> = Layer.effect(
  PostBuilder,
  Effect.gen(function* (_) {
    // Create OGP runtime
    const ogpRuntime = yield* Effect.runtime<LinkMetadataService>()

    const postProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkLink, { runtime: ogpRuntime })
  }),
)
```

```ts title="remarkLink.ts"
import type { LinkMetadata } from "../../schemas/link-metadata"
import { Effect, Match, Option, Runtime, Schema } from "effect"
import { visit } from "unist-util-visit"
import { ExternalUrlParser } from "../../schemas/external-url"
import { LinkMetadataService } from "../link-metadata/layer"

export interface RemarkLinkOptions {
  runtime?: Runtime.Runtime<LinkMetadataService>
}

function remarkLink(options?: RemarkLinkOptions) {
  const { runtime } = options || {}

  return async (tree: any) => {
    // Collect all link directives that need OGP metadata
    const linkNodes: Array<{ node: any, headingLevel: number, source: typeof ExternalUrlParser.Type }> = []

    visit(tree, (node, index, parent) => {
      // Add to linkNodes
    })

    // Fetch OGP metadata for all collected links
    if (runtime && linkNodes.length > 0) {
      const effects = linkNodes.map(({ source }) =>
        LinkMetadataService.pipe(
          Effect.andThen(
            service =>
              service.get(source.metadataUrl).pipe(
                Effect.map(result => ({ url: source.metadataUrl, result })),
              ),
          ),
        ),
      )

      const results = await Runtime.runPromise(runtime)(
        Effect.all(effects, { concurrency: 5 }),
      )

      // Create a map of URL to OGP metadata
      const ogpMap = new Map<string, LinkMetadata>()
      results.forEach(({ url, result }) => {
        if (Option.isSome(result)) {
          ogpMap.set(url, result.value)
        }
      })

      // Apply OGP metadata to nodes
      linkNodes.forEach(({ node, headingLevel, source }) => {
        const ogpMetadata = ogpMap.get(source.metadataUrl)
        makeLinkBlock(source)(node, { headingLevel }, ogpMetadata)
      })
    }
  }
}
```

### Deploying to Deno Deploy

Since post data is stored in files, the server environment must provide
filesystem access, a feature not available on all serverless platforms. After
some research, [Deno Deploy](https://deno.com/deploy) was chosen for its
functionality, low-traffic cost model and global deployment capabilities. It
runs applications in containers on the Deno runtime, which has high
compatibility with Node.js, allowing the use of `node:fs` to access build
assets.

:::info[Cloudflare as an alternative]

If I were to utilise Cloudflare Workers, the files would be loaded from an
object storage, specifically Cloudflare R2. Alternatively, [Cloudflare
Containers (Beta)](https://developers.cloudflare.com/containers/) could be used,
although it is only available with the paid plan.

:::

Deno Deploy is a solid platform. While not as popular as Cloudflare Workers, it
offers a simpler user interface and is easier to use. However, a recent outage
caused widespread deployment failures, suggesting their operations may not be
suitable for mission-critical applications. As they are not a tech giant, it is
wise to monitor [their issue repository][deno-deploy-feedback] for operational
status.

[deno-deploy-feedback]: https://github.com/denoland/deploy_feedback/issues

## Developer & author experience

Thanks to the integration with the Vite dev server and Effect's robust error
handling, the authoring experience is comparable to that of a modern static site
generator. Syntax errors are logged to the console, and the live preview updates
instantly upon saving changes.

Building the entire site isn't as fast as a tool like Hugo. As the number of
posts grows, build times are expected to increase, requiring further engineering
to optimise.

The application is currently monolithic, making it easy to modify. It is
schema-driven, type-safe and highly customisable. The codebase is a standard
front-end application using a modern toolchain, including Nix, pnpm, ESLint
(using [antfu's configuration](https://github.com/antfu/eslint-config) for both
formatting and linting), Playwright, Lefthook, GitHub Actions and Renovate.

## Using AI for development

This project has also been an exercise in leveraging AI for development.

The approach isn't vibe coding. It required lots of manual interventions. Claude
Code is mainly used for generating initial code, which has been very helpful.
You can use [ccusage][ccusage] to determine whether your Pro/Max subscription is
worth it. I was on Pro plan when I was working on this project.

[ccusage]: https://github.com/ryoppippi/ccusage

As a developer not well experienced in frontend, many questions are asked. For
technical decision-making, Google's Gemini 2.5 Flash is mainly used. While less
adept at coding, its fast, neutral responses are excellent for brainstorming
implementation plans. The tools are complementary; for example, Claude initially
generated a colour scheme with poor contrast for dark mode, I had Gemini correct
it. The Gemini CLI is also used for improving documentation, but it can
sometimes change (or misunderstand) the intention of content, so review is
always necessary. It's inaccurate. For example, Gemini 2.5 Pro changed Gemini
2.5 Flash to Gemini **1.5** Flash in this paragraph.

With the help of AI, I generated frontend code without borrowing from existing
code repositories or blog posts. This experience suggests that the value of
sharing application code on blogs is diminishing, as AI can now produce similar
code on demand — **often without crediting the human authors whose work it was
trained on**.

OpenAI models are also used for architecture. The Effect Collections concept was
initially brainstormed with the free version of ChatGPT. o3 (via
[aider][aider]) was used to develop a specification for the [Effect OGP
service](/posts/en/effect-ogp). When it generated a syntactically invalid
diagram, Claude was used to fix it, and then again to implement the
specification. After personal refinement of the implementation, Claude was used
to update the spec and Gemini to improve the documentation. It is an iterative,
multi-tool process.

[aider]: https://github.com/Aider-AI/aider/

Several CLI-based AI agents are used (claude, gemini and aider). To streamline
the workflow, I had developed a custom Emacs integration beforehand to sends
prompts from Org mode files to a terminal session. This creates a consistent
interface across different terminal-based agents. With this implementation,
Emacs can manage multiple coding sessions simultaneously, but I often get lost.
At the moment, the primary bottleneck seems to be in the human.

Agentic services like [Devin][devin] haven't been used, as it is unclear how to
integrate them seamlessly with the Emacs and Org mode environment. Perhaps an
integration layer will need to be built for it—using another AI.

[devin]: https://devin.ai/

The total monthly spending on AI services is under $50. While many spend more,
this is still a significant cost for most individuals. I feel a need to increase
my income or reconsider these subscriptions.

## User experience

Regarding user experience, there's not yet sufficient data. The current focus is
on maintaining high Lighthouse scores. While Accessibility, Best Practices and
SEO scores should be near-perfect, Performance can fluctuate. These metrics will
be monitored closely after the official launch.

## Future work

Many features are planned for the future:

- Feedback mechanisms: Comments, emoji reactions, etc., via APIs or external
  services.
- Integration with my personal Org mode repository.
- Taxonomies: Categories and tags, as found in typical blog systems.
- Search UI, and potentially an MCP server for the content.
- `llms.txt` to provide a way for language models to better utilise the
  contents.
- Performance optimisations as the content grows.
- AI-driven workflows for content quality control.
- Refactoring the blog system to make components reusable (pipeline, style,
  etc.).
- Enhancing the Markdown processor to support features like footnotes and
  additional diagram syntaxes.
- Authentication and authorisation to support private content and a paywall.

If you have suggestions, please [open an
issue](https://github.com/akirak/late-stack/issues).

AI now enables individuals to build tailored publishing systems from scratch.
With some frontend knowledge, you can design clear, readable pages—and use AI to
refine both design and content along the way.
