# Repository Guidelines

## Project Structure & Module Organization

This React + TypeScript application uses Vite. Entry points are `src/main.tsx` and `src/App.tsx`. Organize UI by feature under `src/components` (for example, `tickets`, `dashboard`, and `auth`), with shared UI in `common` and layout elements in `layout`. Keep Zustand state in `src/store`, shared types in `src/types`, helpers in `src/utils`, demo data in `mockup.json`, and static assets in `public`.

Follow `RULES.md`: keep components under roughly 200 lines, use related folders and barrel `index.ts` exports, and move data out of JSX/TypeScript when it belongs in the mock data model.

## Build, Test, and Development Commands

Run these commands from the repository root:

- `npm install` — install dependencies from `package-lock.json`.
- `npm run dev` — start the Vite development server with hot reload.
- `npm run build` — run the TypeScript project build and create the production bundle in `dist`.
- `npm run lint` — run Oxlint against the project.
- `npm run preview` — serve the built `dist` output locally for a production-style check.

There is no automated test framework or `npm test` script. Validate UI changes manually with `npm run dev`, then run build and lint checks.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Format with Prettier (`.prettierrc`) and its Tailwind class sorter; use two-space indentation. Name components in PascalCase (`TicketDetailView.tsx`), utilities and stores in camelCase (`rolePermissions.ts`), and hooks with a `use` prefix. Prefer explicit, shared types and nearby Tailwind conventions.

## Testing Guidelines

No test runner or coverage threshold is configured. Exercise affected screens and interactions in the dev server, then run `npm run lint` and `npm run build`. If tests are added, keep them near the feature and add an npm script.

## Commit & Pull Request Guidelines

Recent commits use short, lowercase summaries such as `fix: tickets table` and `redesign ticket details page`. Follow that style, optionally using `fix:` or `redesign:`. Keep commits focused. Pull requests should describe the user-visible change, list validation commands, link issues when applicable, and include UI screenshots or a short recording.

## Data and Configuration Safety

Do not casually rewrite `mockup.json`; add only data consistent with the current model. Keep secrets and environment-specific values out of source control, and review `dist` or generated files before committing.
