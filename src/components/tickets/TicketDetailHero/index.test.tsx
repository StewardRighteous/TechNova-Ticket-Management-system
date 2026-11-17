import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TicketDetailHero } from "./index";
import type { Ticket, Employee } from "../../../types/barrel";

/* ------------------------------------------------------------------ */
/* Minimal zustand mock — spy on addToast and addTicketTimelineNote    */
/* ------------------------------------------------------------------ */
const mockAddToast = vi.fn();
const mockAddTicketTimelineNote = vi.fn();

vi.mock("../../store/barrel", () => ({
  useTicketStore: () => ({
    addToast: mockAddToast,
    addTicketTimelineNote: mockAddTicketTimelineNote,
  }),
}));

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
  const onBack = vi.fn();
  const onStatusChange = vi.fn();
  const onAssigneeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("renders the hero banner with ticket code, title, and SLA countdown", () => {
    renderHero();
    // TCK-9000 appears in both breadcrumb and hero banner
    expect(screen.getAllByText("TCK-9000").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText("Test ticket for hero banner"),
    ).toBeInTheDocument();
    // SLA risk badge text
    expect(screen.getAllByText("At Risk").length).toBeGreaterThanOrEqual(1);
  });

  it("displays breadcrumb that navigates back", () => {
    renderHero();
    const backBtn = screen.getByText("← Back to Tickets");
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("escalate button transitions status to Escalated and fires toast", () => {
    renderHero();
    // The hero banner has an "Escalate" quick-action button
    const escalateButtons = screen.getAllByText("Escalate");
    // Click the first one (hero banner quick action)
    fireEvent.click(escalateButtons[0]);

    expect(onStatusChange).toHaveBeenCalledWith("Escalated");
    expect(mockAddToast).toHaveBeenCalledWith(
      "TCK-9000 escalated to Senior Support / Dev",
      "warning",
    );
  });

  it("Request QA button transitions status to Pending QA and fires toast", () => {
    renderHero();
    const qaButtons = screen.getAllByText("Request QA Review");
    fireEvent.click(qaButtons[0]);

    expect(onStatusChange).toHaveBeenCalledWith("Pending QA");
    expect(mockAddToast).toHaveBeenCalledWith(
      "TCK-9000 sent for QA review",
      "info",
    );
  });

  it("Mark Resolved button transitions status to Resolved and fires toast", () => {
    renderHero();
    const resolveButtons = screen.getAllByText("Mark Resolved");
    fireEvent.click(resolveButtons[0]);

    expect(onStatusChange).toHaveBeenCalledWith("Resolved");
    expect(mockAddToast).toHaveBeenCalledWith(
      "TCK-9000 marked as resolved",
      "success",
    );
  });

  it("disables workflow buttons when ticket is already Resolved", () => {
    renderHero({ status: "Resolved" });

    const escalateButtons = screen.getAllByRole("button", {
      name: /Escalate/i,
    });
    for (const btn of escalateButtons) {
      expect(btn).toBeDisabled();
    }
    const resolveButtons = screen.getAllByRole("button", {
      name: /Mark Resolved/i,
    });
    for (const btn of resolveButtons) {
      expect(btn).toBeDisabled();
    }
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
