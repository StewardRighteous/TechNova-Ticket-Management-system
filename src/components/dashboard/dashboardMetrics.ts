import type { Ticket, Team, Department, InboundChannel } from "../../types/barrel";
import { ticketSlaRisk } from "../../utils/supportPolicy";

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

export interface VolumeComparison {
  currentCount: number;
  previousCount: number;
  difference: number;
  percentage: number | null;
}

export type VolumeComparisonMap = Record<string, VolumeComparison>;

/** Compares tickets created in the last seven days with the seven days before that. */
export const computeVolumeComparison = (
  tickets: Ticket[],
  referenceNow: Date = new Date(),
): VolumeComparison => {
  const nowMs = referenceNow.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const currentStartMs = nowMs - weekMs;
  const previousStartMs = nowMs - weekMs * 2;
  let currentCount = 0;
  let previousCount = 0;

  for (const ticket of tickets) {
    const createdMs = Date.parse(ticket.createdAt);
    if (Number.isNaN(createdMs)) continue;
    if (createdMs >= currentStartMs && createdMs <= nowMs) currentCount++;
    else if (createdMs >= previousStartMs && createdMs < currentStartMs) previousCount++;
  }

  const difference = currentCount - previousCount;
  const percentage = previousCount > 0
    ? Math.round((Math.abs(difference) / previousCount) * 100)
    : currentCount > 0 ? null : 0;

  return { currentCount, previousCount, difference, percentage };
};

export const computeVolumeComparisons = (
  tickets: Ticket[],
  getKey: (ticket: Ticket) => string,
  referenceNow: Date = new Date(),
): VolumeComparisonMap => {
  const nowMs = referenceNow.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const currentStartMs = nowMs - weekMs;
  const previousStartMs = nowMs - weekMs * 2;
  const counts = new Map<string, { currentCount: number; previousCount: number }>();

  for (const ticket of tickets) {
    const createdMs = Date.parse(ticket.createdAt);
    if (Number.isNaN(createdMs)) continue;
    const key = getKey(ticket);
    const entry = counts.get(key) || { currentCount: 0, previousCount: 0 };
    if (createdMs >= currentStartMs && createdMs <= nowMs) entry.currentCount++;
    else if (createdMs >= previousStartMs && createdMs < currentStartMs) entry.previousCount++;
    counts.set(key, entry);
  }

  return Object.fromEntries([...counts.entries()].map(([key, { currentCount, previousCount }]) => {
    const difference = currentCount - previousCount;
    const percentage = previousCount > 0
      ? Math.round((Math.abs(difference) / previousCount) * 100)
      : currentCount > 0 ? null : 0;
    return [key, { currentCount, previousCount, difference, percentage }];
  }));
};

const INACTIVE_STATUSES = new Set(["Resolved", "Closed"]);

export const isTicketActive = (ticket: Ticket): boolean => {
  return !INACTIVE_STATUSES.has(ticket.status);
};

export const isTicketSlaAtRisk = (ticket: Ticket, now = Date.now()): boolean =>
  isTicketActive(ticket) && ticketSlaRisk(ticket, now) !== "On Target";

export const getOverdueTickets = (tickets: Ticket[], referenceNow: Date = new Date()): Ticket[] => {
  const nowMs = referenceNow.getTime();
  return tickets.filter((ticket) => {
    if (!isTicketActive(ticket) || !ticket.dueAt) return false;
    const dueMs = Date.parse(ticket.dueAt);
    return !Number.isNaN(dueMs) && dueMs < nowMs;
  });
};

export const getSlaRiskTickets = (tickets: Ticket[], now = Date.now()): Ticket[] =>
  tickets.filter((ticket) => isTicketSlaAtRisk(ticket, now));

export const computeExecutiveMetrics = (
  tickets: Ticket[],
  referenceNow: Date = new Date(),
): ExecutiveMetrics => {
  const totalActive = tickets.filter(isTicketActive).length;
  const overdueCount = getOverdueTickets(tickets, referenceNow).length;
  const slaAtRiskOrBreachedCount = getSlaRiskTickets(tickets, referenceNow.getTime()).length;

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
  const now = Date.now();
  return tickets
    .filter((ticket) => {
      const active = isTicketActive(ticket);
      const isCritical =
        ticket.priority === "P1 Urgent" ||
        ticket.priority.toLowerCase().includes("urgent") ||
        ticket.priority.toLowerCase().includes("high");
      const isSlaRisk = isTicketSlaAtRisk(ticket, now);

      return active && (isCritical || isSlaRisk);
    })
    .sort((a, b) => {
      const riskRank = (ticket: Ticket) => {
        const risk = ticketSlaRisk(ticket, now);
        if (risk === "Breached") return 0;
        if (risk === "At Risk") return 1;
        return 2;
      };
      const priorityRank = (ticket: Ticket) => {
        if (ticket.priority.includes("P1") || ticket.priority.toLowerCase().includes("urgent")) return 0;
        if (ticket.priority.includes("P2") || ticket.priority.toLowerCase().includes("high")) return 1;
        return 2;
      };

      return riskRank(a) - riskRank(b) || priorityRank(a) - priorityRank(b);
    });
};
