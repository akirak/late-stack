---
title: Effect OGP Integration
language: en
draft: true
---

## Why another OGP component?

Modern blogs are more than static pages – they are hubs that reference videos,
tweets, papers and other rich resources.  Showing a **preview card** for each
external URL greatly improves user experience, yet fetching metadata *at render
time* is slow and unreliable.  
Our goal is therefore two-fold:

1. **Deterministic builds** – all metadata available in the generated JSON so
   pages are instantly renderable offline or behind a CDN.
2. **Graceful degradation** – if the build has never seen a URL (or the cached
   copy expired) the server can still fetch it on-demand.

---

## 1. Bird’s-eye view

```d2
direction: right

Markdown["Markdown posts"] -> Pipeline[
  shape: component
  label: "Collections Pipeline"
]
Pipeline -> Extract[
  shape: note
  label: "extract external links"
]
Pipeline -> Cache[
  label: "OGP cache (SQLite)"
]
Pipeline -> Fetcher[
  shape: component
  label: "HTTP / HTML fetcher"
]
Fetcher -> Internet[
  shape: cloud
]
Fetcher -> Cache
Cache -> Pipeline
Pipeline -> PostJson[
  shape: database
  label: "Post JSON artefacts"
]
```

The **same** cache and fetcher layers are reused by the server at runtime,
ensuring consistent behaviour across environments.

---

## 2. Data model

Each record keeps just enough to draw a link card while remaining future-proof:

• canonical URL  
• title, description, cover image, site name, content type  
• timestamp of the last fetch  
• “unknown tags” – a bag for provider-specific keys we don’t yet understand

Keeping a timestamp lets us apply a simple *time-to-live* strategy instead of
hard invalidation rules.

---

## 3. Service contracts (in plain English)

OGP Store  
• get(url) → maybe metadata  
• set(metadata)  
• purgeOlderThan(ttl) → rows removed

OGP Fetcher  
• fetch(url) → metadata *or* typed error

Combining them gives **getOgMetadata(url, ttl)** that

1. looks in the store,
2. falls back to the fetcher if missing or stale,
3. writes the fresh copy back.

```d2
sequence: getOgMetadata
Client->OGPService: getOgMetadata(url)
OGPService->Cache: get(url)
Cache->OGPService: miss/stale
OGPService->Fetcher: fetch(url)
Fetcher->Internet: HTTP GET
Internet->Fetcher: HTML
Fetcher->OGPService: metadata
OGPService->Cache: set(metadata)
OGPService->Client: metadata
```

The call never throws – typed failures are propagated as explicit **Effect**
errors, so the pipeline can continue building even if a provider is down.

---

## 4. Storage layer

SQLite is used because:

* single-file, zero-config, battle-tested  
* native JSON column + indexes  
* works the same on a developer laptop, CI runner and Deno Deploy

A 60-day retention policy keeps the file size in check; older rows are purged
once per full build.

Need Redis or Postgres?  Just implement the three Store functions and wire a new
layer – no changes required elsewhere.

---

## 5. Fetcher responsibilities

1. Follow up to 5 redirects, 10 s total timeout, 1 MiB body cap.  
2. Parse *og:* and *twitter:* meta tags, then fall back to `<title>` /
   first `<img>`.  
3. Resolve relative URLs against the final location.  
4. Normalise & validate the result before handing it over.

All network, parsing and validation errors are mapped onto a concise error enum
so that the caller can decide whether to retry later or silently omit the card.

---

## 6. Integration points

Build step  
• remark plugin detects external links → calls **getOgMetadata**  
• metadata is embedded both in the MDAST node (for live preview) and the final
  post JSON

Runtime  
• React route loader calls **getOgMetadata** when rendering an outbound link
  that is not already present in the post JSON (e.g. added via user comments)

```d2
graph TD
  A[Post JSON] -->|contains| B[Link preview component]
  B -->|needs fresh data?| C{cache hit?}
  C -->|yes| B
  C -->|no| D[getOgMetadata()]
  D --> Cache & Fetcher
```

---

## 7. Deployment & CI caching

Local development  
• database lives at `.data/og.sqlite` (git-ignored)

GitHub Actions  
• same file is cached with `actions/cache`; the TTL logic makes the vast
  majority of builds *cache-only*, minimising network traffic and rate-limit
  risks.

Production (Deno Deploy)  
• the populated file is copied into `.output` during `pnpm build` – no runtime
  writes required.

---

## 8. Roadmap

* oEmbed fallbacks for Twitter, SoundCloud, etc.  
* `pnpm og:purge` CLI to manually clear the cache.  
* Scheduled GitHub Action refreshing stale rows weekly.  
* Optional CDN layer for anonymous prod traffic.

---

### Credits

The initial idea was drafted with Gemini 2.5 Flash; this document captures the
refined, implementation-ready architecture while keeping all code in the source
tree DRY. Thanks o3!

A metadata schema for each resource is defined in an Effect-TS schema.
It is decoded from a JSON object, loaded from a KVS cache.

The schema supports the common OGP tags.

## Define a generic interface for the OGP service

An OGP service provides a function that returns the OGP metadata for a URL. It
is defined as an Effect service. It is backend-agnostic; That is, its HTTP
client and the KVS is swappable by providing an implementation
meeting the interface.

## Define a key-value store for storing OGP metadata

A key-value store is also defined as an Effect service. You can use a different
backend storage, e.g. native in-memory, relational database, Redis, etc. This
time, I will use SQLite, because it is lightweight, battle-tested, and requires
no server hosting.

:::note

SQLite supports JSON fields. Storing the metadata object as a JSON allows
partial fetching and filtering, unlike storing the entire object as a serialized
string. Though it implies slight performance overhead, this will be convenient
for listing particular types of sources for the entire site, for example. Thus I
will define the KVS to have JSON object values.

:::

## Provide an implementation

Provide implementation for the generic Effect services.

## Integration

The entire OGP service is integrated into the build pipeline. The build pipeline
itself is already an Effect service (or layer), so the OGP service will be
injected as a dependency.

## Deployment

For local development, just keep the database file privately without committing
it to the repository.

On GitHub Actions CI, the database file is persisted across workflow runs using
the official cache action, i.e. `actions/cache`. It needs to be configured to
achieve cross-branch cashing.

## How I came up with this plan

I initially brainstormed this architecture through chatting with Gemini 2.5
Flash. Gemini doesn't have an accurate understanding of the latest version of
Effect, so I had to get involved in the details.
