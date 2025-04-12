import { Context } from "effect"

export class Config extends Context.Tag("Config")<
  Config,
  {
    readonly contentDir: string
    readonly outDir: string
    readonly production: boolean
  }
>() { }
