import { PriorityBadge, StatusBadge, TableValue, SelectDropdown, Button, PaginatedDataTable, Heading, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/barrel";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { filterTicketsByRole } from "../../utils/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const LatestUpdatesView: React.FC = () => {
  const navigate = useNavigate();
  const { data, activeRole, currentUser, setSelectedTicketId } = useTicketStore();
  const scopedTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );
  const [range, setRange] = useState<"7" | "28">("7");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState("all");
  const latestActivity = scopedTickets.reduce(
    (latest, ticket) => Math.max(latest, Date.parse(ticket.updatedAt)),
    0,
  );
  const rangeStart = latestActivity - Number(range) * 24 * 60 * 60 * 1000;
  const tickets = scopedTickets
    .filter((ticket) => Date.parse(ticket.updatedAt) >= rangeStart)
    .filter((ticket) => companyId === "all" || ticket.companyId === companyId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const companies = [...new Map(scopedTickets.map((ticket) => [ticket.companyId, ticket.companyName])).entries()]
    .sort(([, a], [, b]) => a.localeCompare(b));
  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="mt-1 text-sm text-slate-500">
          Tickets ordered by their most recent activity.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
          <div className="flex items-center gap-2">
            <Icon className="rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
              update
            </Icon>
            <Heading>Recent tickets</Heading>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectDropdown label="Date range" value={range} onChange={(value) => setRange(value === "28" ? "28" : "7")} options={[
              { value: "7", label: "Last 7 days" }, { value: "28", label: "Last 28 days" },
            ]} />
            <SelectDropdown label="Companies" value={companyId} onChange={setCompanyId} options={[
              { value: "all", label: "All companies" }, ...companies.map(([value, label]) => ({ value, label })),
            ]} />
          </div>
        </div>
        <PaginatedDataTable rows={tickets} scroll className="min-w-[900px] border-collapse">
          {(pageRows) => <>
            <TableHead tone="compact">
              <TableRow>
                <TableHeader>Last activity</TableHeader>
                <TableHeader>Ticket</TableHeader>
                <TableHeader>Company / service</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Priority</TableHeader>
                <TableHeader>Assignee</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  tabIndex={0}
                  selected={selectedRowId === ticket.id}
                  onSelect={() => setSelectedRowId(ticket.id)}
                  onOpen={() => openTicket(ticket.id)}
                >
                  <TableCell density="plain" className="whitespace-nowrap px-4 py-3 text-xs text-slate-600"><TableValue icon="schedule">{displayDate(ticket.updatedAt)}</TableValue></TableCell>
                  <TableCell density="plain" className="px-4 py-3">
                    <span className="block w-fit cursor-text font-mono text-xs font-bold text-slate-500">{ticket.code}</span>
                    <span className="mt-1 block w-fit max-w-[360px] cursor-text truncate text-xs font-semibold text-slate-900">{ticket.title}</span>
                  </TableCell>
                  <TableCell density="plain" className="px-4 py-3">
                    <Button tone="plain"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/companies/${encodeURIComponent(ticket.companyId)}`);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="block max-w-[200px] truncate text-left text-xs font-medium text-slate-800 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                      title={`View ${ticket.companyName}`}
                    >
                      {ticket.companyName}
                    </Button>
                    <span className="mt-1 block w-fit max-w-[200px] cursor-text truncate text-[11px] text-slate-500">{ticket.serviceName}</span>
                  </TableCell>
                  <TableCell density="plain" className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell density="plain" className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} showCode />
                  </TableCell>
                  <TableCell density="plain" className="px-4 py-3">
                    <Button tone="plain"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/employees/${encodeURIComponent(ticket.assignedToId)}`);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="max-w-[180px] truncate text-left text-xs text-slate-600 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                      title={`View ${ticket.assignedToName}`}
                    >
                      {ticket.assignedToName}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!tickets.length && (
                <TableRow>
                  <TableCell density="plain" colSpan={6} className="p-8 text-center text-xs text-slate-500">No tickets available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </>}
        </PaginatedDataTable>
      </section>
    </div>
  );
};
