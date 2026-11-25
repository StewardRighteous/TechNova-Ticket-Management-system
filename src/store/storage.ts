import initialData from '../../mockup.json';
import type { MockupDatabase } from '../types/barrel';

export const STORAGE_KEY = 'technova_tickets_state_v1';
export const PERSONA_SESSION_KEY = 'technova_demo_persona';

const previousEmployeeEmails: Readonly<Record<string, string>> = {
  "emp-1": "a.pendelton@technova.com",
  "emp-2": "s.noor@technova.com",
  "emp-3": "a.mercer@technova.com",
  "emp-4": "e.shaw@technova.com",
  "emp-5": "p.sharma@technova.com",
  "emp-6": "k.patel@technova.com",
  "emp-7": "m.vance@technova.com",
  "emp-8": "d.vance@technova.com",
  "emp-9": "v.malhotra@technova.com",
};

export function getSessionPersonaId(): string | null {
  try {
    return sessionStorage.getItem(PERSONA_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionPersonaId(employeeId: string): void {
  try {
    sessionStorage.setItem(PERSONA_SESSION_KEY, employeeId);
  } catch {
    // Session persistence is a convenience; authentication still works if storage is unavailable.
  }
}

export function clearSessionPersona(): void {
  try {
    sessionStorage.removeItem(PERSONA_SESSION_KEY);
  } catch {
    // Ignore unavailable session storage.
  }
}

function reconcileTicketReferences(state: MockupDatabase): MockupDatabase {
  return {
    ...state,
    companies: state.companies.map((company) => {
      const seedCompany = (initialData as MockupDatabase).companies.find((item) => item.id === company.id);
      return company.logo || !seedCompany?.logo ? company : { ...company, logo: seedCompany.logo };
    }),
    employees: state.employees.map((employee) => {
      const seedEmployee = (initialData as MockupDatabase).employees.find((item) => item.id === employee.id);
      const isLegacyAvatar = employee.avatar === "person" || employee.avatar.includes("randomuser.me") || employee.avatar.includes("images.unsplash.com");
      return {
        ...employee,
        ...(seedEmployee ? {
          email: employee.email === previousEmployeeEmails[employee.id] ? seedEmployee.email : employee.email,
          eligibleServiceIds: employee.eligibleServiceIds ?? seedEmployee.eligibleServiceIds,
          dateOfBirth: employee.dateOfBirth ?? seedEmployee.dateOfBirth,
          gender: employee.gender ?? seedEmployee.gender,
          personalAddress: employee.personalAddress ?? seedEmployee.personalAddress,
          employmentType: employee.employmentType ?? seedEmployee.employmentType,
          hireDate: employee.hireDate ?? seedEmployee.hireDate,
          managerName: employee.managerName ?? seedEmployee.managerName,
          timeZone: employee.timeZone ?? seedEmployee.timeZone,
          supportSchedule: employee.supportSchedule ?? seedEmployee.supportSchedule,
          emergencyContactName: employee.emergencyContactName ?? seedEmployee.emergencyContactName,
          emergencyContactPhone: employee.emergencyContactPhone ?? seedEmployee.emergencyContactPhone,
          emergencyContactEmail: employee.emergencyContactEmail ?? seedEmployee.emergencyContactEmail,
          bankName: employee.bankName ?? seedEmployee.bankName,
          accountHolderName: employee.accountHolderName ?? seedEmployee.accountHolderName,
          accountNumber: employee.accountNumber ?? seedEmployee.accountNumber,
          routingNumber: employee.routingNumber ?? seedEmployee.routingNumber,
          taxId: employee.taxId ?? seedEmployee.taxId,
        } : {}),
        ...(isLegacyAvatar && seedEmployee && employee.avatar !== seedEmployee.avatar ? { avatar: seedEmployee.avatar } : {}),
      };
    }),
    services: state.services.map((service) => {
      const seedService = (initialData as MockupDatabase).services.find((item) => item.id === service.id);
      const matchingLeads = state.employees.filter((employee) => employee.name === service.lead);
      const leadEmployeeId = service.leadEmployeeId === undefined
        ? matchingLeads.length === 1 ? matchingLeads[0].id : null
        : service.leadEmployeeId;
      const previousDescriptions: Record<string, string> = {
        "srv-1": "Full-stack web application development, microservices, multi-tenant architectures, and scalable API platforms.",
        "srv-2": "Container orchestration, Kubernetes cluster governance, AWS/GCP architecture, CI/CD pipelines, and high availability systems.",
        "srv-3": "Enterprise resource planning, CRM integrations, billing engines, automated workflow dispatch, and inventory matrix control.",
        "srv-4": "Round-the-clock incident response, triage routing, patch releases, security monitoring, and proactive maintenance.",
        "srv-5": "SOC-2 Type II audit readiness, PCI-DSS ledger verification, security vulnerability scans, and IT architecture advisory.",
      };
      return {
        ...service,
        leadEmployeeId,
        ...(seedService && service.description === previousDescriptions[service.id]
          ? { description: seedService.description } : {}),
      };
    }),
    tickets: state.tickets.map((ticket) => {
      const seedTicket = (initialData as MockupDatabase).tickets.find((item) => item.id === ticket.id);
      const company = state.companies.find((item) => item.id === ticket.companyId);
      const service = state.services.find((item) => item.id === ticket.serviceId);
      const reconciledTicket: typeof ticket & { companyCode?: string } = { ...ticket };
      delete reconciledTicket.companyCode;
      return {
        ...reconciledTicket,
        attachments: ticket.attachments?.map((file) => {
          const seedFile = seedTicket?.attachments?.find((item) => item.id === file.id && item.name === file.name);
          return file.uploadedAt || !seedFile?.uploadedAt ? file : { ...file, uploadedAt: seedFile.uploadedAt };
        }),
        ...(company ? { companyName: company.name } : {}),
        ...(service ? { serviceName: service.name } : {}),
      };
    }),
  };
}

export function loadInitialState(): MockupDatabase {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const reconciled = reconcileTicketReferences(JSON.parse(saved) as MockupDatabase);
      if (JSON.stringify(reconciled) !== JSON.stringify(JSON.parse(saved))) {
        persistState(reconciled);
      }
      return reconciled;
    }
  } catch {
    // ignore local storage error and fall back
  }
  const reconciled = reconcileTicketReferences(initialData as MockupDatabase);
  persistState(reconciled);
  return reconciled;
}

export function persistState(state: MockupDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function resetStoredState(): MockupDatabase {
  const pristine = JSON.parse(JSON.stringify(initialData)) as MockupDatabase;
  persistState(pristine);
  return pristine;
}

