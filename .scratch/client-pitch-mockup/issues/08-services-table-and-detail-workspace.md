# 08: Services View — Table & Dedicated Detail Workspace

**What to build:**
A table-first Service Lines View and service operations Detail View:
1. Table view of Service Lines with combobox filters (Department, Status), search, and `<NumericPagination />`.
2. Dedicated full-width Service Detail View with `← Back to Services` breadcrumbs preserving table state.
3. Hero Banner displaying Service Name, Department Lead, Status, SLA target, and Quick Actions.
4. Top metrics for Active Tickets, Health/Uptime, and Assigned Specialists.
5. Cross-linked sub-tabs:
   - *Service Details*: Description, supported technology stack tags, and escalation guidelines.
   - *Linked Tickets*: Table of active tickets reported under this service, with direct navigation to their ticket detail view.
   - *Subscribed Companies*: Table of Client Companies enrolled in this service line.

**Blocked by:**
02: Minimal Enterprise Design System & Shared Navigation Controls

**Status:**
ready-for-agent

- [ ] Services table renders service line catalog with numeric pagination and combobox filters.
- [ ] Row click opens the dedicated Service Detail View with breadcrumbs and Hero Banner.
- [ ] Sub-tabs render Service Details, Linked Tickets, and Subscribed Client Companies.
- [ ] Clicking a linked ticket opens that ticket's Detail View.

