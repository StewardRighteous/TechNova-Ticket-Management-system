# TechNova UX improvement board

Browser review of the local mockup on 17 November 2026. One reviewer explored as a first-time operator. The other reviewed as the client commissioning a support workspace. The board is ordered by implementation dependencies and includes source checks where they explain a browser finding.

| Ready | Blocked by dependencies | In progress | Done |
| --- | --- | --- | --- |
| — | — | — | TN-01, TN-02, TN-03, TN-04, TN-05, TN-07, TN-08, TN-09, TN-10, TN-11, TN-12, TN-13, TN-14, TN-15, TN-16, TN-17, TN-18, TN-19, TN-20, TN-21, TN-22, TN-23, TN-24, TN-25 |

Pull a blocked card into Ready when all IDs on its **Depends on** line are Done. This desktop-only board has 24 tickets. P0 covers wrong-customer context, role boundaries, and accidental data loss. P1 covers core workflows and usability barriers. P2 covers supporting workflow quality. Within Ready, pull the highest-priority available card first.

## Ready

—

## In progress

—

## Blocked by dependencies

—

## Done

### TN-19 · Make ticket details readable and edits dependable · Done

**P1** · Depends on TN-01, TN-18 · Ticket Details tabs, editing, diagnostic display · **Done**

**Reproduce.** Overview, Context, and Client repeat several fields, and read-only inputs cut off long values. Arrow Right leaves focus on Overview and the tabs lack an association with their panels. The edit-channel list offers Portal/Chat and omits WhatsApp even though the registry and create form use WhatsApp, Email, and Phone. Seeded reproduction steps such as those on `TCK-1172` show literal `\n` in Issue Overview. `TCK-1089` displays “Breached (Breached)” and puts a timeout string under Error Rate.

**Implement.** Use a labeled read view and a distinct edit mode. Give each field one clear home, use the shared channel definitions, and render legacy line breaks as readable steps. Map diagnostic values to the right labels and format status and time separately. Refresh displayed values after save or ticket change. Give the tabs associated panels and arrow-key navigation. Make Cancel immediate for a clean form and protect dirty changes with a focus-managed confirmation.

**Accept when** a WhatsApp ticket remains WhatsApp after an unrelated edit, saved changes appear without reopening, links between tickets never carry another ticket’s draft, and both actual and escaped newlines display as intended. Verify one Tab stop per tab group, Arrow keys and Home/End, and focus return after discarding changes.

**Completed.** Added accessible tab and panel associations with keyboard navigation, reliable edit/cancel behavior, WhatsApp channel support, readable escaped line breaks, corrected diagnostic labels, and distinct SLA status/time display.

### TN-20 · Distinguish customer messages, workflow history, and internal notes · Done

**P1** · Depends on TN-03, TN-18 · Ticket activity and note composer · **Done**

**Reproduce.** Escalating a sample ticket adds a status event under Customer Communications. The Internal Notes composer sits below existing notes, and newly created events can use a stored “Just now” label instead of a real timestamp.

**Implement.** Give workflow events a clear place in Activity. Label genuine customer messages and staff-only notes distinctly. Render a consistent chronological order shared by the DOM and visual layout. Store real timestamps on new events and notes, display a readable time, and provide a named composer near the newest content with feedback after posting.

**Accept when** one escalation, one customer event, and one note appear with correct type, author, and time after reload. A blank note produces no entry, keyboard and click post once, and a long history has a predictable newest-entry location.

**Completed.** Split customer messages, workflow activity, and internal notes into labeled views; use real timestamps and chronological ordering; and provide posting feedback for notes.

### TN-21 · Make notifications actionable, current, and persona-specific · Done

**P1** · Depends on TN-02, TN-08 · Header bell, dashboard preview, notifications inbox · **Done**

**Reproduce.** The bell preview has plain rows without timestamps or ticket links. The full view retains “2 new” after opening an unread ticket. Samira sees assignment copy for another persona, and seed copy saying “due within the next hour” is presented as 11 days old during the audit.

**Implement.** Reuse one accessible notification row treatment in the bell, dashboard, and inbox. Show a textual read state, event time, and permitted target. Persist read state per persona and update counts across all three surfaces. Use assignment and SLA copy that can be true for the viewer and current time, or word old items as historical events.

