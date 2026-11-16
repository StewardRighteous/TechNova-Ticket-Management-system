# 01: Core Domain Store, Local Persistence & Demo Reset Engine

**What to build:**
Centralized client-side state store and domain mutation engine backed by browser `localStorage` and initialized from seed data (`mockup.json`). Provides an instant "Reset Demo Data" action to restore pristine records for live client pitches, a global Persona Switcher context (Support Agent, Dev Lead, Operations Manager), and a lightweight Toast notification dispatcher for action confirmations.

**Blocked by:**
None (can start immediately)

**Status:**
ready-for-review

- [x] Store state correctly loads and synchronizes entities (tickets, companies, employees, services) with localStorage.
- [x] A `resetDemoData()` store action restores all entities back to the initial pristine seed data.
- [x] Active Persona Switcher context supports switching between Support Agent, Dev Lead, and Operations Manager.
- [x] Toast notification engine supports adding and auto-dismissing feedback messages for user actions.

