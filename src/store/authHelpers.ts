import type { Employee, MockupDatabase } from '../types';

export function authenticateByEmail(
  email: string,
  employees: Employee[]
): Employee | null {
  return employees.find(
    (e) => e.email.toLowerCase() === email.trim().toLowerCase()
  ) || null;
}

export function authenticateById(
  employeeId: string,
  employees: Employee[]
): Employee | null {
  return employees.find((e) => e.id === employeeId) || null;
}

export function addTimelineNoteToTicket(
  db: MockupDatabase,
  ticketId: string,
  currentEmp: Employee,
  note: string
): MockupDatabase {
  const updatedTickets = db.tickets.map((t) => {
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

  return { ...db, tickets: updatedTickets };
}