**Accept when** opening an eligible unread item from any surface navigates to the right ticket and decreases the count once. Reload preserves it. Verify different personas, a missing or inaccessible ticket, an empty inbox, and an old SLA event. The bell and inbox remain usable by keyboard.

**Completed.** Added shared read-state-aware notification behavior across the bell, dashboard, and inbox, persisted reads per persona, linked eligible items to tickets, and made assignment and stale SLA copy viewer-appropriate.

### TN-23 · Make company, employee, and service detail pages operationally useful · Done

**P1** · Depends on TN-01, TN-02, TN-22 · Directory detail summaries and related data · **Done**

**Reproduce.** Apex shows 38 Active Tickets in the header and 14 in the Active Tickets tab. Contacts shows account codes in the Role column. Add Contact and Log Interaction only switch tabs. Alex’s profile displays `dept-sre` and `loc-remote` and lists Closed items alongside active work. 24/7 Support advertises 22 active tickets while its linked active list shows 13. Service detail repeats uptime and “View active tickets” lands on generic Linked Tickets.

**Implement.** Resolve display names from reference data, align count labels and linked-list predicates, and show separate labeled active and historical views where needed. Put headings and capacity labels next to the values they describe. Paginate long related lists. Give actions behavior matching their labels. If the mockup has no add/contact log workflow, label those buttons as navigation to the existing views.

**Accept when** Apex’s active total equals the matching list, Contacts displays actual roles, the employee capacity and related-work scopes are clear, and the service action opens a genuinely active list. Use an empty record and a record with closed or restricted related tickets to verify counts and links.

**Completed.** Aligned company and service active counts with their filtered ticket lists, displayed contact roles and resolved employee reference names, scoped employee work to active tickets, and clarified detail actions.

### TN-24 · Make directory create forms validate and lead to the saved record · Done

**P2** · Depends on TN-05, TN-08, TN-22 · New Company, New Employee, New Service · **Done**

**Reproduce.** Required fields in the directory forms are visually unmarked. Company Code is generated and read-only with little explanation, and Company tier shows Standard beside Standard Business. Employee team and department can diverge. Service Department lists variant names for the same group. New Service asks for an SLA target like `4h` alongside an uptime target such as `99.9%`, while an existing service shows a percent as SLA target.

**Implement.** Label required fields and all units, explain generated identifiers, and validate uniqueness, formats, and team/department relationships with inline messages. Use canonical tier and department options. Define response-time SLA and uptime as distinct values and show existing values with their actual units. Group the inputs into readable sections and lead successful creation to the new record, retaining a clear route back to the list.

**Accept when** wrong units, duplicate codes/emails where applicable, and inconsistent assignments are caught before saving. Keyboard focus reaches the invalid field, valid company/employee/service creation opens the corresponding detail, and canceling a populated form protects the draft.

**Completed.** Added required-field and uniqueness validation, canonical options, synchronized employee team/department selection, explicit SLA and uptime units, draft-discard protection, and navigation to newly created records.

## Blocked

—

## In progress

—

## Done

### TN-01 · Reconcile ticket company and service references · Done

**P0** · Depends on none · Ticket data, registry, detail, related lists · **Done**

**Completed.** On load, ticket company and service labels are reconciled from valid directory IDs for both pristine seed data and existing browser storage. New tickets require valid company and service IDs and save the directory labels. Editing a ticket relationship validates the chosen ID and refreshes its display name and company code. Missing IDs are left intact with the stored label, preserving ambiguous records for manual correction.

**Verification.** `npm run build` passes. The implementation is at `src/store/storage.ts` and `src/store/ticketStore.ts`.

---

### TN-02 · Apply the same role rules to actions, links, and record URLs · Done

**P0** · Depends on none · App routes, header, dashboard, directories, ticket and notification entry points · **Done**

**Completed.** Record detail lookups no longer fall back to unscoped data. Ticket, company, and employee URLs show an unavailable message with a return path when a record is missing or outside the active role’s scope. Section routes explain denied access. Dashboard destination cards and create controls follow role permissions; notifications are limited to tickets the current role can access. Ticket status transitions, assignment, note, directory create/update mutations, and edits to ticket relationships enforce the same role/record policy in the store. Related ticket lists use role-scoped tickets.

