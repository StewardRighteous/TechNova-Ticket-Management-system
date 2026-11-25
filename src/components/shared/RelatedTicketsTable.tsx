import type { Ticket } from "../../types/barrel";
import { TicketSummaryTable } from "../../ui/barrel";
import { ticketSlaRemainingMinutes, ticketSlaRisk } from "../../utils/supportPolicy";

export function RelatedTicketsTable({ tickets, emptyMessage }: {
  tickets: readonly Ticket[];
  emptyMessage: string;
}) {
  const rows = tickets.map((ticket) => {
    const updatedTimestamp = Date.parse(ticket.updatedAt);
    return {
      ...ticket,
      href: `/tickets/${encodeURIComponent(ticket.id)}`,
      updatedTimestamp: Number.isFinite(updatedTimestamp) ? updatedTimestamp : undefined,
      slaRisk: ticketSlaRisk(ticket),
      slaRemainingMinutes: ticketSlaRemainingMinutes(ticket),
    };
  });

  return <TicketSummaryTable rows={rows} emptyMessage={emptyMessage} />;
}
