export function isRunningInDeno() {
  return "Deno" in globalThis
}

export function isRunningInBrowser() {
  return typeof globalThis.window !== "undefined" && typeof document !== "undefined"
}
