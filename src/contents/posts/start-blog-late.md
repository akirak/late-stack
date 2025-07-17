---
slug: start-blog-late
title: Starting a Blog with the LATE Stack in 2025
language: en
draft: true
---

In an era dominated by AI, the relevance of personal blogging is often questioned.
This post explores the rationale for building a new blog from scratch in 2025 and
details its technical implementation, dubbed the _LATE Stack_.

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

For publishers and media platforms, this is an existential crisis. Even as they
move content behind paywalls, [AI companies believe they can eventually bypass
publishers entirely][end-of-publishing]. _(Caution: the linked article itself is
behind a paywall)_.

[end-of-publishing]: https://www.theatlantic.com/technology/archive/2025/06/generative-ai-pirated-articles-books/683009/

The Model Context Protocol (MCP) is rapidly gaining traction, enabling agents to
fetch information programmatically. Despite ongoing security concerns, its
adoption continues to grow, and it is poised to become a dominant standard.
Consequently, traditional web search is losing relevance, and direct website
visitation may decline.

This raises a question for individuals: Does it still make sense to write a
blog? Is it too late for newcomers to start in 2025?

From a pessimistic viewpoint, the outlook is grim. AI models skim, scrape and
regurgitate content. Search engines increasingly provide synthesised answers
instead of directing traffic to original sources. Your carefully crafted
insights may power a chatbot's response without attribution, meaning your work
is consumed but not recognised. With attention fragmented and credit diluted,
publishing free content can feel like a futile effort that benefits competitors.
The old paradigm seems to be over.

In this new landscape, the purpose of blogging shifts. It's less about providing
utility that AI can replicate and more about cultivating originality. The focus
turns to defining your audience. If the old game is lost, the new one is about
choosing who you serve.

[are-blogs-dead]: https://www.gnosis.team/post/are-blogs-dead-how-ai-is-changing-content-marketing-forever

## Motivation: Reclaiming control

In an era where AI-generated content floods every platform and blogging tools
attempt to lock users into their ecosystems, **building a bespoke blog system is
an act of reclaiming control**. It is about more than just publishing words—it
is about shaping the entire experience for both the author and the readers.

Building a custom platform provides ownership over:

- **The architecture that defines how content is created, displayed and
  discovered**—free from the constraints of opaque third-party services.
- **The user experience**, tailored to specific values and a creative vision
  without compromise.
- **The developer experience**, allowing the system to evolve without vendor
  lock-in or shifting policies.
- **Data and privacy**, which are often compromised on “free” AI-powered
  platforms. This approach retains the option to implement features like a
  paywall.

In this AI era, where automation tempts us to outsource creativity and control,
building a custom platform is a deliberate choice: **to be the author not just
of content, but of context**. It is a commitment to authenticity, craftsmanship
and lasting ownership.

This is platform sovereignty: full control over the stack, from tooling and
interface to data, logic, and infrastructure.

Moreover, there is a need to write. Open-source projects risk being used without
attribution and deserve proper explanation and context, provided at the right
moment.

