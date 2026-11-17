import type { Ticket, Team, Department, InboundChannel } from "../../types/barrel";

export interface ExecutiveMetrics {
  totalTickets: number;
  totalActive: number;
  overdueCount: number;
  slaAtRiskOrBreachedCount: number;
  highAttentionCount: number;
  avgResolutionTimeHours: number;
  formattedAvgResolutionTime: string;
}

export interface ChannelBreakdownItem {
  channel: InboundChannel;
  label: string;
  count: number;
  percentage: number;
}

export interface DepartmentBreakdownItem {
  departmentId: string;
  name: string;
  count: number;
  percentage: number;
}

const INACTIVE_STATUSES = new Set(["Resolved", "Closed"]);

export const isTicketActive = (ticket: Ticket): boolean => {
  return !INACTIVE_STATUSES.has(ticket.status);
};

export const isTicketSlaAtRisk = (ticket: Ticket): boolean =>
  isTicketActive(ticket) && (ticket.slaRisk === "Breached" || ticket.slaRisk === "At Risk");

export const getOverdueTickets = (tickets: Ticket[], referenceNow: Date = new Date()): Ticket[] => {
  const nowMs = referenceNow.getTime();
  return tickets.filter((ticket) => {
    if (!isTicketActive(ticket) || !ticket.dueAt) return false;
    const dueMs = Date.parse(ticket.dueAt);
    return !Number.isNaN(dueMs) && dueMs < nowMs;
  });
};

export const getSlaRiskTickets = (tickets: Ticket[]): Ticket[] =>
  tickets.filter(isTicketSlaAtRisk);

export const computeExecutiveMetrics = (
  tickets: Ticket[],
  referenceNow: Date = new Date(),
): ExecutiveMetrics => {
  const totalActive = tickets.filter(isTicketActive).length;
  const overdueCount = getOverdueTickets(tickets, referenceNow).length;
  const slaAtRiskOrBreachedCount = getSlaRiskTickets(tickets).length;

  // Compute average resolution time for resolved / closed tickets
  let totalResolutionTimeMs = 0;
  let resolvedTicketCount = 0;

  for (const ticket of tickets) {
    if (INACTIVE_STATUSES.has(ticket.status)) {
      const createdMs = Date.parse(ticket.createdAt);
      const endMs = ticket.status === "Closed" && ticket.closedAt
        ? Date.parse(ticket.closedAt)
        : Date.parse(ticket.updatedAt);

      if (!Number.isNaN(createdMs) && !Number.isNaN(endMs) && endMs >= createdMs) {
        totalResolutionTimeMs += endMs - createdMs;
        resolvedTicketCount++;
      }
    }
  }

  const avgHours =
    resolvedTicketCount > 0
      ? totalResolutionTimeMs / (resolvedTicketCount * 3600000)
      : 0;

  const roundedHours = Math.round(avgHours * 10) / 10;
  const formattedAvgResolutionTime =
    resolvedTicketCount > 0 ? `${roundedHours.toFixed(1)}h` : "N/A";

  return {
    totalTickets: tickets.length,
    totalActive,
    overdueCount,
    slaAtRiskOrBreachedCount,
    highAttentionCount: getHighAttentionTickets(tickets).length,
    avgResolutionTimeHours: roundedHours,
    formattedAvgResolutionTime,
  };
};

const CHANNEL_LABELS: Record<InboundChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone",
};

export const computeChannelBreakdown = (
  tickets: Ticket[],
): ChannelBreakdownItem[] => {
  const channelCounts: Record<InboundChannel, number> = {
    whatsapp: 0,
    email: 0,
    phone: 0,
  };

  for (const t of tickets) {
    if (t.channel in channelCounts) {
      channelCounts[t.channel]++;
    }
  }

  const total = tickets.length;

  return (["whatsapp", "email", "phone"] as InboundChannel[]).map((channel) => {
    const count = channelCounts[channel];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      channel,
      label: CHANNEL_LABELS[channel],
      count,
      percentage,
    };
  });
};

export const computeDepartmentBreakdown = (
  tickets: Ticket[],
  teams: Team[] = [],
  departments: Department[] = [],
): DepartmentBreakdownItem[] => {
  const teamToDeptId = new Map<string, string>();
  for (const team of teams) {
    teamToDeptId.set(team.id, team.departmentId);
  }

  const deptNames = new Map<string, string>();
  for (const dept of departments) {
    deptNames.set(dept.id, dept.name);
  }

  const countsByDeptId: Record<string, number> = {};

  for (const ticket of tickets) {
    const deptId = ticket.teamId
      ? teamToDeptId.get(ticket.teamId) || "other"
      : "other";
    countsByDeptId[deptId] = (countsByDeptId[deptId] || 0) + 1;
  }

  const total = tickets.length;

  return Object.entries(countsByDeptId).map(([deptId, count]) => {
    const name = deptNames.get(deptId) || (deptId === "other" ? "General / Other" : deptId);
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      departmentId: deptId,
      name,
      count,
      percentage,
    };
  });
};

export const getHighAttentionTickets = (tickets: Ticket[]): Ticket[] => {
  // High attention includes SLA-risk tickets plus urgent/high-priority tickets.
  return tickets
    .filter((ticket) => {
      const active = isTicketActive(ticket);
      const isCritical =
        ticket.priority === "P1 Urgent" ||
        ticket.priority.toLowerCase().includes("urgent") ||
        ticket.priority.toLowerCase().includes("high");
      const isSlaRisk = isTicketSlaAtRisk(ticket);

      return active && (isCritical || isSlaRisk);
    })
    .sort((a, b) => {
      // Prioritize Breached first, then At Risk, then others
      const score = (t: Ticket) => {
        let s = 0;
        if (t.slaRisk === "Breached") s += 4;
        if (t.slaRisk === "At Risk") s += 2;
        if (t.priority.includes("P1")) s += 1;
        return s;
      };
      return score(b) - score(a);
    });
};
