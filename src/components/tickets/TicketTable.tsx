import React, { useState } from "react";
import type {
  Ticket,
  InboundChannel,
  TicketPriority,
  TicketStatus,
} from "../../types";
import {
  PriorityBadge,
  StatusBadge,
  TablePagination,
  TableHeaderSection,
} from "../common";
import { TicketTableFilters } from "./TicketTableFilters";

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
  onCreateNew: () => void;
}

type SortField = "code" | "title" | "company" | "priority" | "status" | "time";
type PriorityFilter =
  "all" | Extract<TicketPriority, "P1 Urgent" | "P2 Normal" | "P3 Low">;

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onViewTicket,
  onCreateNew,
}) => {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | InboundChannel>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = tickets.filter((t) => {
    if (channelFilter !== "all" && t.channel !== channelFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "code") cmp = a.code.localeCompare(b.code);
    else if (sortField === "title") cmp = a.title.localeCompare(b.title);
    else if (sortField === "company")
      cmp = a.companyName.localeCompare(b.companyName);
    else if (sortField === "priority")
      cmp = a.priority.localeCompare(b.priority);
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    else if (sortField === "time")
      cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableHeaderSection
        title="All Tickets"
        searchQuery={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Filter by ID, issue, client..."
      >
        <TicketTableFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => {
            setChannelFilter(c);
            setPage(1);
          }}
          priorityFilter={priorityFilter}
          setPriorityFilter={(p) => {
            setPriorityFilter(p);
            setPage(1);
          }}
          statusFilter={statusFilter}
          setStatusFilter={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onCreateNew={onCreateNew}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th
                className="cursor-pointer px-6 py-3"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center gap-1">
                  <span> ID</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "code"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span>Ticket Details</span>
                </div>
              </th>

              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => handleSort("company")}
              >
                <div className="flex items-center gap-1">
                  <span>Company</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "company"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
              </th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                </div>
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70"></span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => (
              <tr
                key={t.id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-6 py-3.5 font-mono font-bold whitespace-nowrap text-slate-500">
                  {t.code}
                </td>
                <td className="max-w-sm px-5 py-3.5">
                  <div className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {t.title}
                  </div>
                  <div className="line-clamp-1 text-[11px] text-slate-500">
                    {t.description}
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-break-spaces">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      domain
                    </span>
                    <div>
                      <span className="block font-semibold text-slate-800">
                        {t.companyName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {t.clientContact}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-break-spaces">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      badge
                    </span>
                    <div>
                      <span className="block leading-tight font-semibold text-slate-800">
                        {t.assignedToName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {t.assignedToRole}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-6 py-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onViewTicket(t.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      visibility
                    </span>
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
};
