# Surfaces and navigation

Use these patterns for elements that group content and controls. Build the smallest composition that fits the request. Use the host theme for the accent, surface, typography, and spacing.

## Navigation, search, and views

| Element | Recipe | TechNova reuse point |
| --- | --- | --- |
| App shell and sidebar | Use a strong navigation surface with left-aligned icons and labels. Mark the current destination with a tinted row and a clear visual marker. Group occasional destinations with a disclosure button that exposes its expanded state. Keep collapsed items named and move navigation into a reachable mobile surface when needed. | `SidebarAccordionGroup`; see `Sidebar` and `Layout` |
| Utility header, account, and menus | Put page context first and group shortcuts, unread counts, and account at the end. Keep badges visually attached to the trigger. Anchor the menu and return focus to the trigger after dismissal. Use an actual menu pattern for a command list and a popover or disclosure for mixed content. | `Button`, `StaffAvatar`, `NotificationPopover`; see `Header` |
| Breadcrumb and back link | Keep the parent link distinct and identify the current location. Allow the current label to wrap or truncate without hiding the parent or squeezing utility buttons out. Preserve useful list context on return. | `Breadcrumb`, `ActionLink` |
| Tabs and view controls | Use a visible indicator and text for the active tab. Associate each tab with its panel and support keyboard movement. For exclusive filters, use a labeled selection group with a clear current value. Keep selected state visible beyond hover. | `Button`; see `TabbedTimeline`, `VolumeBreakdownCards`, and `DashboardChannelFilters` |
| Search and table toolbar | Pair a leading search icon with a named field and a clear action when needed. Keep search and filters together, add refresh only when useful, and reserve the end of the toolbar for the primary action. Let it wrap before reducing the field to icon width. | `TableSearch`, `TableHeaderSection`, `TableToolbar` |
| Result table and pagination | Use the main skill’s table recipe. Use `SortableTableHeader` for sorting where supported. Keep result range near the page controls, mark the current page, disable unavailable directions, and keep page size distinct from page navigation. | `DataTable`, `TableHead`, `TableBody`, `TableRow`, `TableHeader`, `TableCell`, `SortableTableHeader`, `NumericPagination` |

## Surfaces and overlays

| Element | Recipe | TechNova reuse point |
| --- | --- | --- |
| Summary and detail banner | Use a strong surface with a concise title followed by its status. Anchor the entity icon at the start. Reserve the top corner for actions, keep metadata in a separate strip, and give key values room to wrap. Use an allowed Delete action with verification in TechNova. | `DetailBanner`; see `DashboardBanner`, `HeroBanner`, `TicketBanner`, and the detail hero components |
| Record card and interactive row | Lead with the name or subject and place the most useful secondary fact alongside or below. Use a subtle boundary and include a second action only where the record needs one. Match hover and focus treatment and avoid nested interactive controls. | `InteractiveListRow`; see `CompanyCard`, `EmployeeCard`, `ServiceCard`, and `TicketListItem` |
| KPI, breakdown, and attention cards | Use the main skill’s KPI recipe. Give ranked or grouped data a compact heading, aligned labels and values, and a shared scale for bars where comparisons matter. An attention card should name the issue, show its count, and offer a clear next action when available. | `KpiCard`; see `DashboardStatsRow`, `ExecutiveKpiRibbon`, `VolumeBreakdownCards`, and `HighAttentionTicketsTable` |
| Detail panel, activity, and timeline | Group information by purpose. For events, align a compact marker and timestamp with a description, actor, and supporting detail. For ordered stages, distinguish completed, current, and upcoming with a marker and label. Keep history, notes, and activity easy to scan and use tabs when needed. | See `IssueOverviewCard`, `OwnershipCard`, `TicketActionSidebar`, `TicketDetailsPanel`, `TicketTimeline`, `TicketHistoryPanel`, `TicketNotesPanel`, and `TicketAssignmentProgress` |
| Dialog and edit form | Use a titled, bounded surface with a readable backdrop. Keep the body scrollable on small screens and the actions reachable. Show labeled fields with Cancel and Save for edit dialogs. Verify focus on open, Escape behavior, and focus return. Preserve the draft when saving fails. | `Dialog`, `DetailEditDialog`, `FormActions` |
| Confirmation and deletion | State the effect and identify the record. Use a specific confirm label. For TechNova permanent deletion, require the displayed verification phrase and keep the danger action disabled until it matches. Give Cancel an obvious place. | `ConfirmationDialog`, `DeleteDialog` |
| Full-page and multistep create form | Use the page title and a predictable body width. Group longer forms by subject, keep the action row in a consistent position, and display field validation by the affected input. Use Continue for intermediate progression and save the record only at the final submit. Preserve earlier input when moving back. Treat immutable identifiers as read-only. | `EntityCreatePage`, `FormField`, `FormActions`, `StepAction` |

## Feature compositions

Use these combinations when a request names a feature or a pattern exists in feature code. New reusable presentation belongs in the target UI layer, with business rules supplied by the feature.

| Feature | UI composition |
| --- | --- |
| Dashboard and recent activity | Compose a compact banner, scoped counters, filter controls, volume breakdown, attention table, and activity list as the request requires. Give actionable counts a clear destination and matching filter. |
| Ticket registry, creation, and detail | Compose a filter toolbar and table or dense list. Use a create page for entry and a status banner for detail. Group ownership, issue overview, assignment progress, notes, and history into readable panels. For an SLA countdown, show the deadline state in words and keep the exact due time available. For outbound notification forms, show recipient and message context before submission. |
| Companies, employees, and services | Reuse the same list and detail structure for entity tables, cards, banners, and editors. Let the feature supply record-specific identity, status, fields, and permissions. Company contracts and subscriptions can use a compact table, an edit action, and a short configuration dialog. Keep SLA units and policy overrides visible alongside their values. |
| Settings | Group related rows under concise headings. Put each label and supporting detail beside a switch, status, or action. Use contextual save feedback and a confirmation surface for destructive reset actions. |
| Sign-in | Give the form primary visual weight. Use clearly labeled inputs, a named password reveal, a visible error region, and a single primary sign-in action. Keep account help near the affected controls and let branding reflow on smaller screens. |
| Notifications | Reuse the same hierarchy for the compact header preview and the full page. The full page can add filters or longer history when needed. Keep read state, timestamp, and destination easy to identify. |
