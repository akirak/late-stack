# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

```bash
pnpm dev              # Start development server (port 3000)
pnpm build            # Build for production (Deno Deploy preset)
pnpm start            # Start production server (port 8000)
pnpm deploy           # Deploy to Deno Deploy
```

### Quality & Testing

```bash
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint checking
pnpm lint-fix         # ESLint with auto-fix
pnpm test-e2e         # Run Playwright tests (all browsers)
pnpm test-e2e:chromium # Run Playwright tests (Chromium only)
```

## Architecture Overview

For details of the architecture, see <./src/contents/posts/start-blog-late.md>.

This is a blog built with **TanStack Start** (React framework) featuring a sophisticated content management system powered by **Effect** (functional programming library).

### Content Pipeline System

The blog uses a collections-based architecture that processes Markdown files into JSON data:

- **Source**: `src/contents/posts/*.md` with YAML frontmatter
- **Processing**: `src/dev/collections-pipeline.ts` orchestrates file watching and processing
- **Output**: `/data/posts/` containing `{slug}.{lang}.json` files and `posts.index.jsonl`

The content pipeline runs during development via Vite plugin (`vite/plugins/collections.ts`) and processes:

1. Markdown → MDAST → HAST → JSON conversion
2. Multilingual support (language codes in frontmatter)
3. Draft filtering (drafts excluded in production)

The call of the pipeline is build-time only. Effect services are defined in
`src/dev` directory. Use `@effect/platform` and `@effect/platform-node`
libraries where possible, which are available at build time.

To get a list of contents, prefer using functions from src/collections.

#### Custom Remark plugins

There are custom remark plugins that are defined for this project.
They reside in `src/dev/unified`.
Examples should be added to `src/contents/posts/markdown-showcase.md`.

#### OGP Integration

In the MDAST pipeline, the OGP metadata of linked sources are fetched.
See <src/contents/posts/effect-ogp.md>.

#### Feeds

For RSS feeds, prefer the Atom 1.0 format.

### Data Fetching API

Located in `src/collections/posts/`:

- `getPost(slug, lang)` - Fetch individual post with content
- `getPostList(filters, pagination)` - Fetch post metadata with filtering

Both use **Effect Schema** for runtime validation (`src/schemas/post.ts`).

### Routing Structure

File-based routing with TanStack Router:

```
/                           # Homepage
/about[/{lang}]             # About page (optional language)
/_blog/                     # Blog layout wrapper
  /post/{lang}/{slug}       # Individual blog post
  /_archive/                # Archive layout
    /post[/{lang}]/         # Post archive (optional language filter)
```

Routes use type-safe loaders and server-side data fetching.

### Key Technologies

- **TanStack Start**: Full-stack React framework
- **Effect**: Functional programming for robust data pipelines
- **Vinxi**: Build tool (successor to Vite for full-stack apps)
- **Lightning CSS**: Fast CSS processing
- **Playwright**: E2E testing across browsers

### Content Format

Posts use Markdown with YAML frontmatter:

```yaml
---
title: Post Title
language: en
publicationDate: "2024-01-01T12:00:00+09:00"
draft: false # optional, defaults to false
---

Markdown content here...
```

### SEO

Make sure the following `head` is specified with `pageMeta` (from `@/utils/seo`)
in each individual route, except for the top `index.tsx`, e.g.:

```typescript
head: ({ loaderData }) => ({
  meta: pageMeta({
    ogType: "article",
    title: loaderData!.post.title,
  }),
})
```

`title` and `ogType` are mandatory. `description` is optional but recommended.

### Optimize loading

Load only necessary font sets.

System Font (--font-system: "Manrope", system-ui, ...):

- 400 (--font-normal) - Used for body text
- 500 (--font-medium) - Used for tags and buttons
- 600 (--font-semibold) - Used for strong/bold text and headings

Serif Font (--font-serif: "Source Serif 4", serif):

- 600 (--font-semibold) - Used for all headings (h1, h2, h3, h4, h5, h6)

Mono Font (--font-mono: "DM Mono", "Monaco", "Menlo", "Consolas", monospace):

- 400 (default/normal) - Used for code blocks and inline code (no explicit
 font-weight specified, so it uses the default weight)

### Development Notes

- Content changes trigger hot reload via the collections pipeline
- The system supports multiple languages with separate JSON files per language
- All data fetching is type-safe using Effect Schema validation
- Tests run against both dev (port 3000) and production (port 8000) servers
- Nix flake provides reproducible development environment
- When you update `vite.config.ts`, also update `vite.config.ladle.ts` to keep
  it in sync.
