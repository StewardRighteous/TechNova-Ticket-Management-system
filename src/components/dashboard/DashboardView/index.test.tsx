import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { DashboardView } from "./index";
import { useTicketStore } from "../../../store/barrel";

const CurrentPath = () => <output data-testid="current-path">{useLocation().pathname}{useLocation().search}</output>;

describe("DashboardView Integration", () => {
  beforeEach(() => {
    useTicketStore.getState().resetDemoData();
  });

  it("renders the Executive KPI ribbon with computed metrics", () => {
    render(<MemoryRouter><DashboardView /><CurrentPath /></MemoryRouter>);

    expect(screen.getByText("Active Tickets")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("SLA Breached / At Risk")).toBeInTheDocument();
    expect(screen.getByText("Avg Resolution Time")).toBeInTheDocument();
  });

  it("renders Volume Breakdown Cards for channels and departments", () => {
    render(<MemoryRouter><DashboardView /></MemoryRouter>);

    expect(screen.getByText("Ticket source")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("renders High-Attention actionable tickets and navigates on click", () => {
    render(<MemoryRouter><DashboardView /><CurrentPath /></MemoryRouter>);

    expect(
      screen.getByText("Attention Needed"),
    ).toBeInTheDocument();

    // From mockup data, check an actionable ticket like TCK-1089 in the High-Attention table
    const tableElement = screen.getByRole("table");
    expect(tableElement).toBeInTheDocument();

    const ticketElements = screen.getAllByText("TCK-1089");
    expect(ticketElements.length).toBeGreaterThan(0);

    const row = ticketElements[0].closest("tr");
    expect(row).toBeInTheDocument();
    if (row) {
      fireEvent.click(row);
      const state = useTicketStore.getState();
      expect(state.selectedTicketId).toBe("TCK-1089");
      expect(screen.getByTestId("current-path")).toHaveTextContent("/tickets/TCK-1089");
    }
  });

  it("opens a shareable SLA-risk scope from the high-attention registry link", () => {
    render(<MemoryRouter><DashboardView /><CurrentPath /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /open ticket registry/i }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/tickets?scope=sla-risk");
    expect(useTicketStore.getState().ticketTableFocus).toBe("sla-risk");
  });
});
