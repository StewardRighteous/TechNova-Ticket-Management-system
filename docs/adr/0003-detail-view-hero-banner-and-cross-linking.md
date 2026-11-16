# Detail View Architecture: Hero Banner with Quick Actions and Cross-Linked Tabs

Every Detail View (Ticket, Company, Employee, Service) follows a standardized full-width workspace pattern:
1. **Breadcrumb Top Bar**: Preserves previous table state (page number, page size, combobox filters).
2. **Hero Banner with Quick Actions**: Standardized top section containing primary entity details, status pills, and high-frequency Quick Action buttons (e.g. Escalate, Change Status, Assign, Add Contact) triggering immediate state updates and subtle feedback toasts.
3. **Sub-Tabbed Cross-Linking**: Rather than isolated silos, detail views cross-link related records (Company Detail displays its Contacts and Active Tickets; Employee Detail displays their Assigned Tickets; Service Detail displays linked Tickets and Subscribed Companies).