**Verification.** `npm run build` passes. The implementation is in `src/utils/rolePermissions.ts`, `src/App.tsx`, role-aware views, and `src/store/ticketStore.ts`.

---

### TN-03 · Make ticket transitions and reassignment reflect actual routing · Done

**P1** · Depends on TN-02 · Ticket actions and store mutations · **Done**

**Reproduce.** Ticket details expose Escalate, Request QA Review, and Mark Resolved in both the hero and workflow panel. Escalating `TCK-1101` changed the status while Samira stayed the assignee, even though the action said it would route to L2/L3. The QA handler also changes status without routing. Reassigning through the dropdown takes effect as soon as the selection changes.

**Implement.** Define permitted transitions and their effects with the role policy. For a routing action, show the destination and update the assignment or queue and status together. If an action changes status alone, label it accordingly. Give reassignment an explicit apply action, collect any required resolution details, and record one accurate activity event per successful transition.

**Accept when** testing an active, escalated, Pending QA, and resolved ticket as manager and QA/Development shows only applicable actions. A successful action updates the visible state, persists after reload, and produces a single accurate event. Cancel and invalid transitions leave the record unchanged.

### TN-04 · Protect the demo reset and move it out of daily navigation · Done

**P0** · Depends on none · Header, Settings, demo store · **Done**

**Reproduce.** Reset Demo sits beside everyday actions in the header and is repeated in Settings. Source review shows both triggers reset immediately, and the store also changes the active persona to the seed manager.

**Implement.** Give authorized demo operators a single Settings entry. Explain which local changes will be wiped, require an explicit reset confirmation, and make Cancel the initial focus. Preserve the active persona if it exists in seed data. If the active persona came from a user-created record, return to the demo chooser with an explanation.

**Completed.** Removed reset from the global header and kept one entry in Settings. It describes the local data that will be replaced, then requires explicit confirmation in a dialog whose initial focus is Cancel. Escape, backdrop click, and Cancel dismiss without changing records; focus returns to the reset trigger. Confirming restores seed data, preserves the active employee when present, and returns to the default persona with an explanatory warning if the current persona was removed.

**Verification.** Focused reset and store tests pass, along with the production build. See `src/components/settings/SettingsView.tsx`, `src/store/ticketStore.ts`, and their tests.

### TN-05 · Standardize typography, spacing, colors, and control states · Done

**P1** · Depends on none · Shared CSS, buttons, badges, tables, forms, icons · **Done**

**Reproduce.** In the desktop shell, inactive slate labels and icons are hard to see on navy. The client measured roughly 2.4:1 for the inactive Companies label at 12 pixels. Small pale uppercase labels recur in cards, tables, and details. The accessibility tree includes icon ligatures such as `grid_view` and `confirmation_number` in control names. The primary ticket action changes from indigo “Add Ticket” to navy “New Ticket.”

**Implement.** Define shared text, surface, accent, focus, and semantic status styles and a consistent spacing scale. Use indigo for the primary action, neutral styling for secondary actions, and explicit text for risk or status. Increase readability of recurring metadata. Hide decorative icons from accessible names and name icon-only controls. Cover sidebar navigation, header controls, badges, table controls, and inputs first.

**Completed.** Added shared text, surface, accent, focus, and semantic status tokens and a global visible keyboard focus style. Sidebar inactive labels now use readable light text on navy; accordion headings and page-level metadata are larger and darker. Primary ticket actions use indigo, table create actions use the same treatment, and secondary controls remain neutral. Status and priority badges have readable fills, explicit borders, and text labels for grayscale use. Decorative symbols are hidden from screen-reader names, icon-only controls have explicit labels, and sidebar navigation exposes current-page state.

**Verification.** Focused UI and store tests pass, along with the production build. Review covers the sidebar, header controls, badges, table controls, and shared inputs. See `src/index.css` and the shared components under `src/components/common/`.

### TN-07 · Make the demo entry, persona choice, and sign-out understandable · Done

**P1** · Depends on none · Login page, profile menu, session state · **Done**

**Reproduce.** A fresh visit opens the workspace as Arthur. The first-time reviewer found the persona chooser only after Profile → Sign Out, where the demo screen presents prefilled manager-looking sign-in fields. The profile tooltip advertises a role switcher but the menu offers only Sign Out.

