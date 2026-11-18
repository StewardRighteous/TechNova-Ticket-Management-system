import type {
  Company,
  ServiceLine,
  Ticket,
  TicketDiagnosticData,
} from "../../../types/barrel";
export interface TicketDetailsPanelProps {
  ticket: Ticket;
  companies: Company[];
  services: ServiceLine[];
  onSave: (updates: Partial<Ticket>) => void;
}
export type TicketDetailsTab =
  "overview" | "context" | "client" | "diagnostics" | "reproduction";
export type Draft = Pick<
  Ticket,
  | "title"
  | "description"
  | "companyId"
  | "contactId"
  | "serviceId"
  | "priority"
  | "channel"
  | "clientContact"
  | "slaDeadline"
  | "environment"
  | "systemRevision"
  | "resolutionDetails"
> & {
  categoryId: string;
  dueAt: string;
  tagsText: string;
  diagnosticData: TicketDiagnosticData;
};
