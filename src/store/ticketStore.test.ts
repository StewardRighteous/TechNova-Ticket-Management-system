import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTicketStore } from "./ticketStore";
import initialData from "../../mockup.json";
import { STORAGE_KEY } from "./storage";
import type { Employee } from "../types/barrel";

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

  it("preserves the active persona when that persona exists in seed data", () => {
    const seedAgent = initialData.employees.find((employee) => employee.role === "support_agent")!;
    useTicketStore.getState().loginAsEmployee(seedAgent.id);
    useTicketStore.getState().resetDemoData();
    expect(useTicketStore.getState().currentUser?.id).toBe(seedAgent.id);
    expect(useTicketStore.getState().activeRole).toBe("support_agent");
    expect(useTicketStore.getState().isAuthenticated).toBe(true);
  });

  it("returns a removed active persona to the default demo identity after reset", () => {
    const customEmployee: Employee = { ...(initialData.employees[0] as Employee), id: "custom-user", name: "Custom User" };
    const state = useTicketStore.getState();
    useTicketStore.setState({
      data: { ...state.data, employees: [...state.data.employees, customEmployee] },
      currentUser: customEmployee,
      activeRole: customEmployee.role,
    });
    useTicketStore.getState().resetDemoData();
    expect(useTicketStore.getState().currentUser?.id).toBe(initialData.employees[0].id);
    expect(useTicketStore.getState().isAuthenticated).toBe(true);
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

  it("remembers an explicitly selected demo persona for this tab and clears it on sign out", () => {
    const seedAgent = initialData.employees.find((employee) => employee.role === "support_agent")!;
    useTicketStore.getState().loginAsEmployee(seedAgent.id);
    expect(sessionStorage.getItem("technova_demo_persona")).toBe(seedAgent.id);
    expect(useTicketStore.getState().currentUser?.id).toBe(seedAgent.id);

    useTicketStore.getState().logout();
    expect(sessionStorage.getItem("technova_demo_persona")).toBeNull();
    expect(useTicketStore.getState().isAuthenticated).toBe(false);
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

  it("routes escalated and QA tickets atomically with one accurate activity entry", () => {
    const store = useTicketStore.getState();
    store.setActivePersona("operations_manager");
    const ticket = store.data.tickets.find((item) => item.status === "In Progress")!;
    const originalTimelineLength = ticket.timeline.length;

    store.updateTicketStatus(ticket.id, "Escalated");
    const escalated = useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)!;
    expect(escalated.status).toBe("Escalated");
    expect(escalated.currentStageRole).toBe("senior_support");
    expect(escalated.assignedToId).toBe(useTicketStore.getState().data.employees.find((item) => item.role === "senior_support")?.id);
    expect(escalated.timeline).toHaveLength(originalTimelineLength + 1);
    expect(escalated.timeline.at(-1)?.action).toContain("Routed to Senior Support");

    store.updateTicketStatus(ticket.id, "Pending QA");
    const qaTicket = useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)!;
    expect(qaTicket.status).toBe("Pending QA");
    expect(qaTicket.currentStageRole).toBe("qa");
    expect(qaTicket.timeline).toHaveLength(originalTimelineLength + 2);
    expect(qaTicket.timeline.at(-1)?.action).toContain("Routed to QA");
  });

  it("rejects invalid transitions and resolution without details without changing the record", () => {
    const store = useTicketStore.getState();
    store.setActivePersona("operations_manager");
    const ticket = store.data.tickets.find((item) => item.status === "Closed")!;
    const before = structuredClone(ticket);
    store.updateTicketStatus(ticket.id, "In Progress");
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)).toEqual(before);

    const activeTicket = store.data.tickets.find((item) => item.status === "In Progress")!;
    const activeBefore = structuredClone(activeTicket);
    store.updateTicketStatus(activeTicket.id, "Resolved");
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === activeTicket.id)).toEqual(activeBefore);
    store.updateTicketStatus(activeTicket.id, "Resolved", "Restarted the affected service and verified recovery.");
    const resolved = useTicketStore.getState().data.tickets.find((item) => item.id === activeTicket.id)!;
    expect(resolved.resolutionDetails).toBe("Restarted the affected service and verified recovery.");
    expect(resolved.timeline.at(-1)?.note).toContain("Restarted the affected service");
  });

  it("rejects stale or mismatched company contacts when creating a ticket", () => {
    const store = useTicketStore.getState();
    store.setActivePersona("operations_manager");
    const company = store.data.companies.find((item) => item.contacts?.length)!;
    const otherCompany = store.data.companies.find((item) => item.id !== company.id && item.contacts?.length)!;
    const template = store.data.tickets[0];
    const { id: _id, code: _code, createdAt: _createdAt, updatedAt: _updatedAt, timeAgo: _timeAgo, timeline: _timeline, ...input } = template;
    const beforeCount = store.data.tickets.length;

    store.addTicket({ ...input, code: "", companyId: company.id, companyName: company.name, companyCode: company.code, contactId: otherCompany.contacts![0].id });
    expect(useTicketStore.getState().data.tickets).toHaveLength(beforeCount);

    store.addTicket({ ...input, code: "", companyId: company.id, companyName: company.name, companyCode: company.code, contactId: company.contacts![0].id, clientContact: "Stale display name" });
    expect(useTicketStore.getState().data.tickets).toHaveLength(beforeCount + 1);
    expect(useTicketStore.getState().data.tickets[0].clientContact).toBe(company.contacts![0].name);
    expect(useTicketStore.getState().data.tickets[0].companyId).toBe(company.id);
  });
});

