---
title: Effect OGP Integration
language: en
draft: true
---

## Define an Effect schema for metadata

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
