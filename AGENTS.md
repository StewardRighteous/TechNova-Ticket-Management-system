# Project Rules

React + TypeScript + Vite ticket app.

- Entry: `src/main.tsx`, `src/App.tsx`; styles: `src/index.css`.
- Features: `src/components/`; state: `src/store/`; types/helpers: `src/types/`, `src/utils/`; assets: `public/`.
- Use function components, TypeScript, two-space indentation, double quotes, PascalCase components, camelCase helpers/hooks/variables.
- Define new UI elements in `src/ui/`. Compose feature screens and set their final layout in `src/components/` or the app shell.
- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.
- Keep secrets out of source control. Do not commit `dist/` or `node_modules/`.
- Use concise imperative commit messages; PRs summarize behavior, tests/build status, config changes, and screenshots for visual work.

## UI Architecture

- `src/ui/atoms/` owns individual controls and text styles such as `Button`, `Checkbox`, `Label`, `Heading`, and `Input`.
- `src/ui/molecules/` combines atoms into small patterns such as `CheckboxField`, `CallToAction`, `TableSearch`, and `FormField`.
- `src/ui/groups/` composes controls and small patterns into widgets such as `SelectDropdown`, `ComboboxFilter`, KPI cards, and notification lists.
- `src/ui/sections/` assembles larger reusable regions such as `DataTable`, including its toolbar, rows, and pagination.
- Higher UI layers compose lower layers. UI accepts data, content, variants, and callbacks through props. Feature components own business rules, permissions, routing, store access, and page layout. UI modules may own local interaction state such as focus and whether a popup is open.
- Reuse an existing `src/ui/` element or extend it with a named variant before adding a new one. Build new controls and presentation patterns in `src/ui/`, including patterns with only one current caller. Define shared appearance and interaction states in UI elements and theme tokens. Feature code may set placement, spacing between elements, responsive arrangement, and feature-specific content.
- Keep native controls, links, headings, labels, dialogs, and table markup inside `src/ui/`. Feature code may use semantic layout wrappers. When a new presentation pattern is needed, implement it as a UI element and compose it in the feature.
- Import dependencies within `src/ui/` directly from the same or a lower layer. Use `src/ui/barrel.ts` for consuming UI from features. Keep UI independent of the app entry, store, and feature modules.
- Run `npm run lint` before submitting UI changes. Its architecture check also runs on its own with `npm run lint:ui`.

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
