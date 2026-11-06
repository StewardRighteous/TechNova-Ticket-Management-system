import type { Ticket } from "../../../types";
import type { Draft } from "./types";
export const createDraft = (ticket: Ticket): Draft => ({
  title: ticket.title,
  description: ticket.description,
  companyId: ticket.companyId,
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
