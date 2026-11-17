import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SettingsView } from "./SettingsView";
import { useTicketStore } from "../../store/barrel";
import { ToastNotificationContainer } from "../common/ToastNotificationContainer";

describe("Settings demo reset", () => {
  beforeEach(() => {
    localStorage.clear();
    useTicketStore.getState().resetDemoData();
  });

  it("keeps saved records when reset is cancelled or dismissed with Escape", () => {
    const ticket = useTicketStore.getState().data.tickets[0];
    useTicketStore.getState().updateTicket(ticket.id, { title: "Keep this change" });
    render(<><SettingsView /><ToastNotificationContainer /></>);

    fireEvent.click(screen.getByRole("button", { name: "Reset to Seed Data" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)?.title).toBe("Keep this change");

    fireEvent.click(screen.getByRole("button", { name: "Reset to Seed Data" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)?.title).toBe("Keep this change");
    expect(screen.getByRole("button", { name: "Reset to Seed Data" })).toHaveFocus();
  });

  it("resets only after explicit confirmation and reports the result", () => {
    const ticket = useTicketStore.getState().data.tickets[0];
    useTicketStore.getState().updateTicket(ticket.id, { title: "Discard this change" });
    render(<><SettingsView /><ToastNotificationContainer /></>);

    fireEvent.click(screen.getByRole("button", { name: "Reset to Seed Data" }));
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)?.title).toBe("Discard this change");
    fireEvent.click(screen.getByRole("button", { name: "Reset demo data" }));
    expect(useTicketStore.getState().data.tickets.find((item) => item.id === ticket.id)?.title).not.toBe("Discard this change");
    expect(screen.getByText("Demo data restored. Your active persona was preserved.")).toBeInTheDocument();
  });
});
