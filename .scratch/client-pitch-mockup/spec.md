# Spec: TechNova Ticket Management System Client-Pitch Mockup

Status: ready-for-agent

## Problem Statement

TechNova Solutions currently manages customer issues across disparate, uncoordinated channels (WhatsApp, email, phone) without central ownership, SLA tracking, or role-based oversight. To win executive approval and purchase commitment from the client, the sales and engineering teams need an interactive, high-fidelity UI/UX mockup. 

The current prototype has functional pieces but suffers from visual clutter, inconsistent navigation patterns (mixing modals and side panels), lack of standard table filtering, missing numeric pagination, and an incomplete demonstration of category-specific ticket creation and cross-departmental handoffs. It needs to present a minimal, professional enterprise interface that convinces the client that TechNova's ticket lifecycle is effortless, transparent, and rock-solid.

## Solution

A refined, minimal enterprise web application with:
1. **Persona / Role Switcher**: A global header selector allowing immediate switching between Support Agent, Dev Lead, and Operations Manager perspectives.
2. **Table-First Navigation**: Uniform, clean data tables across Tickets, Companies, Employees, and Services featuring compact Combobox dropdown filters, debounced search, and a complete Numeric Pagination system (`1, 2, 3 ... N`, page sizes 10/25/50, and record range counters).
3. **Dedicated Full Detail Views with Hero Banners & Quick Actions**: Full-width workspaces with breadcrumbs (`← Back to [Section]`), a prominent Hero Banner with context metrics and direct Quick Actions (Escalate, Change Status, Reassign), and rich sub-tabs cross-linking related entities.
4. **Dynamic Intake & Creation Modal**: 2-step ticket intake supporting channel tagging (WhatsApp, Email, Phone) and category-driven dynamic diagnostic inputs.
5. **Local JSON Persistence with Demo Reset**: Instant zero-latency state mutations stored in local storage with a one-click "Reset Demo Data" action to guarantee presentation reliability.
6. **Toast Feedback**: Unobtrusive confirmation toasts on actions.

## User Stories

1. As an Operations Manager, I want an Executive KPI ribbon on the dashboard displaying total active tickets, overdue tickets, SLA breaches, and average resolution times, so that I can immediately assess operational health.
2. As an Operations Manager, I want interactive breakdown cards showing ticket counts by Intake Channel (WhatsApp, Email, Phone) and Department, so that I understand where inbound volume originates.
3. As a prospective client executive, I want to use a Persona Switcher in the top header, so that I can preview the tailored experience for Support Agents, Dev Leads, and Operations Managers.
4. As a Support Agent, I want a clean, table-first Ticket Registry with low-saturation, readable status and SLA indicators, so that I can quickly scan pending requests without eye fatigue.
5. As a Support Agent, I want compact Combobox dropdown filters for Status, Priority, Channel, and Department, so that I can narrow down tickets without noisy tab strips cluttering the interface.
6. As a Support Agent, I want to search tickets by keyword with instant debounced updates, so that I can locate specific customer inquiries immediately.
7. As any employee user, I want numeric pagination with numbered page buttons (`1, 2, 3 ... N`), a page size selector (10, 25, 50), and a record range summary (e.g. `Showing 1–10 of 42 records`), so that I can navigate large datasets predictably.
8. As a Support Agent, I want clicking any ticket row to navigate to a dedicated full-width Detail View with a `← Back to Tickets` breadcrumb, so that I can work with complete diagnostic and conversation details without feeling cramped.
9. As a Support Agent, I want the `← Back to Tickets` button to preserve my active page number, page size, and combobox filter selections, so that I never lose my place when inspecting records.
10. As an employee reviewing a ticket, I want a standardized Hero Banner at the top of the Detail View displaying Ticket ID, title, status pill, priority, SLA countdown, and Quick Action buttons, so that critical context is visible immediately.
11. As a Support Agent, I want a 2-column ticket workspace with Issue Overview and dynamic fields on the left, and an Ownership & Escalation rail on the right, so that responsibility is crystal clear.
12. As a Support Agent, I want a tabbed communication timeline in the Ticket Detail View separating External Customer Communications (email history) from Internal Notes (staff-only discussion with quick reply), so that private discussions never leak to customers.
13. As a Support Agent, I want one-click Quick Actions in the ticket view to "Escalate to Senior Support / Dev", "Request QA Review", or "Mark Resolved", so that handoffs automatically log timeline events and reassign departments.
14. As a Support Agent, I want a guided Create Ticket Modal with channel selection pills (WhatsApp, Email, Phone) and customer search autocomplete, so that logging tickets from any medium takes seconds.
15. As a Support Agent creating a technical ticket, I want the modal to dynamically show fields for Browser, OS, Steps to Reproduce, and Error details when "Technical / Bug" is chosen, so that engineering receives the data they need.
16. As an Account Manager, I want a table-first Companies View with numeric pagination and combobox filters, so that I can browse Client Companies systematically.
17. As an Account Manager, I want clicking a Company row to open a dedicated Company Detail View with a Hero Banner, key metrics, and sub-tabs for Contacts, Active Tickets, and Contracts, so that I have a 360-degree account view.
18. As an Operations Manager, I want a table-first Employees View with numeric pagination and department filters, so that I can review staff allocation across locations.
19. As an Operations Manager, I want clicking an Employee row to open a dedicated Employee Detail View with a Hero Banner, capacity/workload gauges, and sub-tabs for Assigned Tickets and Profile/Skills, so that I can monitor workload balance.
20. As a technical lead, I want a table-first Services View with numeric pagination, so that I can manage service lines and SLA commitments.
21. As a technical lead, I want clicking a Service row to open a dedicated Service Detail View with a Hero Banner, health metrics, and sub-tabs for Details, Linked Tickets, and Subscribed Client Companies, so that I can see the operational impact of each service.
22. As any employee, I want all editable fields in detail views to support a clean toggle between read-only display and inline inputs with explicit "Save" and "Cancel" controls, so that data corrections are intuitive.
23. As a user performing any workflow action (status update, ticket creation, escalation, edit), I want a non-intrusive toast confirmation, so that I know my change was successfully recorded.
24. As a sales presenter demonstrating the system, I want a discrete "Reset Demo Data" action, so that I can reset all mutations back to the clean seed dataset between client demonstrations.

