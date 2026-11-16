# 02: Minimal Enterprise Design System & Shared Navigation Controls

**What to build:**
A unified minimal enterprise styling layer (slate `#0F172A`, neutral borders, low-saturation badges) and shared interactive controls across the application:
1. Reusable `<NumericPagination />` component providing smart numbered buttons (`1, 2, 3 ... N`), previous/next arrows, page size selector (`10, 25, 50`), and `Showing X–Y of Z` range counter.
2. Reusable `<ComboboxFilter />` component providing compact, keyboard-friendly dropdown filtering with active clearable badges.
3. Top navigation bar header housing the active Persona Switcher and a "Reset Demo Data" action button.
4. Global toast container rendering feedback toasts.

**Blocked by:**
01: Core Domain Store, Local Persistence & Demo Reset Engine

**Status:**
ready-for-agent

- [ ] Global styling uses a minimal, high-contrast, low-saturation enterprise color palette.
- [ ] `<NumericPagination />` renders numbered page buttons, supports windowing, allows changing page size, and calculates correct record slices.
- [ ] `<ComboboxFilter />` allows selecting and clearing filter values with compact UI badges.
- [ ] Top bar header displays active persona selector and one-click demo data reset action with confirmation toast.
- [ ] Toast notification container renders toasts with clean animations and auto-dismiss.

