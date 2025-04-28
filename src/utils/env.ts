const Deno = globalThis.Deno as any | undefined | null
const window = globalThis.window as Window | undefined | null

export function isRunningInDeno() {
  return typeof Deno !== "undefined" && Deno !== null
}

export function isRunningInBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined"
}