**Implement.** Make the demo entry explicit. Present selectable sample personas with full names, clear role names, and short capability descriptions. Offer a labeled persona-switch action and remember the explicitly chosen persona in the tab/session. Present the email-only demo behavior honestly and remove the password-looking control if using the current mock flow.

**Accept when** a fresh visit offers a clear next step, switching from Arthur to Samira is discoverable from the profile, refreshing retains the chosen role, and signing out followed by a refresh returns to the chooser. A user with a permitted deep link reaches that record after selecting a persona.

**Completed.** Fresh sessions now open on a clear demo entry with full-name persona choices, role names, and capability descriptions. The email-only lookup explains that it is a local demo and has no password field. The profile menu exposes “Switch demo persona.” An explicitly selected employee ID is stored in `sessionStorage` and restores both the employee and role after reload; sign-out clears it, so the next load returns to the chooser. The original route remains available after choosing a persona, including permitted deep links.

**Verification.** `npm run build` and the focused auth, store, dashboard, and header tests pass. See `src/components/auth/`, `src/components/common/layout/Header/`, `src/store/ticketStore.ts`, and `src/store/storage.ts`.

### TN-08 · Give each page a clear title, return path, and recovery state · Done

**P1** · Depends on TN-02 · App routes, header, breadcrumbs, error states · **Done**

**Reproduce.** Opening View all notifications changes the page content, while the header still says Dashboard. Opening a ticket via Dashboard → Inspect can retain the dashboard scroll and start below the ticket’s heading. Detail pages lean on a small header breadcrumb for returning. Source review shows unknown record IDs fall into the registry while keeping the malformed detail URL, and unknown paths redirect to Dashboard.

**Implement.** Derive document title, visible page title, breadcrumb, and current navigation state from the route. Give detail/create screens an obvious parent link and a single page-level heading. Provide a specific local recovery screen for missing records or routes, and use the access state from TN-02 where appropriate. Move focus to the new primary heading on forward navigation.

**Accept when** `/notifications` identifies itself, record and create screens have usable parent navigation, and a missing ID or path explains the outcome and offers a working recovery link. Verify direct navigation, browser Back, and keyboard focus.

### TN-09 · Make dashboard ticket and SLA totals explainable · Done

**P1** · Depends on none · Dashboard metrics and incident table · **Done**

**Reproduce.** Operations Manager sees 72 Active Tickets and a separate Tickets total of 100 labeled “Active service requests.” The SLA card shows 22 while the critical incidents table contains 23. The two SLA counts currently use different inclusion rules.

**Implement.** Define total, active, overdue, SLA risk, and high-attention in one metrics module. Label the 100-card total correctly. Show the incidents table’s broader scope explicitly if it includes critical-priority records outside SLA risk. Use the same reference time across summaries and filtered views, and clarify which resolved/closed records contribute to average resolution.

**Accept when** deterministic fixtures cover active, resolved, closed, overdue, at-risk, breached, and urgent-on-target tickets. Every dashboard card and table names its actual scope, and matching views report matching counts. Include empty data and a record missing a valid deadline.

**Completed.** Dashboard metrics and drill-down predicates now share one metrics module. “Tickets” is described as the full role-scoped request set, including resolved and closed records. The SLA KPI reports active at-risk/breached tickets, while the queue explicitly states its broader inclusion of urgent/high-priority active tickets and displays priority beside SLA status. Overdue summaries and registry filters use the same active/deadline predicate with a single reference time per calculation. The average scope is visible and defined: resolved records use their last update; closed records use `closedAt` with an `updatedAt` fallback.

**Verification.** Deterministic tests cover active, resolved, closed, overdue, at-risk, breached, urgent-on-target, empty data, and missing deadlines; focused tests and the production build pass. See `src/components/dashboard/dashboardMetrics.ts` and `src/components/tickets/TicketTable/index.tsx`.

### TN-10 · Put daily triage ahead of decorative dashboard content · Done

**P1** · Depends on TN-05, TN-09 · Dashboard and incident preview · **Done**

