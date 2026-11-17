import { describe, it, expect } from "vitest";
import {
  computeExecutiveMetrics,
  computeChannelBreakdown,
  computeDepartmentBreakdown,
  getHighAttentionTickets,
  getOverdueTickets,
  getSlaRiskTickets,
} from "./dashboardMetrics";
import type { Ticket, Team, Department } from "../../types/barrel";

describe("Executive Dashboard Metrics & Breakdowns", () => {
  const departments: Department[] = [
    { id: "dept-eng", name: "Engineering & Development" },
    { id: "dept-support", name: "Global Support Operations" },
  ];

  const teams: Team[] = [
    { id: "team-eng", name: "Fullstack Team", departmentId: "dept-eng" },
    { id: "team-sup", name: "Support Tier 1", departmentId: "dept-support" },
  ];

  const mockTickets: Ticket[] = [
    {
      id: "t1",
      code: "TCK-101",
      title: "Active Urgent Issue",
      description: "Sample",
      companyId: "c1",
      companyName: "Acme Corp",
      companyCode: "ACME",
      serviceId: "s1",
      serviceName: "Web App",
      priority: "P1 Urgent",
      status: "In Progress",
      channel: "whatsapp",
      channelIdentifier: "+12345",
      clientContact: "Alice",
      assignedToId: "emp-1",
      assignedToName: "Bob",
      assignedToRole: "Engineer",
      teamId: "team-eng",
      currentStageRole: "support_agent",
      slaDeadline: "1h",
      dueAt: "2026-11-01T10:00:00Z", // overdue compared to now or reference
      slaRisk: "At Risk",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T09:00:00Z",
      timeAgo: "1h ago",
      tags: [],
      systemRevision: "v1",
      environment: "prod",
      timeline: [],
    },
    {
      id: "t2",
      code: "TCK-102",
      title: "Breached SLA Ticket",
      description: "Sample",
      companyId: "c1",
      companyName: "Acme Corp",
      companyCode: "ACME",
      serviceId: "s1",
      serviceName: "Web App",
      priority: "P2 Normal",
      status: "Open",
      channel: "email",
      channelIdentifier: "test@acme.com",
      clientContact: "Alice",
      assignedToId: "emp-1",
      assignedToName: "Bob",
      assignedToRole: "Engineer",
      teamId: "team-sup",
      currentStageRole: "support_agent",
      slaDeadline: "Expired",
      dueAt: "2026-11-01T12:00:00Z",
      slaRisk: "Breached",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T09:00:00Z",
      timeAgo: "1h ago",
      tags: [],
      systemRevision: "v1",
      environment: "prod",
      timeline: [],
    },
    {
      id: "t3",
      code: "TCK-103",
      title: "Resolved Ticket",
      description: "Sample",
      companyId: "c2",
      companyName: "Beta Corp",
      companyCode: "BETA",
      serviceId: "s1",
      serviceName: "Web App",
      priority: "P3 Low",
      status: "Resolved",
      channel: "phone",
      channelIdentifier: "+98765",
      clientContact: "Charlie",
      assignedToId: "emp-2",
      assignedToName: "Dave",
      assignedToRole: "Agent",
      teamId: "team-sup",
      currentStageRole: "support_agent",
      slaDeadline: "Met",
      dueAt: "2026-11-05T10:00:00Z",
      slaRisk: "On Target",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T11:00:00Z", // resolved in 3h
      timeAgo: "2d ago",
      tags: [],
      systemRevision: "v1",
      environment: "prod",
      timeline: [],
    },
    {
      id: "t4",
      code: "TCK-104",
      title: "Closed Ticket",
      description: "Sample",
      companyId: "c2",
      companyName: "Beta Corp",
      companyCode: "BETA",
      serviceId: "s1",
      serviceName: "Web App",
      priority: "P4 Trivial",
      status: "Closed",
      channel: "email",
      channelIdentifier: "dev@beta.com",
      clientContact: "Charlie",
      assignedToId: "emp-2",
      assignedToName: "Dave",
      assignedToRole: "Agent",
      teamId: "team-eng",
      currentStageRole: "support_agent",
      slaDeadline: "Met",
      dueAt: "2026-11-05T10:00:00Z",
      slaRisk: "On Target",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T13:00:00Z",
      closedAt: "2026-11-01T13:00:00Z", // resolved/closed in 5h
      timeAgo: "2d ago",
      tags: [],
      systemRevision: "v1",
      environment: "prod",
      timeline: [],
    },
  ];

  it("computes executive KPI metrics correctly", () => {
    // Reference time after dueAt dates
    const refNow = new Date("2026-11-02T00:00:00Z");
    const metrics = computeExecutiveMetrics(mockTickets, refNow);

    // Active tickets: not Resolved and not Closed -> t1 and t2 (2 tickets)
    expect(metrics.totalActive).toBe(2);
    expect(metrics.totalTickets).toBe(4);
    expect(metrics.highAttentionCount).toBe(2);

    // Overdue tickets: active tickets where dueAt < refNow -> t1, t2 (2 tickets)
    expect(metrics.overdueCount).toBe(2);

    // SLA Breached / At Risk: slaRisk is 'Breached' or 'At Risk' (among active tickets) -> t1 (At Risk), t2 (Breached) -> 2
    expect(metrics.slaAtRiskOrBreachedCount).toBe(2);

    // Average resolution time: t3 resolved in 3h (180 min), t4 closed in 5h (300 min). Avg = 4h (240 min)
    expect(metrics.avgResolutionTimeHours).toBe(4);
    expect(metrics.formattedAvgResolutionTime).toBe("4.0h");
  });

  it("uses matching active, overdue, SLA-risk, and high-attention scopes with a fixed reference time", () => {
    const referenceNow = new Date("2026-11-02T00:00:00Z");
    const urgentOnTarget: Ticket = {
      ...mockTickets[0],
      id: "t5",
      code: "TCK-105",
      title: "Urgent but on target",
      priority: "P1 Urgent",
      status: "Open",
      dueAt: "2026-11-02T01:00:00Z",
      slaRisk: "On Target",
    };
    const missingDeadline: Ticket = {
      ...mockTickets[1],
      id: "t6",
      code: "TCK-106",
      title: "No SLA deadline",
      priority: "P2 Normal",
      dueAt: undefined,
      slaRisk: "On Target",
    };
    const tickets = [...mockTickets, urgentOnTarget, missingDeadline];
    const metrics = computeExecutiveMetrics(tickets, referenceNow);

    expect(metrics.totalActive).toBe(4);
    expect(metrics.totalTickets).toBe(6);
    expect(metrics.highAttentionCount).toBe(3);
    expect(metrics.overdueCount).toBe(2);
    expect(metrics.slaAtRiskOrBreachedCount).toBe(2);
    expect(getOverdueTickets(tickets, referenceNow).map((ticket) => ticket.id)).toEqual(["t1", "t2"]);
    expect(getSlaRiskTickets(tickets).map((ticket) => ticket.id)).toEqual(["t1", "t2"]);
    expect(getHighAttentionTickets(tickets).map((ticket) => ticket.id)).toEqual(["t2", "t1", "t5"]);
  });

  it("returns calm, explicit values for an empty dashboard and excludes tickets with no valid deadline", () => {
    expect(computeExecutiveMetrics([], new Date("2026-11-02T00:00:00Z"))).toMatchObject({
      totalActive: 0,
      totalTickets: 0,
      overdueCount: 0,
      slaAtRiskOrBreachedCount: 0,
      highAttentionCount: 0,
      formattedAvgResolutionTime: "N/A",
    });
    const missingDeadline = { ...mockTickets[0], dueAt: undefined };
    expect(getOverdueTickets([missingDeadline], new Date("2026-11-02T00:00:00Z"))).toEqual([]);
  });

  it("computes volume breakdown by intake channel correctly", () => {
    const channelBreakdown = computeChannelBreakdown(mockTickets);
    expect(channelBreakdown).toEqual([
      { channel: "whatsapp", label: "WhatsApp", count: 1, percentage: 25 },
      { channel: "email", label: "Email", count: 2, percentage: 50 },
      { channel: "phone", label: "Phone", count: 1, percentage: 25 },
    ]);
  });

  it("computes volume breakdown by department correctly", () => {
    const deptBreakdown = computeDepartmentBreakdown(
      mockTickets,
      teams,
      departments,
    );
    // dept-eng has t1, t4 -> 2
    // dept-support has t2, t3 -> 2
    expect(deptBreakdown).toContainEqual({
      departmentId: "dept-eng",
      name: "Engineering & Development",
      count: 2,
      percentage: 50,
    });
    expect(deptBreakdown).toContainEqual({
      departmentId: "dept-support",
      name: "Global Support Operations",
      count: 2,
      percentage: 50,
    });
  });

  it("filters and sorts high-attention actionable tickets correctly", () => {
    const highAttention = getHighAttentionTickets(mockTickets);
    // Critical (P1) or SLA At Risk / Breached
    // t1 is P1 Urgent & At Risk
    // Breached ranked higher than At Risk: t2 ('Breached') before t1 ('At Risk')
    expect(highAttention.map((t) => t.id)).toEqual(["t2", "t1"]);
  });
});
