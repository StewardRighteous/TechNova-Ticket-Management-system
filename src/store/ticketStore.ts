import { create } from "zustand";
import type {
  MockupDatabase,
  Ticket,
  Company,
  Employee,
  ServiceLine,
  RoleId,
  TicketStatus,
  ClientNotificationChannel,
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
  addTimelineNoteToTicket,
} from "./authHelpers";
import { ROLE_PERMISSIONS, canAccessTicket, canTransitionTicket } from "../utils/rolePermissions";
import { calculateTicketSla, isEligibleAssignee } from "../utils/supportPolicy";
import { matchesService } from "../utils/matchesService";

const configuredLoginPassword = import.meta.env.VITE_DEMO_PASSWORD;

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

  login: (email: string, password: string) => boolean;
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
      "id" | "createdAt" | "updatedAt" | "timeAgo" | "timeline" | "slaDeadline" | "slaRisk" | "firstResponseDueAt" | "dueAt"
    > & { initialNote?: string },
  ) => Ticket | null;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    note?: string,
  ) => void;
  notifyTicketClient: (ticketId: string, channel: ClientNotificationChannel, notes?: string) => void;
  recordFirstResponse: (ticketId: string) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  removeTicket: (ticketId: string) => void;
  assignTicket: (ticketId: string, employeeId: string, note?: string) => void;
  addTicketTimelineNote: (ticketId: string, note: string) => void;
  markNotificationRead: (notificationId: string) => void;
  addCompany: (company: Company) => void;
  addService: (service: ServiceLine) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  updateService: (id: string, updates: Partial<ServiceLine>) => void;
  deleteService: (id: string) => void;
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
  ? initialDb.employees.find((employee) => employee.id === savedPersonaId && employee.accountStatus !== "Disabled")
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

  login: (email: string, password: string) => {
    if (configuredLoginPassword && password !== configuredLoginPassword) return false;
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

  logout: () => {
    clearSessionPersona();
    set({ currentUser: null, isAuthenticated: false, activeTab: "dashboard" });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  setTicketTableFocus: (focus) => set({ ticketTableFocus: focus }),
  setActiveRole: (role) => {
    const matchedEmployee =
      get().data.employees.find((e) => e.role === role && e.accountStatus !== "Disabled");
    if (matchedEmployee) set({ activeRole: role, currentUser: matchedEmployee });
  },
  setActivePersona: (role) => {
    const matchedEmployee =
      get().data.employees.find((e) => e.role === role && e.accountStatus !== "Disabled");
    if (!matchedEmployee) return;
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
    if (!company || !service || (!validContact && !legacyContact) || !employee || !ticketInput.priority
      || !isEligibleAssignee(employee, service.id) || (ticketInput.supportSite && !company.supportSites?.includes(ticketInput.supportSite))) return null;
    const canonicalContactName = validContact?.name ?? company.contactName;
    const createdAt = new Date();
    const sla = calculateTicketSla(company, service, ticketInput.priority, createdAt);
    const { newTicket, updatedData } = createNewTicket(
      { ...ticketInput, ...sla, slaRisk: "On Target", clientContact: canonicalContactName, companyName: company.name, companyCode: company.code,
        serviceName: service.name, assignedToName: employee.name, assignedToRole: employee.roleTitle, currentStageRole: employee.role, teamId: employee.teamId },
      state.activeRole,
      state.data,
      state.currentUser,
      createdAt.toISOString(),
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
    const service = status === "Escalated" ? state.data.services.find((item) => item.id === ticket.serviceId) : undefined;
    const eligible = state.data.employees.filter((employee) => isEligibleAssignee(employee, ticket.serviceId));
    const targetEmp = eligible.find((employee) => employee.id === service?.onCallContactId)
      ?? (service?.escalationTeamId ? eligible.find((employee) => employee.teamId === service.escalationTeamId) : undefined)
      ?? (routingRole ? eligible.find((employee) => employee.role === routingRole) : undefined);
    if (routingRole && !targetEmp) return;
    const workflowUpdates: Partial<Ticket> = {
      status,
      ...(status === "Resolved" ? { resolutionDetails: note!.trim(), resolvedAt: ticket.resolvedAt ?? new Date().toISOString() } : {}),
      ...(status === "Closed" ? { closedAt: new Date().toISOString() } : {}),
      ...(targetEmp ? {
        assignedToId: targetEmp.id,
        assignedToName: targetEmp.name,
        assignedToRole: targetEmp.roleTitle,
        currentStageRole: targetEmp.role,
        teamId: targetEmp.teamId,
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

  recordFirstResponse: (ticketId) => {
    const state = get();
    const ticket = state.data.tickets.find((item) => item.id === ticketId);
    if (!ticket?.firstResponseDueAt || ticket.firstRespondedAt || ticket.status === "Closed" || !canAccessTicketByState(state, ticketId)) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const tickets = updateTicketWorkflowInList(state.data.tickets, ticketId, {
      firstRespondedAt: new Date().toISOString(),
    }, currentEmp, "First response recorded", "The agent recorded that a first response was sent to the client.");
    const updatedData = { ...state.data, tickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  notifyTicketClient: (ticketId, channel, notes) => {
    const state = get();
    const ticket = state.data.tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.status !== "Resolved" || !canAccessTicketByState(state, ticketId)) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "email" : "phone";
    const updatedTickets = updateTicketWorkflowInList(
      state.data.tickets,
      ticketId,
      { clientNotifiedAt: new Date().toISOString(), firstRespondedAt: ticket.firstRespondedAt ?? new Date().toISOString(), clientNotifiedVia: channel, clientNotificationNotes: notes?.trim() || undefined },
      currentEmp,
      `Client notified via ${channelLabel}`,
      `${ticket.clientContact} was notified about the resolution via ${channelLabel}.`,
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
    if (Object.hasOwn(safeUpdates, "supportSite") && safeUpdates.supportSite && safeUpdates.supportSite !== existingTicket.supportSite) {
      const company = state.data.companies.find((item) => item.id === (safeUpdates.companyId ?? existingTicket.companyId));
      if (!company?.supportSites?.includes(safeUpdates.supportSite)) return;
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

  removeTicket: (ticketId) => {
    const state = get();
    if (!canAccessTicketByState(state, ticketId) || !ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const ticket = state.data.tickets.find((item) => item.id === ticketId);
    if (!ticket) return;
    const updatedData = { ...state.data, tickets: state.data.tickets.filter((item) => item.id !== ticketId) };
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: state.selectedTicketId === ticketId ? null : state.selectedTicketId });
  },

  assignTicket: (ticketId, employeeId, note) => {
    const state = get();
    if (!canAccessTicketByState(state, ticketId) || !ROLE_PERMISSIONS[state.activeRole].canManageTeam) return;
    const existingTicket = state.data.tickets.find((item) => item.id === ticketId);
    if (!existingTicket || existingTicket.assignedToId === employeeId) return;
    const currentEmp = state.currentUser || state.data.employees[0];
    const targetEmp = state.data.employees.find((e) => e.id === employeeId);
    if (!targetEmp || !isEligibleAssignee(targetEmp, existingTicket.serviceId)) return;

    const updatedTickets = updateTicketWorkflowInList(state.data.tickets, ticketId, {
      assignedToId: targetEmp.id,
      assignedToName: targetEmp.name,
      assignedToRole: targetEmp.roleTitle,
      currentStageRole: targetEmp.role,
      teamId: targetEmp.teamId,
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
    const employee = state.data.employees.find((item) => item.id === id);
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !employee) return;
    const editingCurrentUser = state.currentUser?.id === id;
    if (editingCurrentUser && updates.accountStatus === "Disabled") return;
    const revised = { ...employee, ...updates, id };
    const renamed = revised.name !== employee.name;
    const updatedData = {
      ...state.data,
      employees: state.data.employees.map((item) => item.id === id ? revised : item),
      companies: renamed ? state.data.companies.map((item) =>
        item.accountManager === employee.name ? { ...item, accountManager: revised.name } : item) : state.data.companies,
      services: renamed ? state.data.services.map((item) =>
        item.lead === employee.name ? { ...item, lead: revised.name } : item) : state.data.services,
      tickets: state.data.tickets.map((item) => item.assignedToId === id ? {
        ...item, assignedToName: revised.name, assignedToRole: revised.roleTitle,
      } : item),
    };
    persistState(updatedData);
    set({ data: updatedData, ...(editingCurrentUser ? { currentUser: revised, activeRole: revised.role } : {}) });
  },
  deleteEmployee: (id) => {
    const state = get();
    const employee = state.data.employees.find((item) => item.id === id);
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !employee || state.currentUser?.id === id) return;
    const updatedData = {
      ...state.data,
      employees: state.data.employees.filter((item) => item.id !== id),
      companies: state.data.companies.map((company) => company.accountManager === employee.name ? { ...company, accountManager: "Unassigned" } : company),
      services: state.data.services.map((service) => service.lead === employee.name ? { ...service, lead: "Unassigned" } : service),
      tickets: state.data.tickets.map((ticket) => ticket.assignedToId === id ? { ...ticket, assignedToId: "", assignedToName: "Unassigned", assignedToRole: "Unassigned" } : ticket),
    };
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: state.data.tickets.some((ticket) => ticket.id === state.selectedTicketId && ticket.assignedToId === id) ? null : state.selectedTicketId });
  },
  updateCompany: (id, updates) => {
    const state = get();
    const company = state.data.companies.find((item) => item.id === id);
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !company) return;
    const revised = { ...company, ...updates, id };
    const updatedData = {
      ...state.data,
      companies: state.data.companies.map((item) => item.id === id ? revised : item),
      tickets: state.data.tickets.map((item) => item.companyId === id ? { ...item, companyName: revised.name, companyCode: revised.code } : item),
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  deleteCompany: (id) => {
    const state = get();
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !state.data.companies.some((item) => item.id === id)) return;
    const updatedData = {
      ...state.data,
      companies: state.data.companies.filter((item) => item.id !== id),
      tickets: state.data.tickets.filter((item) => item.companyId !== id),
    };
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: state.data.tickets.some((item) => item.companyId === id && item.id === state.selectedTicketId) ? null : state.selectedTicketId });
  },
  updateService: (id, updates) => {
    const state = get();
    const service = state.data.services.find((item) => item.id === id);
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !service) return;
    const revised = { ...service, ...updates, id };
    const changedReference = revised.name !== service.name || revised.code !== service.code;
    const updatedData = {
      ...state.data,
      services: state.data.services.map((item) => item.id === id ? revised : item),
      companies: changedReference ? state.data.companies.map((item) => ({
        ...item, subscribedServices: [...new Set(item.subscribedServices.map((reference) => matchesService(service, reference) ? id : reference))],
      })) : state.data.companies,
      tickets: revised.name !== service.name ? state.data.tickets.map((item) =>
        item.serviceId === id ? { ...item, serviceName: revised.name } : item) : state.data.tickets,
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  deleteService: (id) => {
    const state = get();
    const service = state.data.services.find((item) => item.id === id);
    if (!ROLE_PERMISSIONS[state.activeRole].canManageTeam || !service) return;
    const removedTicketIds = new Set(state.data.tickets.filter((ticket) => ticket.serviceId === id).map((ticket) => ticket.id));
    const updatedData = {
      ...state.data,
      services: state.data.services.filter((item) => item.id !== id),
      tickets: state.data.tickets.filter((ticket) => ticket.serviceId !== id),
      companies: state.data.companies.map((company) => ({
        ...company,
        subscribedServices: company.subscribedServices.filter((reference) => !matchesService(service, reference)),
        contracts: company.contracts?.map((contract) => ({
          ...contract,
          serviceIds: contract.serviceIds.filter((serviceId) => serviceId !== id),
        })),
      })),
      employees: state.data.employees.map((employee) => ({
        ...employee,
        eligibleServiceIds: employee.eligibleServiceIds?.filter((serviceId) => serviceId !== id),
      })),
    };
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: state.selectedTicketId && removedTicketIds.has(state.selectedTicketId) ? null : state.selectedTicketId });
  },
}));
