import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTicketStore } from "./ticketStore";
import initialData from "../../mockup.json";
import { STORAGE_KEY } from "./storage";

describe("TicketStore - Core Domain Store, Local Persistence & Demo Reset", () => {
  beforeEach(() => {
    localStorage.clear();
    useTicketStore.getState().resetDemoData?.();
  });

  it("synchronizes entity updates with localStorage and reloads correctly", () => {
    const store = useTicketStore.getState();
    expect(store.data.tickets.length).toBeGreaterThan(0);

    // Modify a ticket
    const ticketId = store.data.tickets[0].id;
    store.updateTicket(ticketId, { title: "Updated Test Title" });

    // Verify in store state
    expect(
      useTicketStore.getState().data.tickets.find((t) => t.id === ticketId)?.title
    ).toBe("Updated Test Title");

    // Verify localStorage was updated
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    expect(saved.tickets.find((t: any) => t.id === ticketId)?.title).toBe(
      "Updated Test Title"
    );
  });

  it("restores all entities back to initial pristine seed data on resetDemoData()", () => {
    const store = useTicketStore.getState();
    const firstTicket = store.data.tickets[0];

    // Change title and verify it changed
    store.updateTicket(firstTicket.id, { title: "Temporary Title Change" });
    expect(
      useTicketStore.getState().data.tickets.find((t) => t.id === firstTicket.id)?.title
    ).toBe("Temporary Title Change");

    // Call resetDemoData
    store.resetDemoData();

    // Check store returned to initial data
    const restoredTicket = useTicketStore
      .getState()
      .data.tickets.find((t) => t.id === firstTicket.id);
    expect(restoredTicket?.title).toBe(initialData.tickets[0].title);

    // Verify localStorage also matches initial data
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    expect(saved.tickets[0].title).toBe(initialData.tickets[0].title);
  });

  it("supports switching active persona between Support Agent, Dev Lead, and Operations Manager", () => {
    const store = useTicketStore.getState();

    store.setActivePersona("support_agent");
    expect(useTicketStore.getState().activeRole).toBe("support_agent");
    expect(useTicketStore.getState().currentUser?.role).toBe("support_agent");

    store.setActivePersona("development_team");
    expect(useTicketStore.getState().activeRole).toBe("development_team");
    expect(useTicketStore.getState().currentUser?.role).toBe("development_team");

    store.setActivePersona("operations_manager");
    expect(useTicketStore.getState().activeRole).toBe("operations_manager");
    expect(useTicketStore.getState().currentUser?.role).toBe("operations_manager");
  });

  it("supports adding and auto-dismissing toast notifications", () => {
    vi.useFakeTimers();
    const store = useTicketStore.getState();

    expect(store.toasts).toEqual([]);

    store.addToast("Ticket created successfully", "success", 3000);
    const toasts = useTicketStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe("Ticket created successfully");
    expect(toasts[0].type).toBe("success");

    // Advance timers by 3000ms
    vi.advanceTimersByTime(3000);

    expect(useTicketStore.getState().toasts.length).toBe(0);

    vi.useRealTimers();
  });
});

