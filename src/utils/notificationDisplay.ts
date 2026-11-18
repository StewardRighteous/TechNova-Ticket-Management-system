import type { MockupDatabase, Notification, Employee } from "../types/barrel";

export function notificationForViewer(notification: Notification, data: MockupDatabase, viewer: Employee | null): Notification {
  const ticket = notification.ticketId ? data.tickets.find((item) => item.id === notification.ticketId) : undefined;
  if (/assigned to you/i.test(notification.title) && ticket && ticket.assignedToId !== viewer?.id) {
    return { ...notification, title: "Ticket assignment update", message: `${ticket.code} is currently assigned to ${ticket.assignedToName}.` };
  }
  if (/sla/i.test(notification.title) && Date.now() - Date.parse(notification.createdAt) > 60 * 60 * 1000) {
    return { ...notification, title: "Historical SLA event", message: `Recorded ${new Date(notification.createdAt).toLocaleString()}: ${notification.message}` };
  }
  return notification;
}