For technical documentation, tools like [DeepWiki](https://deepwiki.com/) are
emerging. There is little value in publishing information that can be deduced
directly from code. Instead, the focus must be on intentionally organising
information and adding contextual insights.

For example, when creating content for Emacs, explaining the architecture is
insufficient. It is more effective to demonstrate features in action, a practice
[alphapapa](https://github.com/alphapapa) advocated for years ago. A greater
focus on community success would have led to adopting this approach sooner.

## Building a custom publishing system from scratch

This website is built primarily in TypeScript, the prevailing choice for
front-end development in 2025. While other languages could be used, existing
“black box” web frameworks in languages like Rust or Go—often marketed as
inherently _fast_—have been intentionally avoided. The priority is not raw
performance but correctness and understanding. When tackling a domain that is
not fully understood, sticking to a single, flexible language is advantageous.
In this case, that language is TypeScript.

:::info[My personal experience with Hugo]

Previous experience with [Hugo](https://gohugo.io/) for a personal website
(2017–2020) involved generating Markdown from [Org mode](https://orgmode.org/)
files using [ox-hugo](https://ox-hugo.scripter.co/). However, customising it
effectively proved difficult. The site was eventually abandoned after its TLS
certificate expired. This dissatisfaction stemmed partly from a lack of clear
purpose, but it was exacerbated by an incomplete understanding of the framework.
Furthermore, the Go language at the time was less refined than it is today.

:::

### Inspiration: Content collections from Astro

[Astro](https://astro.build/) is a web framework designed for content-driven
websites. While it excels at performance-oriented static sites, it is also
highly versatile. Its [Islands
Architecture](https://docs.astro.build/en/concepts/islands/) allows for the
integration of multiple UI frameworks like React, Vue and Svelte. Many modern
documentation sites are built with [Astro
Starlight](https://starlight.astro.build/), which is used in [one of my own
projects](https://akirak.github.io/flake-templates/). For rapid static site
development, Astro is an excellent choice.

Astro is architected around the concept of [content
collections][content collections]. A collection is a set of content entries
governed by a schema, with a backend that can range from static Markdown files
to a headless CMS. The data is programmable and schema-validated, aligning with
the modern practice of schema-driven development.

[content collections]: https://docs.astro.build/en/guides/content-collections/

However, Astro is not without its limitations. It lacks native support for
_type-safe routing_ (or type-safe URL states), a feature that is becoming
standard in frameworks like [TanStack
Router](https://tanstack.com/router/latest) and recent versions of [React
Router](https://reactrouter.com/start/framework/routing). This makes Astro less
suitable for highly interactive applications. While [a third-party
solution][astro-typesafe-routes] exists, its unofficial status makes it a risky
dependency. Ultimately, Astro is optimised for content-heavy websites, not
complex web applications.

[astro-typesafe-routes]: https://github.com/feelixe/astro-typesafe-routes

Inspired by Astro's collections, this project re-implements the concept within a
React application. The choice of React was driven by its rich ecosystem and
extensive capabilities. The main challenges are managing bundle size and
performance. This decision reflects a core project goal: achieving full control
over the user experience. Purely static sites are becoming less relevant as
serverless environments mature, making dynamic, full-stack approaches on
platforms like [Cloudflare Workers][cloudflare-workers-fullstack] increasingly
attractive.

[cloudflare-workers-fullstack]: https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/

### Rise of Effect-TS

For a long time, TypeScript was not considered a first-class backend language.
As a superset of JavaScript, its origins are in the browser, designed to support
_gradual typing_.

A key weakness of JavaScript/TypeScript for backend development has been its
leaky `try-catch` exception handling. While many have claimed TypeScript is a
“full-stack language,” experienced backend developers have often remained
skeptical.

The JavaScript ecosystem has also been a point of frustration, characterised by
constant reinvention and a complex toolchain. The promise of TypeScript as “one
language to rule them all” often fell short in practice, requiring a bundler,
formatter, linter and numerous other utilities just to build a single
application. This setup forced developers to manage many moving parts before
even addressing the core application logic.

Enter [Effect](https://effect.website/). After a long development period, it
reached its first stable version last year. While it provides a powerful _effect
system_, it is much more than that: **it is a complete, batteries-included
application framework built on TypeScript syntax.** Although it has a learning
curve, its robust, functional approach is compelling. As of recently, [Effect
has entered its early adopter phase][effect-early-adapter].

[effect-early-adapter]: https://x.com/schickling/status/1938207477096468604

Effect includes a schema library, similar to Zod, that conforms to the [Standard
Schema v1][standard schema] specification. This allows for seamless integration
with TanStack Router. ChatGPT was used to draft an initial specification for
_Effect Collections_, an implementation of Astro's content collections using
Effect schemas. This approach enables the use of a single set of schemas for
validating both content and routing parameters.

[standard schema]: https://standardschema.dev/

## What is the LATE Stack?

The _LATE Stack_ is the name given to the technology stack for this project. It
consists of [Lightning CSS](https://lightningcss.dev/) (L), [React
Aria](https://react-spectrum.adobe.com/react-aria/index.html) (A), [TanStack
Router/Start](https://tanstack.com/start/latest) (T) and
[Effect](https://effect.website/) (E). This stack enables the development of
full-stack applications with end-to-end type safety.

The name is partly a joke. While acronyms like LAMP and MEAN were once common,
today's developers typically combine frameworks to meet specific needs. Quality
attributes are what matter. The name LATE also reflects the feeling that it may
be “too late” to start a blog, a sentiment this project proceeds in spite of.

The primary focus of this stack is _maintainability_. The goal is to avoid
frequent stack changes, which waste time that could be spent on more meaningful
work. A stable, traceable system is crucial. This represents a conservative
choice, but one where developer experience remains a high priority.

### Lightning CSS

Lightning CSS is a modern, extremely fast CSS parser, transformer, and minifier
written in Rust. It's a faster successor to PostCSS, and [Tailwind CSS v4.0 has
switched to Lightning CSS][tailwindv4].

[tailwindv4]: https://tailwindcss.com/blog/tailwindcss-v4-alpha

This project uses vanilla CSS, a choice supported by the argument that [vanilla
CSS is a strong contender in 2025][vanillacss]. Recent advancements in the
language have made extensions like SCSS largely obsolete. Beyond code
organisation, writing standard CSS is the most unopinionated and future-proof
method for styling, and Lightning CSS provides the modern tooling for it.
Furthermore, AI tools can reliably generate standard CSS.

[vanillacss]: https://ikius.com/blog/why-vanilla-css-is-great

This is not a rejection of utility-first frameworks like [Tailwind
CSS](https://tailwindcss.com/). While it is used in other projects, for this
one, the directness of vanilla CSS is preferred as a learning tool and a stable
foundation.

### React Aria

Although this website is mostly static, there are plans to add interactive
elements using components.

Headless (unstyled) components have gained significant adoption. They accelerate
the development of high-quality, custom-designed applications, which is crucial
for branded products. For instance, one might use [Radix
Primitives](https://www.radix-ui.com/primitives)—the foundation for the popular
[shadcn](https://ui.shadcn.com/) library—directly. Headless components save time
compared to building from scratch and provide a solid foundation for
accessibility, including robust keyboard navigation.

React Aria is another leading headless component library. Developed and
maintained by Adobe as a free and open-source project, it is renowned for its
best-in-class accessibility support. While it previously offered only a
hooks-based API, the newer [React Aria
Components][react-aria-components] (RAC) provide a much-improved developer
experience.

[react-aria-components]: https://react-spectrum.adobe.com/react-aria/components.html

Both Radix Primitives and React Aria are excellent choices. React Aria was
selected for its stricter accessibility compliance and superior
internationalisation support, though other options may be considered if needed.

::link[https://argos-ci.com/blog/react-aria-migration]

Other alternatives include using [Mantine without its
styles](https://mantine.dev/styles/unstyled/). As native HTML capabilities
improve, our reliance on such libraries may decrease over time.

### TanStack Start

In the React ecosystem, Next.js has been dominant for years, with Remix emerging
as a strong competitor. Remix has since merged with React Router, which itself
is a popular choice.

[TanStack Router](https://tanstack.com/router/latest) is a newer entrant from
the creators of the widely-used TanStack Query (formerly React Query). The
growing TanStack ecosystem makes it an attractive option to invest in.

Having been used in other applications, TanStack Router's well-integrated data
loading capabilities are particularly suitable for the Effect-based content
collections in this project.

::link[https://betterstack.com/community/comparisons/tanstack-router-vs-react-router/]

[TanStack Start](https://tanstack.com/start/latest) is a framework built on top
of TanStack Router. It is a full-stack framework, similar to Next.js or Remix,
and supports various data loading patterns in serverless deployments.

At present, the framework is still maturing, and its support for major
deployment providers is incomplete. A recent refactor removed the dependency on
[Vinxi](https://vinxi.vercel.app/), which caused a temporary regression in its
support for [Nitro][nitro]. The team is working to make Nitro an optional
component. While this modular approach will be beneficial long-term, it has
temporarily removed the ability to customise server configurations, such as
cache policies. This is expected to be resolved soon.

[nitro]: https://nitro.build/

::link[https://github.com/TanStack/router/issues/4404]

### Effect-TS

Finally, there is Effect. Having used it in other projects, it has become
indispensable for writing TypeScript. It is important to note that using the
full [Effect runtime](https://effect.website/docs/runtime/) on the front-end is
discouraged due to its impact on bundle size. Therefore, runtime-dependent
features like concurrency and managed error handling should be avoided in
client-side code. However, Effect remains highly useful even without its
runtime, providing a suite of “batteries-included” modules for functional
programming in TypeScript:

- Functional libraries (e.g. `pipe` function)
- Schemas, which support Standard Schema
- Utility libraries for strings, arrays, etc.

With its runtime, Effect excels at building concurrent, I/O-bound backend
services. The project's repositories are also a valuable learning resource,
showcasing cutting-edge software development practices.

In this project, Effect is primarily used for schemas and the build pipeline
integrated into Vite.

## Authoring workflow with Effect-TS

After brainstorming the concept of Effect Collections with ChatGPT, it was
implemented within the TanStack application. This section provides an overview
of the system, covering the (1) source format, (2) build pipeline and (3)
deployment.

### Unified: Content as syntax trees

Collections are defined and content is modelled. Content is accessed via an
abstract TypeScript API, allowing for virtually any back-end to be supported.
For simplicity, however, this implementation uses the traditional **YAML front
matter + Markdown** source format, which is common in static site generators
and blog systems.

:::warning[Org mode is not directly supported]

In the AI era, Markdown's momentum continues to grow. As a heavy user of Emacs
Org mode for notes and tasks, it is recognised that Org is a complex format. The
preference is to define the Markdown pipeline via a syntax tree processor for
stability and predictability. While integrating Org mode into the publishing
workflow remains an interest, doing so would require every step of the pipeline
to be specified with precision.

:::

The JavaScript ecosystem includes [unified][unifiedjs], a collection of
libraries for transforming content between various text-based formats. In the
unified world, content is represented as a _syntax tree_. Each format has a
corresponding syntax tree specification, such as `mdast` for Markdown and `hast`
for HTML. By chaining a parser, plugins (transformers) and a compiler
(serialiser), you can create a processor to convert from one format to another.
This enables deeply customisable document conversion pipelines by combining
plugins for different syntax tree specifications. These syntax trees can also be
serialised to JSON, allowing intermediate representations to be persisted.

[unifiedjs]: https://unifiedjs.com/

A technical challenge with Markdown is its lack of a precise standard, leading
to numerous variants. The unified ecosystem addresses this by allowing a
specific Markdown flavour to be defined by combining plugins for
[remark](https://github.com/remarkjs/remark) (for Markdown syntax trees) and
[rehype](https://github.com/rehypejs/rehype) (for HTML). The stability of these
ecosystems makes this a relatively safe and reliable approach.

The remark and rehype plugin ecosystem is rich, and custom plugins can also be
created. Several have already been implemented, including one for generating OGP
link cards. The [Content Style Guide](/post/en/style-guide) is an example post
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
Pipeline in Vite](/post/en/vite-content-pipeline).

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
provide dependency injection), and services can be implemented
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
  detailed in [a dedicated post](/post/en/effect-ogp).

- Building diagrams from text-to-diagram code via external commands. The
  currently supported syntax is [D2](https://d2lang.com/). Its CLI was chosen
  over the official JavaScript library due to reliability issues. While D2's own
  bugs may lead to a switch in the future, adding support for other CLI-based
  diagramming tools is straightforward thanks to Nix and Effect.

The following code example demonstrates the OGP implementation (some parts are
excluded for brevity; see the full source code for details):

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
generator. Syntax errors are logged to the console, and the live preview
updates instantly upon saving changes.

Of course, building the entire site is not as fast as a tool like Hugo. As the
number of posts grows, build times are expected to increase, which will require
further engineering to optimise.

The application is currently monolithic, making it easy to modify. It is
schema-driven, type-safe and highly customisable. The codebase is a standard
front-end application that uses a modern toolchain, including Nix, pnpm, ESLint
(using [antfu's configuration](https://github.com/antfu/eslint-config) for both
formatting and linting), Playwright, Lefthook, GitHub Actions and Renovate.

## Using AI for development

This project has also been an exercise in leveraging AI for development.

The approach is not “vibe-based coding,” but rather a structured process
assisted by AI. Anthropic's Claude (Pro plan) is primarily used for generating
initial code, which has been very helpful. (Usage statistics from
[ccusage][ccusage] will determine whether the subscription is continued.)

[ccusage]: https://github.com/ryoppippi/ccusage

As a developer not experienced in front-end, many questions are asked. For
technical decision-making, Google's Gemini 1.5 Flash is primarily used. While it
is less adept at coding, its fast, neutral responses are excellent for
brainstorming implementation plans. The tools are complementary; for example,
after Claude generated a colour scheme with poor contrast for the dark mode,
Gemini corrected it. The Gemini CLI is also used for improving documentation.

OpenAI models are also used for architecture. The Effect Collections concept was
initially brainstormed with the free version of ChatGPT. GPT-4o (via
[aider][aider]) was used to develop a specification for the [Effect OGP
service](/post/en/effect-ogp). When it generated a syntactically invalid
diagram, Claude was used to fix it, and then again to implement the
specification. After personal refinement of the implementation, Claude was used
to update the spec and Gemini to improve the documentation. It is an iterative,
multi-tool process.

[aider]: https://github.com/Aider-AI/aider/

Several CLI-based AI agents are used (claude, gemini and aider). To streamline
the workflow, a custom Emacs integration was developed that sends prompts from
Org mode files to a terminal session. This creates a consistent interface across
different agents. While Emacs can manage multiple coding sessions simultaneously,
the true bottleneck is human capacity.

Agentic services like [Devin][devin] have not been used, as it is unclear how to
integrate them seamlessly with the Emacs and Org mode environment. Perhaps an
integration will need to be built for it—using another AI.

[devin]: https://devin.ai/

The total monthly spending on AI services is under $50. While many spend more,
this is still a significant cost for most individuals. This will require either
an increase in income or a reconsideration of these subscriptions.

## User experience

Regarding user experience, there is not yet sufficient data. The focus is on
maintaining high Lighthouse scores. While the Accessibility, Best Practices and
SEO scores should be near-perfect, Performance can fluctuate. These metrics will
be monitored closely after the official launch.

## Future work

Many features are planned for the future:

- Feedback mechanisms: Comments, emoji reactions, etc., via APIs or external
  services.
- Integration with my personal Org mode repository.
- Taxonomies: Categories and tags, as found in typical blog systems.
- Search UI, and potentially an MCP server for the content.
- `llms.txt` to provide a way for language models to contact the author.
- Performance optimisations as the content grows.
- AI-driven workflows for content quality control.
- Refactoring the blog system into a reusable engine for other projects.
- Enhancing the Markdown processor to support features like footnotes and
  additional diagram syntaxes.
- Authentication and authorisation to support private content and a paywall.

If you have suggestions, please open an issue.

This will be a valuable experience, regardless of the outcome. As software
development becomes increasingly commoditised, unique projects like this are
more important than ever.
