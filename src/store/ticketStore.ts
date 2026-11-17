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
import { loadInitialState, persistState, resetStoredState } from "./storage";
import {
  createNewTicket,
  updateTicketFieldsInList,
  updateTicketStatusInList,
} from "./ticketMutations";
import {
  authenticateByEmail,
  authenticateById,
  addTimelineNoteToTicket,
} from "./authHelpers";

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
  ) => void;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    note?: string,
  ) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  assignTicket: (ticketId: string, employeeId: string, note?: string) => void;
  addTicketTimelineNote: (ticketId: string, note: string) => void;
  addCompany: (company: Company) => void;
  addService: (service: ServiceLine) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  updateService: (id: string, updates: Partial<ServiceLine>) => void;
}

const initialDb = loadInitialState();

export const useTicketStore = create<TicketStore>((set, get) => ({
  data: initialDb,
  activeTab: "dashboard",
  selectedTicketId: null,
  ticketTableFocus: null,
  activeRole: "operations_manager",
  currentUser: initialDb.employees[0],
  isAuthenticated: true,
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
    }
  },

  logout: () =>
    set({ currentUser: null, isAuthenticated: false, activeTab: "dashboard" }),
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
  },
  resetDemoData: () => {
    const pristine = resetStoredState();
    const defaultEmployee = pristine.employees[0];
    set({
      data: pristine,
      currentUser: defaultEmployee,
      activeRole: defaultEmployee?.role || "operations_manager",
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
    const { newTicket, updatedData } = createNewTicket(
      ticketInput,
      state.activeRole,
      state.data,
    );
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: newTicket.id });
  },

  updateTicketStatus: (ticketId, status, note) => {
    const state = get();
    const currentEmp = state.currentUser || state.data.employees[0];
    const updatedTickets = updateTicketStatusInList(
      state.data.tickets,
      ticketId,
      status,
      currentEmp,
      note,
    );
    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  updateTicket: (ticketId, updates) => {
    const state = get();
    const currentEmp = state.currentUser || state.data.employees[0];
    const tickets = updateTicketFieldsInList(
      state.data.tickets,
      ticketId,
      updates,
      currentEmp,
    );
    const updatedData = { ...state.data, tickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  assignTicket: (ticketId, employeeId, note) => {
    const state = get();
    const currentEmp = state.currentUser || state.data.employees[0];
    const targetEmp = state.data.employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    const updatedTickets = state.data.tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedToId: targetEmp.id,
          assignedToName: targetEmp.name,
          assignedToRole: targetEmp.roleTitle,
          currentStageRole: targetEmp.role,
          updatedAt: new Date().toISOString(),
          timeAgo: "Just now",
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              performedById: currentEmp.id,
              author: currentEmp.name,
              role: currentEmp.roleTitle,
              action: `Reassigned to ${targetEmp.name}`,
              timestamp: "Just now",
              note:
                note ||
                `Transferred responsibility to ${targetEmp.name} (${targetEmp.roleTitle}).`,
              fromAssigneeId: t.assignedToId,
              toAssigneeId: targetEmp.id,
            },
          ],
        };
      }
      return t;
    });

    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addTicketTimelineNote: (ticketId, note) => {
    const state = get();
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

  addCompany: (company) => {
    const state = get();
    const updatedData = {
      ...state.data,
      companies: [...state.data.companies, company],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addService: (service) => {
    const state = get();
    const updatedData = {
      ...state.data,
      services: [...state.data.services, service],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addEmployee: (employee) => {
    const state = get();
    const updatedData = {
      ...state.data,
      employees: [...state.data.employees, employee],
    };
    persistState(updatedData);
    set({ data: updatedData });
  },
  updateEmployee: (id, updates) => {
    const state = get();
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
