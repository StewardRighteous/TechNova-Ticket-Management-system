# 07: Employees View — Table & Dedicated Detail Workspace

**What to build:**
A table-first Employees View and staff allocation Detail View:
1. Table view of TechNova Employees with combobox filters (Department, Location, Role), search, and `<NumericPagination />`.
2. Dedicated full-width Employee Detail View with `← Back to Employees` breadcrumbs preserving table state.
3. Hero Banner displaying Employee Name, Role Title, Department, Location (Chennai / Remote), and Status.
4. Workload gauge displaying active ticket assignments vs max capacity (e.g. `4 / 8 tickets`) and SLA compliance rate.
5. Cross-linked sub-tabs:
   - *Assigned Tickets*: Embedded table of all tickets assigned to this employee with direct navigation to their ticket detail view.
   - *Profile & Skills*: Contact details, assigned team, permissions, and skill tags with inline edit toggle.

**Blocked by:**
02: Minimal Enterprise Design System & Shared Navigation Controls

**Status:**
ready-for-agent

- [ ] Employees table renders staff records with numeric pagination and combobox filters.
- [ ] Row click opens the dedicated Employee Detail View with breadcrumbs and Hero Banner.
- [ ] Workload vs capacity metrics and SLA compliance are accurately rendered.
- [ ] Sub-tabs render Assigned Tickets and Profile/Skills.
- [ ] Clicking an assigned ticket opens that ticket's Detail View.

