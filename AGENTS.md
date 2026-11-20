# Repository Guidelines

## Project Structure & Module Organization

This is a React, TypeScript, and Vite ticket management application. Application entry points are `src/main.tsx` and `src/App.tsx`; shared styles live in `src/index.css`. Feature and reusable UI components are grouped under `src/components/` by domain (`tickets/`, `dashboard/`, `services/`, `employees/`, `companies/`, `settings/`, `auth/`, and `common/`). Shared Zustand state is in `src/store/`; shared types and helpers are in `src/types/` and `src/utils/`. Static assets belong in `public/`.

## Build, Test, and Development Commands

Run `npm install` to install dependencies, then:

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript project checks and creates the production bundle in `dist/`.
- `npm run lint` runs Oxlint.
- `npm run preview` serves the built bundle locally for review.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing two-space indentation and double-quoted strings. Prettier is configured with the Tailwind plugin; keep utility classes in its canonical order. Use PascalCase for component files and component names (for example, `TicketDetailView.tsx`), camelCase for helpers, hooks, and variables, and `.test.ts`/`.test.tsx` for tests. Keep feature-specific UI in its domain folder and reusable UI in `common/`.

## Testing Guidelines

No automated test suite is currently configured in this repository.

## Commit & Pull Request Guidelines

Recent history uses short imperative subjects, with some Conventional Commit prefixes such as `feat(tickets): ...`; use a concise scope where it helps (for example, `fix(dashboard): correct ticket count`). Pull requests should summarize user-visible behavior and implementation, link related issues when available, and include screenshots for visual changes. Note relevant test and build results and any configuration changes.

## Configuration & Generated Files

Keep environment-specific secrets out of source control. Use `package.json` for scripts and dependency changes. Treat `dist/` and `node_modules/` as generated/local output; do not commit them.