## Implementation Decisions

- **Architectural Shape & Domain Modeling**:
  - Adhere strictly to the project domain model in `GLOSSARY.md` (Ticket, Client Company, Customer Contact, Employee, Intake Channel, Internal Note, Customer Communication, Escalation, SLA Target, Hero Banner, Quick Actions, Combobox Filter).
  - Comply with ADR `0001-local-json-persistence-and-demo-reset.md`, `0002-table-first-navigation-and-minimal-ui.md`, and `0003-detail-view-hero-banner-and-cross-linking.md`.
- **Minimal Enterprise Theme**:
  - Restrained enterprise color system: Deep slate foundation (`#0F172A`), neutral borders (`#E2E8F0` / `#CBD5E1`), subtle backgrounds (`#F8FAFC`), and low-saturation semantic badges for Status (slate, sky, amber, emerald) and Priority/SLA (subtle crimson for overdue/critical).
  - Elimination of heavy multi-colored tab bars in favor of neutral combobox filters.
- **Global Header**:
  - Add Persona Switcher dropdown (Support Agent, Dev Lead, Operations Manager) that sets active employee context and filters views accordingly.
  - Add "Reset Demo Data" button in settings / header.
- **Reusable Components**:
  - `NumericPagination`: Renders page numbers (`1, 2, 3 ... N`), previous/next arrows, page size dropdown (`10, 25, 50`), and `Showing X–Y of Z` range counter.
  - `ComboboxFilter`: Searchable, compact multi-value / single-value selector with active filter badges and clear button.
  - `HeroBanner`: Standardized top banner for Detail Views containing title, entity code/ID, status pill, primary metrics, and Quick Action buttons.
  - `ToastNotificationContainer`: Lightweight state-driven toast system for action feedback.
- **Dedicated Full Detail Views**:
  - Replace side panels and card popups with dedicated full-width detail views for Tickets, Companies, Employees, and Services.
  - Provide persistent breadcrumb navigation `← Back to [List]` that retains table pagination and filter state.
  - Implement sub-tabs for related entities (Company → Contacts, Active Tickets, Contracts; Employee → Assigned Tickets, Profile/Skills; Service → Details, Linked Tickets, Subscribed Companies).
- **Dynamic Ticket Intake**:
  - `CreateTicketModal`: Step 1 selects Intake Channel (WhatsApp, Email, Phone) and Client Company/Contact. Step 2 presents category-specific dynamic fields (Bug vs. Login vs. Billing vs. Feature Request).
- **Store & Local Persistence**:
  - Centralized store handles entities (`tickets`, `companies`, `employees`, `services`, `currentUserRole`).
  - Mutations sync to `localStorage` with fallback to `mockup.json`.
  - Action `resetDemoData()` reloads pristine records from initial seed data.

## Testing Decisions

- **Seam Selection**:
  1. **Store & Domain Actions Seam**: Direct verification of state transitions, filter logic, escalation handoffs, pagination slice calculations, and reset routines without DOM overhead.
  2. **View Integration Seam**: Mount top-level views with store providers to verify external interactions:
     - Selecting a table row opens the full Detail View with breadcrumbs.
     - Changing Combobox filters correctly adjusts the visible row count.
     - Clicking page number buttons advances the table window.
     - Triggering Quick Actions (Escalate, Resolve) updates the store and shows toast messages.
- **Criteria for Good Tests**:
  - Test only observable behavior and state, not private component implementation details.
  - Avoid asserting internal HTML markup or CSS class names.
  - Verify that edge cases (e.g. 0 filter results, last page boundary, resetting demo data) render expected user-facing messages.

## Out of Scope

- Real backend server, cloud database, or WebSocket connections (all operations remain local in-memory/localStorage).
- Live email SMTP delivery or real WhatsApp Business API integration (simulated via local channels and timeline records).
- Production authentication server, JWT validation, or password hashing (mock login and Persona Switcher are sufficient for demo).
- File upload storage to S3 or blob storage (attachments are simulated with metadata and local mock assets).

## Further Notes

- All changes maintain compatibility with the existing TypeScript Vite React setup.
- The next step is `/to-tickets` to break this specification down into focused, tracer-bullet implementation tasks with explicit blocking dependencies.

