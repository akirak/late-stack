# Guidelines for Developing This Blog

### Commands
- Dev: `pnpm run dev`
- Build: `pnpm run build`
- Check: `pnpm run typecheck` and `pnpm run lint-fix`

### Code Style
- Package manager: pnpm
- Framework: TanStack Start
- TypeScript: Use Effect-TS for data validation and manipulation (Schema, Option, Array, etc.)
- UI: Use vanilla CSS for styling. src/styles/app.css defines cascade layers.
- Formatting: Double quotes, no semicolons, 2-space indent
- Updating routes: After you create a new file in src/routes, run `pnpm run dev` to update routeTree.gen.ts.
