---
name: staff-workbench-ui
description: Design and build standalone controls, reusable UI components, and complete screens using compact portal UI patterns. Covers the TechNova UI inventory and applies across product domains. Invoke explicitly for component design, implementation, or review.
---

# Portal UI components

Build the requested element around the target product’s data, theme, and existing UI primitives. A component should work on its own and drop into a page without depending on a particular sidebar, workflow, route, or store. Adapt the reference’s visual hierarchy and density with the target product’s own identity.

## Find the component pattern

- Use the recipes below for dense data tables, dropdowns and comboboxes, and KPI cards.
- Read [Controls and feedback](references/controls-and-feedback.md) for buttons, links, iconography, typography, badges, avatars, fields, switches, date and file inputs, tag inputs, help, loading, notifications, and toasts.
- Read [Surfaces and navigation](references/surfaces-and-navigation.md) for search, pagination, banners, cards, tabs, timelines, dialogs, menus, navigation, and common feature compositions. It maps the reusable patterns to the TechNova screens that use them.
- For a component absent from the inventory, start with its nearest pattern. Match its spacing, hierarchy, focus, and state conventions, then add a named variant to an existing UI primitive when appropriate.

## Shared visual rules

- Use light, neutral surfaces for dense content, a faint cool border for separation, and a strong foreground for the primary label. Use a darker surface where an action or summary needs extra emphasis. Apply elevation sparingly to cards and popups.
- Favor a compact type hierarchy with legible body text and quieter supporting text. Use line icons from one icon family at a consistent size. Use text labels for states, including those distinguished by color.
- Start with a 4 px spacing rhythm, 8–12 px gaps between related controls, and 8–12 px radii for controls and cards. Treat recipe measurements as starting values and align them with the host theme. Use semantic tokens for surface, border, muted text, focus, and status colors.
- Reuse the host’s primitives and states. Keep sizing, variants, and basic interactions in the reusable UI layer. Pass data and callbacks from the caller. In TechNova, use `src/ui/barrel.ts` to find the exported API and follow `AGENTS.md`. Compose atoms into molecules, groups, and sections. Keep routes, permissions, store access, and screen layout in feature code.

## Data table

- Compose optional toolbar, header row, body, and optional footer on one continuous surface. Use a pale header strip, muted compact column labels, white rows, and thin horizontal dividers. Start with 12–16 px horizontal cell padding and rows around 44–56 px for typical one- or two-line content. Let longer labels wrap where needed.
- Give the identifying column most of the flexible width. Use a semibold main label and an optional smaller secondary line, such as an identifier or subtitle. Keep badges, dates, and row actions compact. Right-align comparable numbers and align repeated action buttons consistently. A small, high-contrast Open or View action fits a detail column.
- Add a toolbar only when the task needs one. Put labeled search and filters first, with refresh or the main action at the end. Wrap controls at narrow widths. Add a result range, page controls, and page size in the footer when pagination is useful. On filter changes, reset the page and update the visible range.
- Use semantic table markup and give sortable headers and row actions clear accessible names. Follow host rules for row selection and opening, with an explicit keyboard-accessible action. Support loading, empty, no-match, and error states where applicable. Let the table scroll locally or prioritize columns at narrow widths, keeping the important state and row action reachable.

## Dropdown and combobox

- Use a compact dropdown for a short list and a searchable combobox for a longer list. Set the visible label above a form field or beside an inline filter. Use a light outlined trigger, selected label toward the start, and a small chevron at the end. Start around 36–40 px high and make room for the longest common label. Use an “All” option with a count only when the set and count are meaningful.
- Anchor a bordered, lightly elevated popup to the trigger. Match its width as a starting point, keep options left-aligned, and use a bounded scroll area for long lists. Add search within the popup or use the editable field as the search input, depending on the existing primitive. Show a clear selected state and a separate active highlight. Provide a short no-match message for filtered results.
- Keep the current selection visible after dismissing the popup. Make the control operable with arrow keys, Enter, and Escape. Give it an accessible name and expose its expanded and selected states through the host’s accessible primitive. Show a visible focus ring and provide a clear or reset action when the field allows it.

## KPI card

- For the full tile, use a light surface, subtle border, rounded corners, and a narrow semantic accent across the top. Center a tinted icon tile, a large bold value, a short strong label, and an optional muted scope line in that order. Useful starting sizes are a 3–4 px accent, 32–36 px icon tile, and 24–32 px value.
- For a denser strip, use the existing `KpiCard` pattern with a leading tinted icon and value and label on the same line. Keep any detail essential to interpreting the count visible.
- For a compact counter inside a strong-colored surface, use a softly tinted panel with a small label above the value. Keep both sizes based on the same label, value, and tone model. Use a limited palette and consistent meaning across a set.
- Let a grid stretch related cards to equal height and reflow when labels or values no longer fit. Make the entire card one focusable link or button when it has a destination or action. Render static cards as content. Show zero as a real value and use a distinct loading or unavailable state when needed.

## Supporting elements and verification

- For a standalone request, deliver the component and the states required by its caller. Compose a toolbar, banner, rail, or broader workspace when requested. Verify the component with realistic long labels, narrower space, keyboard focus, and applicable empty or selected states. Use sample data from the target domain.
- The reference shows light KPI tiles with colored top edges, tinted counters in a dark banner, and compact tables with search, filter controls, and pagination. The popup and keyboard behavior above are implementation guidance.
