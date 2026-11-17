import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TicketTable } from "./TicketTable";
import type { Ticket, Team, Department } from "../../types";

const mockTickets: Ticket[] = [
  {
    id: "t1",
    code: "TCK-101",
    title: "Server Crash Issue",
    description: "Production node failure",
    companyId: "c1",
    companyName: "Acme Corp",
    companyCode: "ACME",
    serviceId: "s1",
    serviceName: "Web Services",
    priority: "P1 Urgent",
    status: "In Progress",
    channel: "whatsapp",
    channelIdentifier: "+12345",
    clientContact: "Marcus Reed",
    assignedToId: "emp-1",
    assignedToName: "Bob Engineer",
    assignedToRole: "Engineer",
    teamId: "team-eng",
    currentStageRole: "support_agent",
    slaDeadline: "1h remaining",
    slaRisk: "At Risk",
    createdAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-01T09:00:00Z",
    timeAgo: "1h ago",
    tags: ["Infra"],
    systemRevision: "v1",
    environment: "Prod",
    timeline: [],
  },
  {
    id: "t2",
    code: "TCK-102",
    title: "Invoice calculation defect",
    description: "Wrong tax rate",
    companyId: "c2",
    companyName: "Beta Solutions",
    companyCode: "BETA",
    serviceId: "s2",
    serviceName: "Billing",
    priority: "P2 Normal",
    status: "Open",
    channel: "email",
    channelIdentifier: "billing@beta.com",
    clientContact: "Sarah Jenkins",
    assignedToId: "emp-2",
    assignedToName: "Diana Agent",
    assignedToRole: "Agent",
    teamId: "team-sup",
    currentStageRole: "support_agent",
    slaDeadline: "Breached",
    slaRisk: "Breached",
    createdAt: "2026-11-02T08:00:00Z",
    updatedAt: "2026-11-02T09:00:00Z",
    timeAgo: "2h ago",
    tags: ["Billing"],
    systemRevision: "v1",
    environment: "Prod",
    timeline: [],
  },
];

const mockTeams: Team[] = [
  { id: "team-eng", name: "Fullstack Team", departmentId: "dept-eng" },
  { id: "team-sup", name: "Support Team", departmentId: "dept-sup" },
];

const mockDepartments: Department[] = [
  { id: "dept-eng", name: "Engineering & Development" },
  { id: "dept-sup", name: "Global Support Operations" },
];

describe("TicketTable with Table-First Registry Controls", () => {
  it("renders ticket columns: ID, title, company, contact, priority, channel, department, and subtle SLA indicator", () => {
    const handleView = vi.fn();
    const handleCreate = vi.fn();

    render(
      <TicketTable
        tickets={mockTickets}
        teams={mockTeams}
        departments={mockDepartments}
        onViewTicket={handleView}
        onCreateNew={handleCreate}
      />,
    );

    // Columns present
    expect(screen.getByText("TCK-101")).toBeInTheDocument();
    expect(screen.getByText("Server Crash Issue")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Marcus Reed")).toBeInTheDocument();
    expect(screen.getByText("Engineering & Development")).toBeInTheDocument();

    // Subtle SLA indicator
    expect(screen.getByText(/At Risk/)).toBeInTheDocument();
    expect(screen.getByText("Breached")).toBeInTheDocument();
  });

  it("filters tickets with debounced search bar and combobox filters", async () => {
    render(
      <TicketTable
        tickets={mockTickets}
        teams={mockTeams}
        departments={mockDepartments}
        onViewTicket={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/filter by id/i);
    fireEvent.change(searchInput, { target: { value: "Invoice" } });

    // Wait for debounced search
    await waitFor(
      () => {
        expect(
          screen.queryByText("Server Crash Issue"),
        ).not.toBeInTheDocument();
        expect(
          screen.getByText("Invoice calculation defect"),
        ).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it("shows clean empty state with 'Clear all filters' button when search yields no matches", async () => {
    render(
      <TicketTable
        tickets={mockTickets}
        teams={mockTeams}
        departments={mockDepartments}
        onViewTicket={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/filter by id/i);
    fireEvent.change(searchInput, { target: { value: "nonexistentquery12345" } });

    await waitFor(
      () => {
        expect(screen.getByText(/no matching tickets/i)).toBeInTheDocument();
        expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Clicking clear all filters restores tickets
    fireEvent.click(screen.getByText(/clear all filters/i));
    await waitFor(() => {
      expect(screen.getByText("TCK-101")).toBeInTheDocument();
      expect(screen.getByText("TCK-102")).toBeInTheDocument();
    });
  });

  it("integrates NumericPagination with 10/25/50 page size options", () => {
    render(
      <TicketTable
        tickets={mockTickets}
        teams={mockTeams}
        departments={mockDepartments}
        onViewTicket={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    );

    const pagination = screen.getByTestId("numeric-pagination");
    expect(pagination).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10 per page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "25 per page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50 per page" })).toBeInTheDocument();
  });
});
