import type { Company, Ticket } from "../../../types/barrel";
import type { Draft } from "./types";
export const createDraft = (ticket: Ticket, companies: Company[] = []): Draft => ({
  title: ticket.title,
  description: ticket.description,
  companyId: ticket.companyId,
  contactId: ticket.contactId ?? companies.find((company) => company.id === ticket.companyId)?.contacts?.find((contact) => contact.name === ticket.clientContact)?.id ?? (companies.find((company) => company.id === ticket.companyId)?.contacts?.length ? "" : `legacy-${ticket.companyId}`),
  serviceId: ticket.serviceId,
  priority: ticket.priority,
  channel: ticket.channel,
  clientContact: ticket.clientContact,
  slaDeadline: ticket.slaDeadline,
  environment: ticket.environment,
  systemRevision: ticket.systemRevision,
  resolutionDetails: ticket.resolutionDetails ?? "",
  categoryId: ticket.categoryId ?? "",
  dueAt: ticket.dueAt ?? "",
  tagsText: ticket.tags.join(", "),
  diagnosticData: ticket.diagnosticData ?? {},
});
