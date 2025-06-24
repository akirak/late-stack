import { Data } from "effect"

export interface Loc {
  line: number
  column?: number
}

export class RemarkPluginDataError extends Data.TaggedError("RemarkPluginDataError")<{
  plugin: string
  loc?: Loc
  message: string
}> {}

export class PostError extends Data.TaggedError("PostError")<{
  filePath: string
  loc?: Loc
  message: string
}> {}
