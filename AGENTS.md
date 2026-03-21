# Project AGENTS.md

## Validation requirements

- Run `pnpm lint` and `pnpm typecheck` before committing any change. Both must pass.
- Run `nix develop .#node-build -c pnpm build` before submitting a PR. The build must pass.