**Reproduce.** The desktop dashboard starts with a large welcome banner, then two similarly prominent card bands and breakdowns before the critical incidents. Multiple All Tickets links compete with the primary task. The red SLA card combines a heavy frame, gradient, icon, pill, and pulse.

**Implement.** Give each dashboard section a clear purpose. Compact the greeting and place actionable SLA information and the critical queue ahead of directory shortcuts and breakdowns. Keep one prominent create entry where authorized and one clear registry link. Use quieter cards, aligned gutters, readable chart labels, and one consistent treatment for critical emphasis.

**Accept when** at 1280×720 the viewer can identify the highest-priority issue and its action without passing decorative content, and at the same reading order holds. Labels and values remain legible, and zero counts have a calm, informative state.

**Completed.** Replaced the large gradient welcome banner with a compact greeting, placed operational KPIs and the high-attention queue before directory shortcuts and breakdown charts, and removed the competing dashboard “All Tickets” link. The queue has one understated registry link, quieter table styling, explicit priority/SLA context, and a calm empty state. The authorized header create action remains the sole prominent create entry.

**Verification.** Dashboard integration and component tests pass, and the production build passes. At desktop widths the first content after the compact greeting is the KPI row followed by the actionable queue. See `src/components/dashboard/DashboardView/index.tsx`, `ExecutiveKpiRibbon.tsx`, and `HighAttentionTicketsTable.tsx`.

### TN-11 · Show and preserve the dashboard’s ticket scope on drill-down · Done

**P1** · Depends on TN-02, TN-09, TN-10 · Dashboard KPIs and registry scope · **Done**

**Reproduce.** Click Active Tickets. The result is `/tickets` titled “All Tickets,” with no selected Status values, although the set is scoped. The SLA risk card scrolls to the broader high-attention table, where the generic “View All Tickets” loses the condition.

**Implement.** Represent the metric scope with a stable query value and a visible removable label such as “Active.” Use shared predicates and naming from TN-09 and TN-10. Provide an equivalent scoped route from Overdue, SLA Risk, and Average Resolution samples, with a clear link from the high-attention preview that matches its scope. Keep the scope combinable with ordinary filters.

**Accept when** the initial count and criteria agree with the clicked card, refreshing or sharing the link restores the scope, and removing it returns to the role’s full queue. Verify risk versus critical priority, a zero-result scope, and a restricted persona.

### TN-12 · Make the ticket registry readable and rows easy to open · Done

**P1** · Depends on TN-05 · Ticket table and responsive row layout · **Done**

**Reproduce.** In the client’s 1280×720 CSS viewport, the Incident title gets roughly 160 pixels. Ellipses hide distinguishing suffixes such as the tenant number, while secondary columns use more space. The repeated “Open” controls do little to identify which item will open. On mobile the visible slice starts with only the ID column.

**Implement.** Prioritize the ticket title and ID, status/priority, client, and ownership when assigning column widths. Let titles wrap to a practical number of lines and give a readable way to reveal long text. Make the title or ID a real link with a distinct name. Consolidate the header “New Ticket” and table “New” into one visible registry entry for authorized roles. On narrow screens, present the same key fields in a compact record layout or a clearly signposted contained table.

**Accept when** two tickets with the same prefix and different tenant suffixes are identifiable at 1265 pixels, and ticket title, status, and opening action are available at 390 pixels. The row link works with Enter and standard link behavior, and repeated generic controls leave no ambiguous tab stops.


—

### TN-13 · Make filters, sorting, and empty results easy to understand · Done

**P1** · Depends on TN-11, TN-12 · Ticket table filters and shared combobox · **Done**

**Reproduce.** In the Status filter’s search field, Arrow Down leaves focus in the field and Escape leaves the menu open. The filter toolbar uses several small controls and search promises ID, issue, and client. The active view and selected values need to be visible while composing filters.

**Implement.** Give the search a persistent label, keep active discrete filters and scope visible, and make individual removal and Clear all easy to find. Show the sort field/direction and total results beside the toolbar. Use accessible keyboard behavior for filter menus and sortable headers, and distinguish an empty queue from zero search matches.

**Accept when** a user can filter by two statuses and a channel, remove any single filter, see or hear the resulting count, and recover from a no-match state. Verify keyboard selection, Escape, sort announcements, and clearing search and any scoped view.

