import initialData from '../../mockup.json';
import type { MockupDatabase } from '../types/barrel';

export const STORAGE_KEY = 'technova_tickets_state_v1';
export const PERSONA_SESSION_KEY = 'technova_demo_persona';

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
    tickets: state.tickets.map((ticket) => {
      const company = state.companies.find((item) => item.id === ticket.companyId);
      const service = state.services.find((item) => item.id === ticket.serviceId);
      return {
        ...ticket,
        ...(company ? { companyName: company.name, companyCode: company.code } : {}),
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
