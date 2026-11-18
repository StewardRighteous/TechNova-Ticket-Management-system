import { create } from "zustand";
import type {
  MockupDatabase,
  Ticket,
  Company,
  Employee,
  ServiceLine,
  RoleId,
  TicketStatus,
  ToastMessage,
  ToastType,
} from "../types/barrel";
import { clearSessionPersona, getSessionPersonaId, loadInitialState, persistState, resetStoredState, setSessionPersonaId } from "./storage";
import {
  createNewTicket,
  updateTicketFieldsInList,
  updateTicketWorkflowInList,
} from "./ticketMutations";
import {
  authenticateByEmail,
  authenticateById,
  addTimelineNoteToTicket,
} from "./authHelpers";
import { ROLE_PERMISSIONS, canAccessTicket, canTransitionTicket } from "../utils/rolePermissions";

export type TicketTableFocus = "active" | "overdue" | "sla-risk" | "resolved";

interface TicketStore {
  data: MockupDatabase;
  activeTab: string;
  selectedTicketId: string | null;
  ticketTableFocus: TicketTableFocus | null;
  activeRole: RoleId;
  currentUser: Employee | null;
  isAuthenticated: boolean;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  toasts: ToastMessage[];

  login: (email: string) => boolean;
  loginAsEmployee: (employeeId: string) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedTicketId: (id: string | null) => void;
  setTicketTableFocus: (focus: TicketTableFocus | null) => void;
  setActiveRole: (role: RoleId) => void;
  setActivePersona: (role: RoleId) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebarCollapse: () => void;
  resetDemoData: () => void;

  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;

  addTicket: (
    newTicket: Omit<
      Ticket,
      "id" | "createdAt" | "updatedAt" | "timeAgo" | "timeline"
    > & { initialNote?: string },
  ) => Ticket | null;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    note?: string,
  ) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  assignTicket: (ticketId: string, employeeId: string, note?: string) => void;
  addTicketTimelineNote: (ticketId: string, note: string) => void;
  markNotificationRead: (notificationId: string) => void;
  addCompany: (company: Company) => void;
  addService: (service: ServiceLine) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  updateService: (id: string, updates: Partial<ServiceLine>) => void;
}

function canAccessTicketByState(
  state: Pick<TicketStore, "data" | "activeRole" | "currentUser">,
  ticketId: string,
): boolean {
  const ticket = state.data.tickets.find((item) => item.id === ticketId);
  const companyIds = state.data.companies
    .filter((company) => company.accountManager === state.currentUser?.name)
    .map((company) => company.id);
  return Boolean(ticket && canAccessTicket(ticket, state.activeRole, state.currentUser?.id, companyIds));
}

const initialDb = loadInitialState();
const savedPersonaId = getSessionPersonaId();
const savedPersona = savedPersonaId
  ? initialDb.employees.find((employee) => employee.id === savedPersonaId)
  : undefined;

