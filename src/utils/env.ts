declare namespace globalThis {
  const Deno: any | undefined | null
}

export function isRunningInDeno() {
  return typeof globalThis.Deno !== 'undefined' && globalThis.Deno !== null
}
