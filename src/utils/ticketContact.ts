import type { Company, Ticket } from "../types/barrel";

export function getTicketContactDetails(ticket?: Ticket, company?: Company) {
  const contact = company?.contacts?.find((item) => item.id === ticket?.contactId);
  return {
    clientEmail: ticket?.clientEmailOverride ?? (contact?.email || (ticket?.channel === "email" ? ticket.channelIdentifier : company?.contactEmail) || ""),
    clientPhone: ticket?.clientPhoneOverride ?? (contact?.phone || (ticket?.channel === "phone" || ticket?.channel === "whatsapp" ? ticket.channelIdentifier : company?.contactPhone) || ""),
  };
}
