# Project Rules

React + TypeScript + Vite ticket app.

- Entry: `src/main.tsx`, `src/App.tsx`; styles: `src/index.css`.
- Features: `src/components/`; state: `src/store/`; types/helpers: `src/types/`, `src/utils/`; assets: `public/`.
- Use function components, TypeScript, two-space indentation, double quotes, PascalCase components, camelCase helpers/hooks/variables.
- Keep feature UI in its domain folder and reusable UI in `common/`.
- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.
- Keep secrets out of source control. Do not commit `dist/` or `node_modules/`.
- Use concise imperative commit messages; PRs summarize behavior, tests/build status, config changes, and screenshots for visual work.

## UI Rules

1. Remove extra background and padding. Add only when instructed.
2. Never use native selects. Use modern dropdowns for 2–3 categories; combo boxes for more.
3. Banner title followed by status label.
4. Banner top corner: buttons or nothing else.
5. Every dialog: title, fields, Cancel, Save.
6. Do not repeat anything twice on one page.
7. Table row: double-click opens; single-click selects.
8. Banner includes Delete with confirmation verification box.
9. Avoid excessive page scrolling.
10. Separate excessive data into tabs.
11. All created data editable except ID.
