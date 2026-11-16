# 06: Companies View — Table & Dedicated Detail Workspace

**What to build:**
A table-first Client Companies View and 360-degree account Detail View:
1. Table view of Client Companies with combobox filters (Account Tier, Status), search, and `<NumericPagination />`.
2. Dedicated full-width Company Detail View with `← Back to Companies` breadcrumbs preserving table state.
3. Hero Banner displaying Company Name, Account Tier badge, status, and Quick Actions (e.g. "Add Contact", "Log Interaction").
4. Metric summary cards (Active Tickets, Total Contracts, SLA Tier).
5. Cross-linked sub-tabs:
   - *Contacts*: Table/list of customer contacts with roles, emails, phone numbers, and primary contact indicator.
   - *Active Tickets*: Embedded table of all open tickets for this company, with direct navigation to their ticket detail view.
   - *Contracts & Services*: Subscribed services and contract terms with an inline edit toggle.

**Blocked by:**
02: Minimal Enterprise Design System & Shared Navigation Controls

**Status:**
ready-for-agent

- [ ] Companies table renders company records with numeric pagination and combobox filters.
- [ ] Row click opens the dedicated Company Detail View with breadcrumbs and Hero Banner.
- [ ] Sub-tabs render Contacts, linked Active Tickets, and Contracts.
- [ ] Clicking a linked ticket opens that ticket's Detail View.
- [ ] Inline editing supports saving changes and displaying feedback toasts.

