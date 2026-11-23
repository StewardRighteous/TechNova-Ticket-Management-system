import type { RoleId, Ticket, Employee, ServiceLine } from "../types/barrel";

export interface RolePermissions {
  allowedTabs: string[];
  canManageTeam: boolean;
  canConfigureSettings: boolean;
  canCreateTicket: boolean;
}

export function canAccessTicket(ticket: Ticket, role: RoleId, employeeId?: string): boolean {
  return role === "operations_manager" || Boolean(employeeId && ticket.assignedToId === employeeId);
}

const allowedTransitions: Record<Ticket["status"], Ticket["status"][]> = {
  Open: ["In Progress"],
  "In Progress": ["Open", "Escalated"],
  Escalated: ["In Progress", "Under Review"],
  "Under Review": ["Escalated", "Pending QA"],
  "Pending QA": ["Under Review", "Resolved"],
  Resolved: ["Pending QA", "Closed"],
  Closed: [],
};

const roleTransitions: Record<RoleId, Ticket["status"][]> = {
  operations_manager: ["Open", "In Progress", "Escalated", "Under Review", "Pending QA", "Resolved", "Closed"],
  management: ["Open", "In Progress", "Escalated", "Under Review", "Pending QA", "Resolved", "Closed"],
  support_agent: ["In Progress", "Escalated"],
  senior_support: ["In Progress", "Escalated", "Under Review", "Pending QA", "Resolved"],
  development_team: ["In Progress", "Under Review", "Resolved"],
  qa: ["Pending QA", "Resolved"],
  account_manager: ["Open"],
};

export function canChangeTicketStatus(role: RoleId, status: Ticket["status"]): boolean {
  return roleTransitions[role].includes(status);
}

export function canTransitionTicket(
  role: RoleId,
  from: Ticket["status"],
  to: Ticket["status"],
): boolean {
  return from !== to && allowedTransitions[from].includes(to) && canChangeTicketStatus(role, to);
}

export function getAllowedTicketTransitions(role: RoleId, from: Ticket["status"]): Ticket["status"][] {
  return allowedTransitions[from].filter((to) => canChangeTicketStatus(role, to));
}

export function canAccessService(service: ServiceLine, employee: Employee): boolean {
  return employee.role === "operations_manager" ||
    Boolean(employee.eligibleServiceIds?.includes(service.id)) ||
    service.leadEmployeeId === employee.id ||
    service.onCallContactId === employee.id ||
    Boolean(employee.teamId && [service.defaultTeamId, service.escalationTeamId].includes(employee.teamId));
}

const employeePermissions: RolePermissions = {
  allowedTabs: ["tickets", "companies", "services", "profile"],
  canManageTeam: false,
  canConfigureSettings: false,
  canCreateTicket: false,
};

export const ROLE_PERMISSIONS: Record<RoleId, RolePermissions> = {
  operations_manager: {
    allowedTabs: ['dashboard', 'tickets', 'companies', 'employees', 'services', 'settings', 'notifications'],
    canManageTeam: true,
    canConfigureSettings: true,
    canCreateTicket: true
  },
  support_agent: { ...employeePermissions, canCreateTicket: true },
  senior_support: { ...employeePermissions, canCreateTicket: true },
  development_team: employeePermissions,
  qa: employeePermissions,
  account_manager: { ...employeePermissions, canCreateTicket: true },
  management: { ...employeePermissions, canCreateTicket: true },
};

export function filterTicketsByRole(tickets: Ticket[], role: RoleId, employeeId?: string): Ticket[] {
  if (role === "operations_manager") return tickets;
  return tickets.filter((ticket) => canAccessTicket(ticket, role, employeeId));
}
