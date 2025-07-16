# A Personal Blog with the LATE Stack

A modern blog built with the LATE Stack, featuring a sophisticated content
management system powered by Effect and TanStack Start.

## What is the LATE Stack?

The **LATE Stack** consists of:

- [Lightning CSS](https://lightningcss.dev/) - Modern, extremely fast CSS parser and transformer
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - Best-in-class accessibility components
- [TanStack Start](https://tanstack.com/start/) - Full-stack React framework with type-safe routing
- [Effect](https://effect.website/) - Batteries-included functional programming framework for TypeScript

This stack enables the development of full-stack applications with end-to-end
type safety, prioritizing maintainability and developer experience.

## Key Features

- **Content Collections**: Astro-inspired content management with Effect schemas
- **Type-Safe Routing**: Full type safety from content to routing parameters
- **Build-Time Processing**: Markdown → MDAST → HAST → JSON pipeline ([unified](https://unifiedjs.com/))
- **Multilingual Support**: Language codes in frontmatter with separate JSON files
- **Custom Remark Plugins**: Enhanced Markdown processing with OGP metadata fetching
- **Effect-Powered Pipeline**: Concurrent, robust content processing with proper error handling

The web site is deployed to [Deno Deploy](https://deno.com/deploy).

## Architecture

The blog uses a collections-based architecture that processes Markdown files
with YAML frontmatter into JSON data at build time. The content pipeline runs
during development via Vite plugin and processes multilingual content with draft
filtering.

For detailed technical background, see the [LATE Stack blog post](src/contents/posts/start-blog-late.md).

Also see [CLAUDE.md](./CLAUDE.md).

## License

See [LICENSE.txt](./LICENSE.txt).
