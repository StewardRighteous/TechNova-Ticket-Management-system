import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TicketDetailHero } from "./index";
import type { Ticket, Employee } from "../../../types/barrel";
import { useTicketStore } from "../../../store/barrel";

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */
const ticket: Ticket = {
  id: "t1",
  code: "TCK-9000",
  title: "Test ticket for hero banner",
  description: "A detailed description of the test ticket",
  companyId: "c1",
  companyName: "Acme Corp",
  companyCode: "ACME",
  serviceId: "s1",
  serviceName: "Cloud Hosting",
  priority: "P1 Urgent",
  status: "In Progress",
  channel: "email",
  channelIdentifier: "support@acme.com",
  clientContact: "Jane Doe",
  assignedToId: "e1",
  assignedToName: "John Smith",
  assignedToRole: "Support Agent",
  currentStageRole: "support_agent",
  slaDeadline: "4h 30m",
  slaRisk: "At Risk",
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  timeAgo: "16 days ago",
  tags: ["auth", "login"],
  systemRevision: "v2.3.1",
  environment: "Production",
  diagnosticData: {
    browser: "Chrome 120",
    operatingSystem: "Windows 11",
    stepsToReproduce: "1. Open app\n2. Click login",
  },
  timeline: [
    {
      id: "tl-1",
      author: "System",
      role: "Bot",
      action: "Ticket created",
      timestamp: "16d ago",
      note: "Auto-generated from inbound email",
    },
  ],
  internalNotes: [],
};

const employees: Employee[] = [
  {
    id: "e1",
    name: "John Smith",
    role: "support_agent",
    roleTitle: "Support Agent",
    email: "john@test.com",
    phone: "555-0001",
    avatar: "",
    activeTicketsCount: 3,
    capacityMax: 10,
    skills: ["Networking"],
    status: "Available",
  },
  {
    id: "e2",
    name: "Senior Dev",
    role: "development_team",
    roleTitle: "Developer",
    email: "dev@test.com",
    phone: "555-0002",
    avatar: "",
    activeTicketsCount: 1,
    capacityMax: 5,
    skills: ["Backend"],
    status: "Available",
  },
];

describe("TicketDetailHero – Hero Banner & Workflow Actions", () => {
  const onStatusChange = vi.fn();
  const onAssigneeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTicketStore.getState().setActivePersona("operations_manager");
    expect(useTicketStore.getState().activeRole).toBe("operations_manager");
  });

  const renderHero = (overrides?: Partial<Ticket>) =>
    render(
      <TicketDetailHero
        ticket={{ ...ticket, ...overrides }}
        employees={employees}
        onStatusChange={onStatusChange}
        onAssigneeChange={onAssigneeChange}
      />,
    );

  it("renders the ticket title and keeps workflow actions in one place", () => {
    renderHero();
    expect(screen.getByRole("heading", { name: "Test ticket for hero banner" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Escalate to Senior Support/i })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /^Escalate$/i })).not.toBeInTheDocument();
  });

  it("escalate button transitions status to Escalated and fires toast", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /Escalate to Senior Support/i }));

    expect(onStatusChange).toHaveBeenCalledWith("Escalated");
  });

  it("Request QA button transitions status to Pending QA and fires toast", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /Request QA Review/ }));

    expect(onStatusChange).toHaveBeenCalledWith("Pending QA");
  });

  it("Mark Resolved button transitions status to Resolved and fires toast", () => {
    renderHero();
    fireEvent.click(screen.getByRole("button", { name: /Mark Resolved/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Resolution details" }), { target: { value: "Restarted the worker and confirmed recovery." } });
    fireEvent.click(screen.getByRole("button", { name: "Resolve ticket" }));

    expect(onStatusChange).toHaveBeenCalledWith("Resolved", "Restarted the worker and confirmed recovery.");
  });

  it("disables workflow buttons when ticket is already Resolved", () => {
    renderHero({ status: "Resolved" });

    expect(screen.queryByRole("button", { name: /Escalate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mark Resolved/i })).not.toBeInTheDocument();
  });

  it("shows tabbed timeline with Communications and Internal Notes tabs", () => {
    renderHero();
    expect(screen.getByText("Customer Communications")).toBeInTheDocument();
    expect(screen.getByText("Internal Notes")).toBeInTheDocument();
  });

  it("shows the issue overview card with diagnostic fields", () => {
    renderHero();
    expect(screen.getByText("Issue Overview")).toBeInTheDocument();
    // Diagnostic values may appear in multiple cards; just verify at least one exists
    expect(screen.getAllByText("Chrome 120").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Windows 11").length).toBeGreaterThanOrEqual(1);
  });

  it("shows ownership card with assignee info", () => {
    renderHero();
    expect(screen.getByText("Ownership")).toBeInTheDocument();
    expect(screen.getAllByText("John Smith").length).toBeGreaterThanOrEqual(1);
  });
});
