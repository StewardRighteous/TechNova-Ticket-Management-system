import { create } from 'zustand';
import type {
  MockupDatabase,
  Ticket,
  Company,
  Employee,
  ServiceLine,
  RoleId,
  TicketStatus
} from '../types';
import { loadInitialState, persistState } from './storage';
import { createNewTicket, updateTicketStatusInList } from './ticketMutations';

interface TicketStore {
  data: MockupDatabase;
  activeTab: string;
  selectedTicketId: string | null;
  activeRole: RoleId;
  searchQuery: string;
  isCreateModalOpen: boolean;
  isSidebarCollapsed: boolean;

  setActiveTab: (tab: string) => void;
  setSelectedTicketId: (id: string | null) => void;
  setActiveRole: (role: RoleId) => void;
  setSearchQuery: (query: string) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  
  addTicket: (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'timeAgo' | 'timeline'> & { initialNote?: string }) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;
  assignTicket: (ticketId: string, employeeId: string, note?: string) => void;
  addTicketTimelineNote: (ticketId: string, note: string) => void;
  addCompany: (company: Company) => void;
  addService: (service: ServiceLine) => void;
  addEmployee: (employee: Employee) => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  data: loadInitialState(),
  activeTab: 'dashboard',
  selectedTicketId: 'TCK-1084',
  activeRole: 'operations_manager',
  searchQuery: '',
  isCreateModalOpen: false,
  isSidebarCollapsed: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  setActiveRole: (role) => set({ activeRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  addTicket: (ticketInput) => {
    const state = get();
    const { newTicket, updatedData } = createNewTicket(ticketInput, state.activeRole, state.data);
    persistState(updatedData);
    set({ data: updatedData, selectedTicketId: newTicket.id });
  },

  updateTicketStatus: (ticketId, status, note) => {
    const state = get();
    const currentEmp = state.data.employees.find((e) => e.role === state.activeRole) || state.data.employees[0];
    const updatedTickets = updateTicketStatusInList(state.data.tickets, ticketId, status, currentEmp, note);
    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  assignTicket: (ticketId, employeeId, note) => {
    const state = get();
    const currentEmp = state.data.employees.find((e) => e.role === state.activeRole) || state.data.employees[0];
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
          timeAgo: 'Just now',
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              author: currentEmp.name,
              role: currentEmp.roleTitle,
              action: `Reassigned to ${targetEmp.name}`,
              timestamp: 'Just now',
              note: note || `Transferred responsibility to ${targetEmp.name} (${targetEmp.roleTitle}).`
            }
          ]
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
    const currentEmp = state.data.employees.find((e) => e.role === state.activeRole) || state.data.employees[0];

    const updatedTickets = state.data.tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              author: currentEmp.name,
              role: currentEmp.roleTitle,
              action: 'Note Added',
              timestamp: 'Just now',
              note
            }
          ]
        };
      }
      return t;
    });

    const updatedData = { ...state.data, tickets: updatedTickets };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addCompany: (company) => {
    const state = get();
    const updatedData = { ...state.data, companies: [...state.data.companies, company] };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addService: (service) => {
    const state = get();
    const updatedData = { ...state.data, services: [...state.data.services, service] };
    persistState(updatedData);
    set({ data: updatedData });
  },

  addEmployee: (employee) => {
    const state = get();
    const updatedData = { ...state.data, employees: [...state.data.employees, employee] };
    persistState(updatedData);
    set({ data: updatedData });
  }
}));
