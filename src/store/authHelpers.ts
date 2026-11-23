import type { Employee, MockupDatabase } from '../types/barrel';

export function authenticateByEmail(
  email: string,
  employees: Employee[]
): Employee | null {
  return employees.find(
    (e) => e.accountStatus !== "Disabled" && e.email.toLowerCase() === email.trim().toLowerCase()
  ) || null;
}

export function addTimelineNoteToTicket(
  db: MockupDatabase,
  ticketId: string,
  currentEmp: Employee,
  note: string
): MockupDatabase {
  if (!note.trim()) return db;
  const updatedTickets = db.tickets.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        internalNotes: [
          ...(t.internalNotes ?? []),
          {
            id: `note-${Date.now()}`,
            authorId: currentEmp.id,
            body: note,
            createdAt: new Date().toISOString()
          }
        ],
      };
    }
    return t;
  });

  return { ...db, tickets: updatedTickets };
}
