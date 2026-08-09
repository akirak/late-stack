# A Personal Blog with the LATE Stack

A modern blog built with the LATE Stack, featuring a sophisticated content
management system powered by Effect and TanStack Start.

[Now in production on Cloudflare Workers](https://jingsi.space/).

## What is the LATE Stack?

The **LATE Stack** consists of:

- [**L**ightning CSS](https://lightningcss.dev/) - Modern, extremely fast CSS parser and transformer
- [React **A**ria](https://react-spectrum.adobe.com/react-aria/) - Best-in-class accessibility components
- [**T**anStack Start](https://tanstack.com/start/) - Full-stack React framework with type-safe routing
- [**E**ffect](https://effect.website/) - Batteries-included functional programming framework for TypeScript

This stack enables the development of full-stack applications with end-to-end
type safety, prioritizing maintainability and developer experience.

## Key Features

- **Content Collections**: Astro-inspired content management with Effect schemas
- **Type-Safe Routing**: Full type safety from content to routing parameters
- **Build-Time Processing**: Markdown → MDAST → HAST → JSON pipeline ([unified](https://unifiedjs.com/))
- **Multilingual Support**: Language codes in frontmatter with separate JSON files
- **Custom Remark Plugins**: Enhanced Markdown processing with OGP metadata fetching
- **Effect-Powered Pipeline**: Concurrent, robust content processing with proper error handling

The web site is deployed to [Cloudflare Workers](https://workers.cloudflare.com/).

## Architecture

The blog uses a collections-based architecture that processes Markdown files
with YAML frontmatter into JSON data at build time. The content pipeline runs
during development via Vite plugin and processes multilingual content with draft
filtering.

For detailed technical background, see the [LATE Stack blog post](https://jingsi.space/posts/en/start-blog-late).

Also see [CLAUDE.md](./CLAUDE.md).

## Cloudflare deployment

The build uses Nitro's Cloudflare module preset. The content pipeline still
writes post data to `data/posts/*.json` and `data/posts.index.jsonl`. During the
build, `virtual:collections-data` embeds those files in server-only Worker
modules, so serving posts does not require filesystem access or an R2 bucket.
They are available to Worker code through the collections API, but are not
published as browser-readable static files. Static client assets are served
through the Worker's `ASSETS` binding.

```sh
pnpm build
pnpm start   # Preview the production Worker locally with Wrangler
pnpm deploy  # Deploy with Wrangler
```

The GitHub Actions deployment requires `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` repository secrets. The API token must be allowed to edit
Workers scripts for the account.

## License

See [LICENSE.txt](./LICENSE.txt).
