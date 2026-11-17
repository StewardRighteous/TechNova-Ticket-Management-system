import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExecutiveKpiRibbon } from "./ExecutiveKpiRibbon";
import { VolumeBreakdownCards } from "./VolumeBreakdownCards";
import { HighAttentionTicketsTable } from "./HighAttentionTicketsTable";
import type { Ticket, Team, Department } from "../../types";

const mockTickets: Ticket[] = [
  {
    id: "t1",
    code: "TCK-101",
    title: "Critical Server Crash",
    description: "Server unresponsive",
    companyId: "c1",
    companyName: "Acme Corp",
    companyCode: "ACME",
    serviceId: "s1",
    serviceName: "Infrastructure",
    priority: "P1 Urgent",
    status: "In Progress",
    channel: "whatsapp",
    channelIdentifier: "+12345",
    clientContact: "Alice",
    assignedToId: "emp-1",
    assignedToName: "Bob Dev",
    assignedToRole: "Engineer",
    teamId: "team-eng",
    currentStageRole: "development_team",
    slaDeadline: "30m remaining",
    dueAt: "2026-11-01T10:00:00Z",
    slaRisk: "At Risk",
    createdAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-01T09:00:00Z",
    timeAgo: "1h ago",
    tags: ["Critical", "Outage"],
    systemRevision: "v1",
    environment: "Production",
    timeline: [],
  },
  {
    id: "t2",
    code: "TCK-102",
    title: "Payment Gateway Failure",
    description: "Transactions failing",
    companyId: "c2",
    companyName: "Beta Corp",
    companyCode: "BETA",
    serviceId: "s2",
    serviceName: "Payments",
    priority: "P2 Normal",
    status: "Open",
    channel: "email",
    channelIdentifier: "support@beta.com",
    clientContact: "Charlie",
    assignedToId: "emp-2",
    assignedToName: "Diana Support",
    assignedToRole: "Support Agent",
    teamId: "team-sup",
    currentStageRole: "support_agent",
    slaDeadline: "Breached",
    dueAt: "2026-11-01T09:00:00Z",
    slaRisk: "Breached",
    createdAt: "2026-11-01T07:00:00Z",
    updatedAt: "2026-11-01T09:30:00Z",
    timeAgo: "2h ago",
    tags: ["Billing"],
    systemRevision: "v1",
    environment: "Production",
    timeline: [],
  },
];

const mockTeams: Team[] = [
  { id: "team-eng", name: "Engineering Team", departmentId: "dept-eng" },
  { id: "team-sup", name: "Support Team", departmentId: "dept-sup" },
];

const mockDepartments: Department[] = [
  { id: "dept-eng", name: "Engineering & Development" },
  { id: "dept-sup", name: "Global Support Operations" },
];

describe("Executive Dashboard UI Components", () => {
  it("renders ExecutiveKpiRibbon with computed active, overdue, SLA-at-risk (crimson highlight), and avg resolution metrics", () => {
    render(
      <ExecutiveKpiRibbon
        totalActive={12}
        overdueCount={3}
        slaAtRiskOrBreachedCount={4}
        formattedAvgResolutionTime="3.5h"
      />,
    );

    expect(screen.getByText("Active Tickets")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("SLA Breached / At Risk")).toBeInTheDocument();
    const slaCount = screen.getByText("4");
    expect(slaCount).toBeInTheDocument();
    // Verify crimson styling (either inline style or crimson/red color class)
    expect(slaCount.closest("[data-testid='sla-risk-kpi']")).toHaveClass(
      "border-rose-500",
    );

    expect(screen.getByText("Avg Resolution Time")).toBeInTheDocument();
    expect(screen.getByText("3.5h")).toBeInTheDocument();
  });

  it("renders VolumeBreakdownCards with channel and department distribution", () => {
    render(
      <VolumeBreakdownCards
        tickets={mockTickets}
        teams={mockTeams}
        departments={mockDepartments}
      />,
    );

    expect(screen.getByText("Tickets by Intake Channel")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();

    expect(screen.getByText("Tickets by Department")).toBeInTheDocument();
    expect(screen.getByText("Engineering & Development")).toBeInTheDocument();
    expect(screen.getByText("Global Support Operations")).toBeInTheDocument();
  });

  it("renders HighAttentionTicketsTable with critical tickets and SLA tags, navigating on row click", () => {
    const handleSelect = vi.fn();
    render(
      <HighAttentionTicketsTable
        tickets={mockTickets}
        onSelectTicket={handleSelect}
      />,
    );

    expect(
      screen.getByText("High-Attention & Critical Incidents"),
    ).toBeInTheDocument();

    // Tickets listed
    expect(screen.getByText("Critical Server Crash")).toBeInTheDocument();
    expect(screen.getByText("Payment Gateway Failure")).toBeInTheDocument();

    // SLA badges
    expect(screen.getByText(/At Risk/)).toBeInTheDocument();
    expect(screen.getByText("Breached")).toBeInTheDocument();

    // Row click
    const row = screen.getByText("Critical Server Crash").closest("tr");
    expect(row).toBeInTheDocument();
    if (row) {
      fireEvent.click(row);
      expect(handleSelect).toHaveBeenCalledWith("t1");
    }
  });
});
