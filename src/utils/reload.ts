export const useRouteReload = import.meta.hot
  // eslint-disable-next-line antfu/no-top-level-await
  ? (await import("./reload.vite-dev")).useRouteReload
  : () => { }
