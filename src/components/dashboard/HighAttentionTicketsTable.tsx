import React, { useState } from "react";
import type { Employee, Ticket } from "../../types/barrel";
import { Button, DataTable, Heading, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow, NumericPagination } from "../../ui/barrel";
import { StaffAvatar } from "../../ui/atoms/StaffAvatar";
import { getHighAttentionTickets } from "./dashboardMetrics";
import { ticketSlaRisk } from "../../utils/supportPolicy";

export interface HighAttentionTicketsTableProps {
  tickets: Ticket[];
  employees?: Employee[];
  onSelectTicket: (ticketId: string) => void;
  onSelectCompany?: (companyId: string) => void;
  onSelectAssignee?: (employeeId: string) => void;
  onExploreAll?: () => void;
}

const renderSlaBadge = (risk: Ticket["slaRisk"], deadline?: string) => {
  if (risk === "Breached") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 shadow-xs">
        <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
        Breached
      </span>
    );
  }

  if (risk === "At Risk") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-xs">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        At Risk {deadline ? `(${deadline})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      On Target
    </span>
  );
};

export const HighAttentionTicketsTable: React.FC<HighAttentionTicketsTableProps> = ({
  tickets,
  employees = [],
  onSelectTicket,
  onSelectCompany,
  onSelectAssignee,
  onExploreAll,
}) => {
  const highAttentionTickets = getHighAttentionTickets(tickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const paginatedTickets = highAttentionTickets.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section
      id="high-attention-incidents"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="rounded-lg bg-rose-50 p-2 text-[20px] text-rose-600">
            crisis_alert
          </Icon>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Heading>
                Attention Needed
              </Heading>
            </div>
          </div>
        </div>

        {onExploreAll && (
          <Button tone="plain"
            type="button"
            onClick={onExploreAll}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span>Open ticket registry</span>
            <Icon className="text-[16px]">
              arrow_forward
            </Icon>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <DataTable className="table-fixed border-collapse" columnWidths={["36%", "28%", "20%", "16%"]}>
          <TableHead tone="inverse">
            <TableRow>
              <TableHeader density="narrow">Ticket</TableHeader>
              <TableHeader density="narrow">Company</TableHeader>
              <TableHeader density="narrow">Due status</TableHeader>
              <TableHeader density="narrow">Assignee</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white">
            {paginatedTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                selected={selectedTicketId === ticket.id}
                onSelect={() => setSelectedTicketId(ticket.id)}
                onOpen={() => onSelectTicket(ticket.id)}
                tabIndex={0}
              >
                <TableCell density="narrow" className="max-w-0">
                  <div className="w-fit cursor-text font-mono text-[10px] font-bold text-slate-500">{ticket.code}</div>
                  <span className="mt-0.5 block w-fit max-w-full cursor-text truncate font-semibold text-slate-900 group-hover:text-rose-700 transition-colors" title={ticket.title}>{ticket.title}</span>
                </TableCell>
                <TableCell density="narrow" className="max-w-0">
                  {onSelectCompany ? (
                    <Button tone="plain"
                      type="button"
                      onClick={(event) => { event.stopPropagation(); onSelectCompany(ticket.companyId); }}
                      className="block max-w-full truncate text-left font-semibold text-slate-800 transition-colors hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                      title={`View ${ticket.companyName}`}
                    >
                      {ticket.companyName}
                    </Button>
                  ) : (
                    <div className="w-fit max-w-full cursor-text truncate font-semibold text-slate-800" title={ticket.companyName}>{ticket.companyName}</div>
                  )}
                </TableCell>
                <TableCell density="narrow">
                  <div className="w-fit cursor-text whitespace-nowrap">{renderSlaBadge(ticketSlaRisk(ticket))}</div>
                </TableCell>
                <TableCell density="narrow">
                  <div className="flex min-w-0 items-center gap-1 text-[10px] text-slate-600">
                    <StaffAvatar
                      src={employees.find((employee) => employee.id === ticket.assignedToId)?.avatar || ""}
                      alt={`${ticket.assignedToName} profile`}
                      sizeClassName="h-5 w-5 shrink-0"
                      fallbackClassName="text-[15px] text-slate-400"
                    />
                    {onSelectAssignee ? (
                      <Button tone="plain"
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onSelectAssignee(ticket.assignedToId); }}
                        className="min-w-0 truncate text-left transition-colors hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                        title={`View ${ticket.assignedToName}`}
                      >
                        {ticket.assignedToName}
                      </Button>
                    ) : (
                      <span className="cursor-text">{ticket.assignedToName}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {highAttentionTickets.length === 0 && (
              <TableRow>
                <TableCell density="plain" colSpan={4} className="p-8 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Icon className="text-[32px] text-emerald-500">
                      check_circle
                    </Icon>
                    <p className="font-semibold text-slate-700">
                      No tickets need attention
                    </p>
                    <p className="text-slate-400">
                      All tickets are within SLA boundaries and no critical incidents are pending.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTable>
      </div>
      <NumericPagination
        totalItems={highAttentionTickets.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
      />
    </section>
  );
};

