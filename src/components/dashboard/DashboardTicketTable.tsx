import React, { useState } from "react";
import type { Ticket, InboundChannel } from "../../types/barrel";
import {
  ChannelBadge,
  PriorityBadge,
  StatusBadge,
  TablePagination,
  TableHeaderSection,
} from "../common/barrel";
import { DashboardChannelFilters } from "./DashboardChannelFilters";

interface DashboardTicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onExploreAll: () => void;
}

type SortField = "code" | "company" | "title" | "priority" | "status";

export const DashboardTicketTable: React.FC<DashboardTicketTableProps> = ({
  tickets,
  onSelectTicket,
  onExploreAll,
}) => {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | InboundChannel>(
    "all",
  );
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
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
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "code") cmp = a.code.localeCompare(b.code);
    else if (sortField === "company")
      cmp = a.companyName.localeCompare(b.companyName);
    else if (sortField === "title") cmp = a.title.localeCompare(b.title);
    else if (sortField === "priority")
      cmp = a.priority.localeCompare(b.priority);
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg">
      <TableHeaderSection
        title="Active Tickets"
        searchQuery={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Quick filter tickets..."
      >
        <DashboardChannelFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => {
            setChannelFilter(c);
            setPage(1);
          }}
          onExploreAll={onExploreAll}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase">
            <tr>
              <th
                className="cursor-pointer select-none px-5 py-2.5"
                onClick={() => handleSort("code")}
              >
                <span>Ticket</span>
              </th>
              <th className="px-3 py-2.5">Channel</th>
              <th
                className="cursor-pointer select-none px-3 py-2.5"
                onClick={() => handleSort("company")}
              >
                <span>Client</span>
              </th>
              <th
                className="cursor-pointer select-none px-3 py-2.5"
                onClick={() => handleSort("title")}
              >
                <span>Incident</span>
              </th>
              <th
                className="cursor-pointer select-none px-3 py-2.5"
                onClick={() => handleSort("priority")}
              >
                <span>Priority</span>
              </th>
              <th className="px-3 py-2.5">Assignee</th>
              <th
                className="cursor-pointer select-none px-3 py-2.5"
                onClick={() => handleSort("status")}
              >
                <span>Status</span>
              </th>
              <th className="px-5 py-2.5 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => (
              <tr
                key={t.id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-5 py-2.5 font-mono font-bold whitespace-nowrap text-indigo-700">
                  {t.code}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <ChannelBadge channel={t.channel} showText={false} />
                </td>
                <td className="px-3 py-2.5 font-semibold whitespace-nowrap text-slate-800">
                  {t.companyName}
                </td>
                <td className="max-w-xs px-3 py-2.5">
                  <span className="block truncate font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {t.title}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      person
                    </span>
                    <span className="font-medium">{t.assignedToName}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-2.5 whitespace-nowrap">
                  <button
                    onClick={() => onSelectTicket(t.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[14px]">
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
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};