**Completed.** Added removable filter chips, persistent search labeling, result counts, sort field and direction controls, keyboard navigation, and distinct empty queue/no-match guidance.

### TN-14 · Return to the exact queue context after reviewing a ticket · Done

**P1** · Depends on TN-08, TN-11, TN-13 · Ticket registry, router, pagination · **Done**

**Reproduce.** The first-time reviewer verified that ticket search survives a breadcrumb return. Code review found that sort is absent from the preserved table state and scroll is captured without being restored. Exercise the same return from a sorted later page and from a ticket opened on another surface.

**Implement.** Restore the source list’s search, filters, scope, sort, page size, page, scroll, and originating link focus through the URL and history state as appropriate. Distinguish a return to the prior view from a direct arrival at the registry. Clamp page and focus when the original record moved or no longer matches.

**Accept when** ascending and descending sorts, a filter, and page 2 survive both Browser Back and the registry breadcrumb. The originating ticket regains focus when present. A direct detail URL still has a reasonable return destination and closing a ticket from the active queue gives a sensible fallback position.

**Completed.** Serialized list filters, scope, sort, page, and page size in the URL; detail return restores scroll and focus, while direct detail URLs get a registry return path.

### TN-15 · Keep the selected company, contact, service, and assignee in sync · Done

**P0** · Depends on TN-01, TN-02 · New Ticket, customer and ownership fields · **Done**

**Reproduce.** As Samira, open New Ticket and search `CloudScale`. The Company control displays CloudScale while Customer contact still shows the initial Apex contact. In the browser review, the submitted sample ticket appeared under Apex Financial’s Active Tickets. An unmatched query leaves an empty Company selector and a stale contact, with no explanation. The intake also starts at P1 Urgent with the first company, service, and owner selected.

**Implement.** Use an explicit company or contact result selection and store the chosen IDs. Refresh dependent contact/service choices after company changes and validate eligibility at submission. Show zero-result guidance in the picker. Start high-impact fields unselected or with documented safe defaults. Provide short priority guidance and show the chosen assignee before continuing.

**Accept when** selecting an Apex contact and then CloudScale clears the old contact. Searching by an alternate contact brings up the correct company and contact, an unmatched search cannot save a stale record, and the wizard never silently submits the first customer, owner, or P1 by default.


—

### TN-16 · Make the intake wizard recoverable and explain its requirements · Done

**P1** · Depends on TN-15 · New Ticket, attachments, and draft navigation · **Done**

**Reproduce.** Start a new ticket. Next/Create can be disabled without a visible explanation, and the required fields are unmarked. Next can carry scroll into Step 2 below its heading. The first-time reviewer entered data on Step 2, used the sidebar, and reopened New Ticket to an empty form. File read failures are silently ignored in source.

**Implement.** Mark required fields, show field-level validation, and focus the first invalid input or the next step heading at the right time. Preserve the in-progress draft across steps and either restore it on return or ask before discarding on navigation. Describe supported attachment types and size limits. Show file progress, rejection, and removal, and make saved attachments findable from the ticket.

**Accept when** a keyboard user can complete both steps with visible errors and predictable focus. Back retains inputs, leaving a dirty draft offers recovery, and there is no prompt for an untouched form. A valid image appears in the saved ticket and an invalid or oversized file shows an actionable error while preserving the draft.

**Completed.** Added required field guidance, recoverable session draft data and attachments, predictable step focus, attachment validation feedback, and attachment access from ticket details.

### TN-17 · Give the creator a reliable link to the saved ticket · Done

**P1** · Depends on TN-02, TN-15, TN-16 · Ticket creation and registry · **Done**

**Reproduce.** Samira created a sample ticket using the defaults. The app announced success and sent her to `/tickets`. Searching the exact title returned no result for her, while the manager’s count increased. Source also shows ticket IDs are randomly generated without a duplicate check and the creator is inferred from role rather than the selected persona.

**Implement.** Return the saved ticket’s code and ID from the mutation, make IDs unique, and record the actual persona. Keep creators able to follow their submissions within the agreed role policy. If handoff limits subsequent access, show the ticket reference and the destination queue through an allowed receipt instead. Put the code in the confirmation and prevent duplicate creation on repeated submit.

