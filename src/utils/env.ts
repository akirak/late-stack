declare namespace globalThis {
  const Deno: any | undefined | null

  const window: Window | undefined | null
}

export function isRunningInDeno() {
  return typeof globalThis.Deno !== "undefined" && globalThis.Deno !== null
}

export function isRunningInBrowser() {
  return typeof globalThis.window !== "undefined" && typeof document !== "undefined"
}
