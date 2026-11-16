import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { DashboardView } from "./DashboardView";
import { useTicketStore } from "../../store";

describe("DashboardView Integration", () => {
  beforeEach(() => {
    useTicketStore.getState().resetDemoData();
  });

  it("renders the Executive KPI ribbon with computed metrics", () => {
    render(<DashboardView />);

    expect(screen.getByText("Active Tickets")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("SLA Breached / At Risk")).toBeInTheDocument();
    expect(screen.getByText("Avg Resolution Time")).toBeInTheDocument();
  });

  it("renders Volume Breakdown Cards for channels and departments", () => {
    render(<DashboardView />);

    expect(screen.getByText("Tickets by Intake Channel")).toBeInTheDocument();
    expect(screen.getByText("Tickets by Department")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("renders High-Attention actionable tickets and navigates on click", () => {
    render(<DashboardView />);

    expect(
      screen.getByText("High-Attention & Critical Incidents"),
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
      expect(state.activeTab).toBe("tickets");
    }
  });
});