**Accept when** each create-capable persona gets a code and a permitted way to follow the request. Test a restricted creator assigning across teams, a duplicate-ID fixture, a double submit, persistence after reload, and the correct author in activity history.

**Completed.** Ticket creation returns the saved record and unique reference, records the active persona as author, prevents repeat submission, and displays the code with links to the saved ticket or queue.

### TN-18 · Turn the ticket detail header into a useful working summary · Done

**P1** · Depends on TN-03, TN-05 · Ticket hero, ownership, workflow layout · **Done**

**Reproduce.** Ticket detail opens with a large dark title banner and colorful workflow buttons. Status, priority, ownership, and SLA require scanning other panels. The same workflow actions appear again in the sidebar, and the detail panels split the issue, ownership, and diagnostic information into several competing blocks.

**Implement.** Put ticket code, a wrapping title, status, priority, assignee, and current SLA in a compact summary. Group the single set of allowed transitions near the summary and provide clear routes to issue, activity, details, and files. Arrange content in task order on narrow screens, with workflow secondary to the record identity.

**Accept when** at 1265 and 390 pixels a user can identify the correct ticket, its owner and urgency, and its next action without scanning multiple panels. Each transition has only one visible entry point, and long titles or missing metadata have clear layouts.

**Completed.** Replaced the large banner with a compact ticket summary for code, title, status, priority, owner, customer, service, and SLA, plus links to issue, activity, details, and files.

### TN-22 · Unify directory toolbars and keep record links within reach · Done

**P1** · Depends on TN-08, TN-12 · Companies, Employees, and Services lists · **Done**

**Reproduce.** At roughly 1280 CSS pixels, Companies clips Tickets and View until the table scrolls horizontally. Employees wraps “All Employees” and presents a Role control beside an unlabeled “All Roles” control, with status on another line. The three registries handle spacing, sorting, and record opening differently.

**Implement.** Use a consistent toolbar with a readable heading, labeled search and filters, and a single authorized create action. Remove or clarify overlapping filters. Keep record names as accessible detail links and prioritize columns by task. Reuse the responsive table behavior and persist visible list state when returning from a record.

**Accept when** staff can find and open a record from each directory at 390, 768, and 1280 pixels, with the principal link visible. Tab to filters and sort controls, verify no duplicate role control or ambiguous label, and check empty results and return navigation.

**Completed.** Removed the duplicate employee role selector, clarified search, made directory names accessible detail actions, and preserved list filters, sort, and pagination while opening records.

### TN-25 · Make Settings apply real preferences and communicate their scope · Done

**P2** · Depends on TN-04, TN-07, TN-13, TN-21 · Settings and workspace preferences · **Done**

**Completed.** Persisted the default ticket view and compact workspace preference per persona. The ticket registry applies the selected all, mine, or urgent view, and compact mode immediately reduces ticket-table row spacing. Clarified that email, browser push, scheduled refresh, and language switching are unavailable in the local demo; the in-app notification surfaces remain its supported alerts.

## Review coverage

| Reviewer | Browser coverage |
| --- | --- |
| First-time operator | Fresh entry and persona choice, role-specific navigation, dashboard drill-downs, ticket search and return, both intake steps, one sample submission and escalation, ticket history, notifications, all three directories from list through create, and Settings. |
| Mockup client | Desktop review at 1280×720 of sign-in, shell, dashboard, ticket list and detail/edit, both intake steps, notifications, all directory list/detail/create screens, and Settings. Measured contrast and tested keyboard behavior. Narrow-width checks at 390×844 covered Dashboard and Tickets. |

Both reviewers used the sample Operations Manager, Support Agent, and Management personas. Reset and settings effects were assessed from visible controls and source. Phone-sized checks used browser emulation. Directory create forms were inspected without submitting directory records. The operator’s sample ticket and transition affected browser-local demo data.

Latest verification on this checkout: the focused auth, store, header, and dashboard suites pass (25 tests), and `npm run build` passes. The full `npm test -- --run` suite reports 48 passing and 8 failing tests across NumericPagination, TicketDetailHero, and TicketTable. Those failures currently include expectations for buttons where the UI uses a select, plus ticket-detail controls/workflows that differ from the running UI. Keep the ticket-specific acceptance checks alongside the existing tests when continuing implementation.
