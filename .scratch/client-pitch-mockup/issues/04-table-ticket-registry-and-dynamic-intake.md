# 04: Table-First Ticket Registry & Dynamic Intake Flow

**What to build:**
A table-first Ticket Registry and intelligent ticket intake workflow:
1. Ticket Registry table equipped with `<NumericPagination />`, debounced search bar, and `<ComboboxFilter />` dropdowns (Status, Priority, Intake Channel, Department).
2. Clean empty state with a "Clear all filters" button when search yields no matches.
3. Guided 2-step `CreateTicketModal`: Step 1 selects Intake Channel (WhatsApp, Email, Phone) and customer autocomplete; Step 2 displays dynamic diagnostic fields tailored to the chosen category (Technical/Bug, Login, Billing, Feature Request).
4. Newly created tickets are assigned unique IDs, persisted to state, and trigger a success toast.

**Blocked by:**
02: Minimal Enterprise Design System & Shared Navigation Controls

**Status:**
ready-for-agent

- [ ] Ticket table displays tickets with ID, title, company, contact, priority, channel, department, and subtle SLA indicator.
- [ ] Table filtering works seamlessly via search and combobox dropdowns.
- [ ] Numbered pagination works with 10/25/50 page sizes.
- [ ] Create Ticket Modal provides 2-step flow with intake channel selection and dynamic category inputs.
- [ ] Submitting a ticket saves it to the store and shows a toast.

