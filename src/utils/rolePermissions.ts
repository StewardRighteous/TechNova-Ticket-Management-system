import type { RoleId, Ticket, Company, Employee, ServiceLine } from '../types/barrel';

export interface RolePermissions {
  allowedTabs: string[];
  canManageTeam: boolean;
  canConfigureSettings: boolean;
  canCreateTicket: boolean;
}

export function canAccessTicket(ticket: Ticket, role: RoleId, employeeId?: string, companyIds?: string[]): boolean {
  return filterTicketsByRole([ticket], role, employeeId, companyIds).length > 0;
}

export function canChangeTicketStatus(role: RoleId, status: Ticket["status"]): boolean {
  if (role === "operations_manager" || role === "management") return true;
  const transitions: Partial<Record<RoleId, Ticket["status"][]>> = {
    support_agent: ["Open", "In Progress", "Escalated"],
    senior_support: ["In Progress", "Escalated", "Under Review", "Pending QA", "Resolved"],
    development_team: ["In Progress", "Under Review", "Resolved"],
    qa: ["Pending QA", "Resolved"],
  };
  return transitions[role]?.includes(status) ?? false;
}

export function canAccessCompany(company: Company, role: RoleId, employeeName?: string): boolean {
  return filterCompaniesByRole([company], role, employeeName).length > 0;
}

export function canAccessEmployee(employee: Employee, role: RoleId): boolean {
  return filterEmployeesByRole([employee], role).length > 0;
}

export function canAccessService(service: ServiceLine, role: RoleId): boolean {
  return filterServicesByRole([service], role).length > 0;
}

export const ROLE_PERMISSIONS: Record<RoleId, RolePermissions> = {
  operations_manager: {
    allowedTabs: ['dashboard', 'tickets', 'companies', 'employees', 'services', 'settings', 'notifications'],
    canManageTeam: true,
    canConfigureSettings: true,
    canCreateTicket: true
  },
  support_agent: {
    allowedTabs: ['dashboard', 'tickets', 'notifications'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  },
  senior_support: {
    allowedTabs: ['dashboard', 'tickets', 'services', 'notifications'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  },
  development_team: {
    allowedTabs: ['dashboard', 'tickets', 'services', 'notifications'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: false
  },
  qa: {
    allowedTabs: ['dashboard', 'tickets', 'services', 'notifications'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: false
  },
  account_manager: {
    allowedTabs: ['dashboard', 'tickets', 'companies', 'notifications'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  },
  management: {
    allowedTabs: ['dashboard', 'tickets', 'companies', 'employees', 'services', 'settings', 'notifications'],
    canManageTeam: true,
    canConfigureSettings: true,
    canCreateTicket: true
  }
};

export function filterTicketsByRole(tickets: Ticket[], role: RoleId, employeeId?: string, companyIds: string[] = []): Ticket[] {
  switch (role) {
    case 'operations_manager':
      return tickets;
    case 'support_agent':
      return tickets.filter((t) =>
        t.currentStageRole === 'support_agent' ||
        t.priority.includes('P2') ||
        t.priority.includes('P3') ||
        t.assignedToId === employeeId
      );
    case 'senior_support':
      return tickets.filter((t) =>
        t.currentStageRole === 'senior_support' ||
        t.priority.includes('P1') ||
        t.status === 'Escalated' ||
        t.assignedToId === employeeId
      );
    case 'development_team':
      return tickets.filter((t) =>
        t.currentStageRole === 'development_team' ||
        t.assignedToId === employeeId ||
        t.tags.some(tag => ['React', 'SSO', 'OAuth2', 'Redis', 'Bug'].includes(tag))
      );
    case 'qa':
      return tickets.filter((t) =>
        t.currentStageRole === 'qa' ||
        t.status === 'Pending QA' ||
        t.assignedToId === employeeId ||
        t.tags.includes('Compliance') ||
        t.tags.includes('Security')
      );
    case 'account_manager':
      return tickets.filter((t) =>
        t.currentStageRole === 'account_manager' ||
        t.assignedToId === employeeId ||
        companyIds.includes(t.companyId)
      );
    default:
      return tickets;
  }
}

export function filterCompaniesByRole(companies: Company[], role: RoleId, employeeName?: string): Company[] {
  if (role === 'operations_manager' || role === 'management') return companies;
  if (role !== 'account_manager') return [];
  if (!employeeName) return [];
  return companies.filter((c) => c.accountManager === employeeName);
}

export function filterEmployeesByRole(employees: Employee[], role: RoleId): Employee[] {
  if (role === 'operations_manager' || role === 'management') return employees;
  return [];
}

export function filterServicesByRole(services: ServiceLine[], role: RoleId): ServiceLine[] {
  return ROLE_PERMISSIONS[role].allowedTabs.includes('services') ? services : [];
}
