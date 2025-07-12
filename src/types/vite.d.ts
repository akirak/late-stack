/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot?: {
    readonly data: any
    accept: (() => void) & ((cb: (mod: any) => void) => void) & ((dep: string, cb: (mod: any) => void) => void) & ((deps: readonly string[], cb: (mods: any[]) => void) => void)
    dispose: (cb: (data: any) => void) => void
    decline: () => void
    invalidate: () => void
    on: (event: string, cb: (...args: any[]) => void) => void
    send: (event: string, data?: any) => void
  }
}
