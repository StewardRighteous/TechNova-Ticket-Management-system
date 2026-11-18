import type { MockupDatabase, Ticket, RoleId, TicketStatus, Employee } from '../types/barrel';

function activityId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createNewTicket(
  ticketInput: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'timeAgo' | 'timeline'> & { initialNote?: string },
  activeRole: RoleId,
  data: MockupDatabase,
  creator?: Employee | null,
): { newTicket: Ticket; updatedData: MockupDatabase } {
  const newId = createUniqueTicketId(data.tickets);
  const currentEmp = (creator && data.employees.find((employee) => employee.id === creator.id)) || data.employees.find((e) => e.role === activeRole) || data.employees[0];
  
  const newTicket: Ticket = {
    ...ticketInput,
    id: newId,
    code: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: 'Just now',
    timeline: [
      {
        id: activityId(),
        performedById: currentEmp.id,
        author: currentEmp.name,
        role: currentEmp.roleTitle,
        action: `Ticket Logged via ${ticketInput.channel.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        kind: "customer",
        note: ticketInput.initialNote || 'Ticket registered in system.'
      },
      {
        id: activityId(),
        performedById: currentEmp.id,
        author: currentEmp.name,
        role: currentEmp.roleTitle,
        action: `Assigned to ${ticketInput.assignedToName}`,
        timestamp: new Date().toISOString(),
        kind: "workflow",
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

export function createUniqueTicketId(tickets: Ticket[]): string {
  let newId: string;
  do {
    newId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (tickets.some((ticket) => ticket.id === newId || ticket.code === newId));
  return newId;
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
      const timestamp = new Date().toISOString();
      return {
        ...t,
        status,
        updatedAt: new Date().toISOString(),
        timeAgo: 'Just now',
        timeline: [
          ...t.timeline,
          {
            id: activityId(),
            performedById: currentEmp.id,
            author: currentEmp.name,
            role: currentEmp.roleTitle,
            action: `Status Changed to ${status}`,
            timestamp,
            kind: "workflow",
            note: note || `Ticket transitioned to ${status}.`
          }
        ]
      };
    }
    return t;
  });
}

export function updateTicketWorkflowInList(
  tickets: Ticket[],
  ticketId: string,
  updates: Partial<Pick<Ticket, "status" | "assignedToId" | "assignedToName" | "assignedToRole" | "currentStageRole" | "closedAt">>,
  currentEmp: Employee,
  action: string,
  note: string,
  fromAssigneeId?: string,
): Ticket[] {
  return tickets.map((ticket) => {
    if (ticket.id !== ticketId) return ticket;
    const changedAssignee = updates.assignedToId && updates.assignedToId !== ticket.assignedToId;
    const timestamp = new Date().toISOString();
    return {
      ...ticket,
      ...updates,
      updatedAt: timestamp,
      timeAgo: "Just now",
      timeline: [...ticket.timeline, {
        id: activityId(),
        performedById: currentEmp.id,
        author: currentEmp.name,
        role: currentEmp.roleTitle,
        action,
        timestamp,
        kind: "workflow",
        note,
        ...(changedAssignee ? { fromAssigneeId: fromAssigneeId ?? ticket.assignedToId, toAssigneeId: updates.assignedToId } : {}),
      }],
    };
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
          timestamp,
          kind: 'workflow',
          note: 'Ticket details were updated.'
        }
      ]
    };
  });
}
