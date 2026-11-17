import type { MockupDatabase, Ticket, RoleId, TicketStatus, Employee } from '../types/barrel';

export function createNewTicket(
  ticketInput: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'timeAgo' | 'timeline'> & { initialNote?: string },
  activeRole: RoleId,
  data: MockupDatabase
): { newTicket: Ticket; updatedData: MockupDatabase } {
  const newId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentEmp = data.employees.find((e) => e.role === activeRole) || data.employees[0];
  
  const newTicket: Ticket = {
    ...ticketInput,
    id: newId,
    code: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: 'Just now',
    timeline: [
      {
        id: `tl-${Date.now()}`,
        performedById: currentEmp.id,
        author: currentEmp.name,
        role: currentEmp.roleTitle,
        action: `Ticket Logged via ${ticketInput.channel.toUpperCase()}`,
        timestamp: 'Just now',
        note: ticketInput.initialNote || 'Ticket registered in system.'
      },
      {
        id: `tl-${Date.now()}-assignment`,
        performedById: currentEmp.id,
        author: currentEmp.name,
        role: currentEmp.roleTitle,
        action: `Assigned to ${ticketInput.assignedToName}`,
        timestamp: 'Just now',
        note: 'Initial ticket assignment.',
        toAssigneeId: ticketInput.assignedToId
      }
    ]
  };

  const updatedData: MockupDatabase = {
    ...data,
    tickets: [newTicket, ...data.tickets],
    companyInfo: {
      ...data.companyInfo,
      activeBacklog: data.companyInfo.activeBacklog + 1
    }
  };

  return { newTicket, updatedData };
}

export function updateTicketStatusInList(
  tickets: Ticket[],
  ticketId: string,
  status: TicketStatus,
  currentEmp: Employee,
  note?: string
): Ticket[] {
  return tickets.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        status,
        updatedAt: new Date().toISOString(),
        timeAgo: 'Just now',
        timeline: [
          ...t.timeline,
          {
            id: `tl-${Date.now()}`,
            performedById: currentEmp.id,
            author: currentEmp.name,
            role: currentEmp.roleTitle,
            action: `Status Changed to ${status}`,
            timestamp: 'Just now',
            note: note || `Ticket transitioned to ${status}.`
          }
        ]
      };
    }
    return t;
  });
}

export function updateTicketFieldsInList(
  tickets: Ticket[],
  ticketId: string,
  updates: Partial<Ticket>,
  currentEmp: Employee
): Ticket[] {
  return tickets.map((ticket) => {
    if (ticket.id !== ticketId) return ticket;
    const timestamp = new Date().toISOString();
    return {
      ...ticket,
      ...updates,
      updatedAt: timestamp,
      timeAgo: 'Just now',
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          performedById: currentEmp.id,
          author: currentEmp.name,
          role: currentEmp.roleTitle,
          action: 'Ticket details updated',
          timestamp: 'Just now',
          note: 'Ticket details were updated.'
        }
      ]
    };
  });
}
