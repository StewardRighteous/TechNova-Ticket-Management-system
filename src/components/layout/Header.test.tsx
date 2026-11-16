import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { ToastNotificationContainer } from "../common/ToastNotificationContainer";
import { useTicketStore } from "../../store";

describe("Header & Persona Switcher Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    useTicketStore.getState().resetDemoData();
  });

  it("renders persona switcher and switches roles with toast feedback", () => {
    render(
      <>
        <Header />
        <ToastNotificationContainer />
      </>
    );

    const select = screen.getByLabelText("Active Persona") as HTMLSelectElement;
    expect(select.value).toBe("operations_manager");

    fireEvent.change(select, { target: { value: "support_agent" } });

    expect(useTicketStore.getState().activeRole).toBe("support_agent");
    expect(screen.getByText("Switched persona to Support Agent")).toBeInTheDocument();
  });

  it("triggers reset demo data and displays confirmation toast", () => {
    // Mutate a ticket first
    const firstTicket = useTicketStore.getState().data.tickets[0];
    useTicketStore.getState().updateTicket(firstTicket.id, { title: "Custom Mutated Title" });
    expect(useTicketStore.getState().data.tickets[0].title).toBe("Custom Mutated Title");

    render(
      <>
        <Header />
        <ToastNotificationContainer />
      </>
    );

    const resetButton = screen.getByTitle("Reset Demo Data");
    fireEvent.click(resetButton);

    expect(useTicketStore.getState().data.tickets[0].title).not.toBe("Custom Mutated Title");
    expect(
      screen.getByText("Demo data successfully restored to seed state.")
    ).toBeInTheDocument();
  });
});
