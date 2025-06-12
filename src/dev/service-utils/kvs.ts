import type { Effect, Option } from "effect"
import { Data } from "effect"

export class KvsError extends Data.TaggedError("KvsError")<{
  readonly key?: string
  readonly message: string
}> { }

export interface Envelope<T> {
  createdAt: Date
  data: T
}

export interface Kvs {
  readonly get: (key: string) => Effect.Effect<Option.Option<Envelope<unknown>>, KvsError>
  readonly set: (key: string, value: unknown) => Effect.Effect<void, KvsError>
  readonly delete_: (key: string) => Effect.Effect<void, KvsError>
}
