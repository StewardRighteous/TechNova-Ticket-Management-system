# 05: Dedicated Full Ticket Detail Workspace with Hero Banner & Quick Actions

**What to build:**
A dedicated full-width Ticket Detail View replacing cramped side panels/drawers:
1. Top breadcrumb bar `← Back to Tickets` that preserves previous page number, page size, and combobox filter selections.
2. Standardized Hero Banner displaying Ticket ID, title, status pill, priority, live SLA countdown timer, and high-frequency Quick Action buttons.
3. 2-column workspace layout:
   - *Left*: Issue overview card with dynamic diagnostic fields (OS, browser, steps to reproduce) and a tabbed timeline separating Customer Communications (email history) from Internal Notes (staff-only discussion with reply composer).
   - *Right*: Ownership card (assignee avatar, department) and direct one-click workflow actions ("Escalate to Senior Support / Dev", "Request QA Review", "Mark Resolved").
4. Workflow actions instantly update the ticket status, append to the timeline, and trigger a confirmation toast.

**Blocked by:**
04: Table-First Ticket Registry & Dynamic Intake Flow

**Status:**
ready-for-agent

- [ ] Row click in the ticket table transitions to the dedicated full-width Ticket Detail View.
- [ ] Breadcrumb `← Back to Tickets` returns to the table preserving page and filter query state.
- [ ] Hero Banner displays status, priority, SLA countdown, and Quick Action buttons.
- [ ] Activity timeline displays tabbed Customer Communications vs Internal Notes, with a composer for internal notes.
- [ ] One-click workflow actions (Escalate, Request QA, Resolve) transition ticket state, log timeline entries, and display toasts.

