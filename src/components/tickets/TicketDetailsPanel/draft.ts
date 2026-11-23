import type { Company, Ticket } from "../../../types/barrel";
import type { Draft } from "./types";
export function localDueAt(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, -1);
}

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
  supportSite: ticket.supportSite,
  systemRevision: ticket.systemRevision,
  resolutionDetails: ticket.resolutionDetails ?? "",
  categoryId: ticket.categoryId ?? "",
  dueAt: localDueAt(ticket.dueAt),
  tagsText: ticket.tags.join(", "),
  diagnosticData: ticket.diagnosticData ?? {},
});
