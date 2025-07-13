---
title: Content Pipeline in Vite
language: en
draft: true
---

:::warning[AI Generated Content]

This post was originally written by human but has been edited by AI to improve
writing.

:::

To create a content processing pipeline that runs within Vite's development
server and build process, we can build a custom Vite plugin. This plugin
leverages the Effect library to manage concurrent workflows, creating a robust
and maintainable system.

This document outlines the integration mechanism, covering the plugin's
lifecycle, its API, and the hot-reloading process.

## API

The pipeline is exposed through a Vite plugin, `collections`, which you can
configure in your `vite.config.ts`.

Synopsis:

```ts
collections({
  contentDir: path.resolve(root, "src/contents"),
  outDir: path.resolve(root, "data"),
})
```

The `collections` function accepts the following options:

- `contentDir`: The directory containing the source content files.
- `outDir`: The directory where generated files will be placed.

## Reloading

When a file is modified during development, the plugin processes the change and
notifies the client to reload the relevant parts of the application.

:::diagram[File modification event]

```d2
shape: sequence_diagram

user: {
  shape: person
}
browser: Browser
file: {
  shape: page
}
vite: Vite plugin
effect: Pipeline service

user -> file: edit file
file -> vite: file event
vite -> effect.process: trigger rebuild
effect.process -> vite: return routes to update

vite -> browser.reload: notify route updates
browser.reload -> user: display updated content
```

:::

### RouteUpdate event

When a file changes, the plugin sends a `RouteUpdate` event to the client. This
object's structure is defined as follows:

```ts title="src/dev/types.ts"
export interface RouteUpdate {
  type: "reload" | "delete"
  matchRoute: MatchRoute
}
```

`MatchRoute` is a data structure used to identify which application route is
affected by the change. In a TanStack Router application, the `useMatchRoute`
hook can use this data to determine if the current page needs to be updated.

### Triggering reload

The Vite plugin's `handleHotUpdate` function triggers a reload by sending a
custom HMR event:

```ts
function reload(entries: RouteUpdate[]) {
  ctx.server.hot.send({
    type: "custom",
    event: "routes-reload",
    data: {
      entries,
    },
  })
}
```

For example, modifying a blog post source file sends the following payload over
the WebSocket. This payload notifies the client to reload the post itself, as
well as any pages that list posts:

```ts
ctx.server.hot.send({
  type: "custom",
  event: "routes-reload",
  data: {
    entries: [
      {
        type: "reload" as "reload" | "delete",
        matchRoute: {
          to: "/post/$lang/$slug",
          params: {
            slug: postMetadata.slug,
            lang: postMetadata.language,
          },
        },
      },
      {
        type: "reload",
        matchRoute: {
          to: "/post/$lang",
          params: {
            lang: postMetadata.language,
          },
        },
      },
      {
        type: "reload",
        matchRoute: {
          to: "/post",
        },
      },
    ],
  },
})
```

### Receiving the reload event inside a React application

On the client, a custom React hook, `useRouteReload`, listens for these HMR
events and invalidates the relevant data, prompting TanStack Router to refetch
and re-render:

```ts
import type { RouteUpdate } from "@/dev/types"
import { useMatchRoute, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

export function useRouteReload() {
  const router = useRouter()
  const matchRoute = useMatchRoute()

  useEffect(() => {
    import.meta.hot!.on("routes-reload", ({ entries }: { entries: RouteUpdate[] }) => {
      if (entries.some(entry => entry.type === "reload" && matchRoute(entry.matchRoute))) {
        router.invalidate()
      }
    })
  }, [matchRoute, router])
}
```

Support for `remove` events is not implemented yet.

## Lifecycle Events

The Vite plugin hooks into Vite's lifecycle to manage the content pipeline. The process flow is illustrated below.

:::diagram[Life cycle of the Vite plugin]{.scrollable}

```d2
shape: sequence_diagram

Vite Server Start: {
  shape: diamond
}

config(): {
  shape: rectangle
  label: "config()\nInitialize runtime\nCreate output directory"
}

buildStart(): {
  shape: rectangle
  label: "buildStart()\nProcess all content files\nGenerate collection data"
}

Dev Server Running: {
  shape: diamond
  label: "Dev Server\nRunning"
}

File Change Event: {
  shape: diamond
}

handleHotUpdate(): {
  shape: rectangle
  label: "handleHotUpdate()\nCheck file existence\nProcess changed file\nSend HMR event"
}

File Exists?: {
  shape: diamond
}

handleFileChange(): {
  shape: rectangle
  label: "handleFileChange()\nProcess modified/added file"
}

handleFileDeletion(): {
  shape: rectangle
  label: "handleFileDeletion()\nCleanup deleted file data"
}

Send HMR: {
  shape: rectangle
  label: "Send HMR Event\nNotify client of changes"
}

Vite Server Start -> config()
config() -> buildStart()
buildStart() -> Dev Server Running
Dev Server Running -> File Change Event
File Change Event -> handleHotUpdate()
handleHotUpdate() -> File Exists?
File Exists? -> handleFileChange(): "Yes"
File Exists? -> handleFileDeletion(): "No"
handleFileChange() -> Send HMR
handleFileDeletion() -> Send HMR
Send HMR -> Dev Server Running
```

:::

The key phases are:

- **Initialization**: Setting up the Effect runtime and creating necessary directories.
- **Initial Build**: Processing all content files and generating collection data.
- **Hot Reload**: Watching for file changes and incrementally updating collection data.
