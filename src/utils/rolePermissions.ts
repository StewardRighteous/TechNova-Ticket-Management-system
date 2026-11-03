import type { RoleId, Ticket, Company, Employee, ServiceLine } from '../types';

export interface RolePermissions {
  allowedTabs: string[];
  canManageTeam: boolean;
  canConfigureSettings: boolean;
  canCreateTicket: boolean;
}

export const ROLE_PERMISSIONS: Record<RoleId, RolePermissions> = {
  operations_manager: {
    allowedTabs: ['dashboard', 'tickets', 'companies', 'employees', 'services', 'settings'],
    canManageTeam: true,
    canConfigureSettings: true,
    canCreateTicket: true
  },
  support_agent: {
    allowedTabs: ['dashboard', 'tickets'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  },
  senior_support: {
    allowedTabs: ['dashboard', 'tickets', 'services'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  },
  development_team: {
    allowedTabs: ['dashboard', 'tickets', 'services'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: false
  },
  qa: {
    allowedTabs: ['dashboard', 'tickets', 'services'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: false
  },
  account_manager: {
    allowedTabs: ['dashboard', 'tickets', 'companies'],
    canManageTeam: false,
    canConfigureSettings: false,
    canCreateTicket: true
  }
};

export function filterTicketsByRole(tickets: Ticket[], role: RoleId, employeeId?: string): Ticket[] {
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
        ['comp-1', 'comp-2', 'comp-3', 'comp-4', 'comp-5', 'comp-6'].includes(t.companyId)
      );
    default:
      return tickets;
  }
}

export function filterCompaniesByRole(companies: Company[], role: RoleId, employeeName?: string): Company[] {
  if (role === 'operations_manager') return companies;
  if (role === 'account_manager' && employeeName) {
    return companies.filter((c) => c.accountManager === employeeName);
  }
  return companies;
}

export function filterEmployeesByRole(employees: Employee[], role: RoleId): Employee[] {
  if (role === 'operations_manager') return employees;
  return employees.filter(e => e.role === role);
}

export function filterServicesByRole(services: ServiceLine[], _role: RoleId): ServiceLine[] {
  return services;
}