export const useTicketStore = create<TicketStore>((set, get) => ({
  data: initialDb,
  activeTab: "dashboard",
  selectedTicketId: null,
  ticketTableFocus: null,
  activeRole: savedPersona?.role ?? "operations_manager",
  currentUser: savedPersona || null,
  isAuthenticated: Boolean(savedPersona),
  searchQuery: "",
  isSidebarCollapsed: false,
  toasts: [],

  login: (email: string) => {
    const matched = authenticateByEmail(email, get().data.employees);
    if (matched) {
      set({
        currentUser: matched,
        activeRole: matched.role,
        isAuthenticated: true,
        activeTab: "dashboard",
      });
      setSessionPersonaId(matched.id);
      return true;
    }
    return false;
  },

  loginAsEmployee: (employeeId: string) => {
    const matched = authenticateById(employeeId, get().data.employees);
    if (matched) {
      set({
        currentUser: matched,
        activeRole: matched.role,
        isAuthenticated: true,
        activeTab: "dashboard",
      });
      setSessionPersonaId(matched.id);
    }
  },

  logout: () => {
    clearSessionPersona();
    set({ currentUser: null, isAuthenticated: false, activeTab: "dashboard" });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  setTicketTableFocus: (focus) => set({ ticketTableFocus: focus }),
  setActiveRole: (role) => {
    const matchedEmployee =
      get().data.employees.find((e) => e.role === role) ||
      get().data.employees[0];
    set({ activeRole: role, currentUser: matchedEmployee });
  },
  setActivePersona: (role) => {
    const matchedEmployee =
      get().data.employees.find((e) => e.role === role) ||
      get().data.employees[0];
    set({
      activeRole: role,
      currentUser: matchedEmployee,
      isAuthenticated: true,
    });
    setSessionPersonaId(matchedEmployee.id);
  },
  resetDemoData: () => {
    const state = get();
    const pristine = resetStoredState();
    const activeEmployee = state.currentUser
      ? pristine.employees.find((employee) => employee.id === state.currentUser?.id)
      : undefined;
    const defaultEmployee = activeEmployee || pristine.employees[0];
    setSessionPersonaId(defaultEmployee.id);
    set({
      data: pristine,
      currentUser: defaultEmployee,
      activeRole: defaultEmployee?.role || "operations_manager",
      isAuthenticated: Boolean(defaultEmployee),
      selectedTicketId: pristine.tickets[0]?.id || null,
      searchQuery: "",
    });
  },
  addToast: (message, type = "info", duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebarCollapse: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  addTicket: (ticketInput) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canCreateTicket) return null;
    const company = state.data.companies.find((item) => item.id === ticketInput.companyId);
    const service = state.data.services.find((item) => item.id === ticketInput.serviceId);
    const validContact = company?.contacts?.find((contact) => contact.id === ticketInput.contactId);
    const legacyContact = !company?.contacts?.length && ticketInput.contactId === `legacy-${company?.id}`;
    const employee = state.data.employees.find((item) => item.id === ticketInput.assignedToId);
    if (!company || !service || (!validContact && !legacyContact) || !employee || !ticketInput.priority) return null;
    const canonicalContactName = validContact?.name ?? company.contactName;
    const { newTicket, updatedData } = createNewTicket(
      { ...ticketInput, clientContact: canonicalContactName, companyName: company.name, companyCode: company.code, serviceName: service.name, assignedToName: employee.name, assignedToRole: employee.roleTitle, currentStageRole: employee.role },
      state.activeRole,
      state.data,
      state.currentUser,
    );
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: newTicket.id });
    return newTicket;
  },

  updateTicketStatus: (ticketId, status, note) => {
    const state = get();
    const ticket = state.data.tickets.find((item) => item.id === ticketId);
    if (!ticket || !canAccessTicketByState(state, ticketId) || !canTransitionTicket(state.activeRole, ticket.status, status)) return;
    if (status === "Resolved" && !note?.trim()) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const routingRole = status === "Escalated" ? "senior_support" : status === "Pending QA" ? "qa" : undefined;
    const targetEmp = routingRole ? state.data.employees.find((employee) => employee.role === routingRole) : undefined;
    if (routingRole && !targetEmp) return;
    const workflowUpdates: Partial<Ticket> = {
      status,
      ...(status === "Resolved" ? { resolutionDetails: note!.trim() } : {}),
      ...(status === "Closed" ? { closedAt: new Date().toISOString() } : {}),
      ...(targetEmp ? {
        assignedToId: targetEmp.id,
        assignedToName: targetEmp.name,
        assignedToRole: targetEmp.roleTitle,
        currentStageRole: targetEmp.role,
      } : {}),
    };
    const updatedTickets = updateTicketWorkflowInList(
      state.data.tickets,
      ticketId,
      workflowUpdates,
      currentEmp,
      targetEmp ? `Routed to ${targetEmp.roleTitle} · ${status}` : `Status changed to ${status}`,
      note || (targetEmp ? `Ticket routed to ${targetEmp.name} (${targetEmp.roleTitle}) and moved to ${status}.` : `Ticket transitioned to ${status}.`),
    );
    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  updateTicket: (ticketId, updates) => {
    const state = get();
    if (!canAccessTicketByState(state, ticketId)) return;
    if (updates.status) return;
    const existingTicket = state.data.tickets.find((item) => item.id === ticketId);
    if (!existingTicket) return;
    if (updates.assignedToId || updates.assignedToName || updates.assignedToRole || updates.currentStageRole) return;
    const safeUpdates = { ...updates };
    if (!safeUpdates.companyId) {
      delete safeUpdates.companyName;
      delete safeUpdates.companyCode;
    }
    if (!safeUpdates.serviceId) delete safeUpdates.serviceName;
    if (safeUpdates.companyId || safeUpdates.contactId || safeUpdates.clientContact) {
      const companyId = safeUpdates.companyId ?? existingTicket.companyId;
      const company = state.data.companies.find((item) => item.id === companyId);
      if (!company) return;
      const contactId = safeUpdates.contactId ?? existingTicket.contactId;
      const contact = company.contacts?.find((item) => item.id === contactId);
      if (company.contacts?.length && (!contact || (safeUpdates.clientContact && safeUpdates.clientContact !== contact.name))) return;
      if (!company.contacts?.length && safeUpdates.clientContact && safeUpdates.clientContact !== company.contactName) return;
      safeUpdates.companyId = company.id;
      safeUpdates.companyName = company.name;
      safeUpdates.companyCode = company.code;
      safeUpdates.contactId = contactId ?? `legacy-${company.id}`;
      safeUpdates.clientContact = contact?.name ?? company.contactName;
    }
    if (safeUpdates.serviceId) {
      const service = state.data.services.find((item) => item.id === safeUpdates.serviceId);
      if (!service) return;
      safeUpdates.serviceName = service.name;
    }
    if (safeUpdates.assignedToId) {
      const employee = state.data.employees.find((item) => item.id === safeUpdates.assignedToId);
      if (!employee) return;
      safeUpdates.assignedToName = employee.name;
      safeUpdates.assignedToRole = employee.roleTitle;
      safeUpdates.currentStageRole = employee.role;
    }
    const currentEmp = state.currentUser || state.data.employees[0];
    const tickets = updateTicketFieldsInList(
      state.data.tickets,
      ticketId,
      safeUpdates,
      currentEmp,
    );
    const updatedData = { ...state.data, tickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  assignTicket: (ticketId, employeeId, note) => {
    const state = get();
    if (!canAccessTicketByState(state, ticketId) || !ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const existingTicket = state.data.tickets.find((item) => item.id === ticketId);
    if (!existingTicket || existingTicket.assignedToId === employeeId) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const targetEmp = state.data.employees.find((e) => e.id === employeeId);
    if (!targetEmp || !existingTicket || existingTicket.assignedToId === targetEmp.id) return;

    const updatedTickets = updateTicketWorkflowInList(state.data.tickets, ticketId, {
      assignedToId: targetEmp.id,
      assignedToName: targetEmp.name,
      assignedToRole: targetEmp.roleTitle,
      currentStageRole: targetEmp.role,
    }, currentEmp, `Reassigned to ${targetEmp.name}`, note || `Transferred responsibility to ${targetEmp.name} (${targetEmp.roleTitle}).`);

    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addTicketTimelineNote: (ticketId, note) => {
    if (!note.trim()) return;
    const state = get();
    if (!canAccessTicketByState(state, ticketId)) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const updatedData = addTimelineNoteToTicket(
      state.data,
      ticketId,
      currentEmp,
      note,
    );
    persistState(updatedData);
    set({ data: updatedData });
  },

  markNotificationRead: (notificationId) => {
    const state = get();
    const personaId = state.currentUser?.id ?? state.activeRole;
    const updatedData = { ...state.data, notifications: state.data.notifications.map((item) => item.id === notificationId ? { ...item, read: false, readBy: [...new Set([...(item.readBy ?? []), personaId])] } : item) };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addCompany: (company) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const updatedData = {
      ...state.data,
      companies: [...state.data.companies, company],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addService: (service) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const updatedData = {
      ...state.data,
      services: [...state.data.services, service],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addEmployee: (employee) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const updatedData = {
      ...state.data,
      employees: [...state.data.employees, employee],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  updateEmployee: (id, updates) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !state.data.employees.some((item) => item.id === id)) return;
    const updatedData = {
      ...state.data,
      employees: state.data.employees.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  updateCompany: (id, updates) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !state.data.companies.some((item) => item.id === id)) return;
    const updatedData = {
      ...state.data,
      companies: state.data.companies.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  updateService: (id, updates) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !state.data.services.some((item) => item.id === id)) return;
    const updatedData = {
      ...state.data,
      services: state.data.services.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
}));
