import React, { useState, useEffect } from "react";
import type {
  Ticket,
  Team,
  Department,
  Employee,
} from "../../../types/barrel";
import { PriorityBadge, StatusBadge, NumericPagination, StaffAvatar } from "../../common/barrel";
import { TicketTableFilters } from "../TicketTableFilters";
import { TableSearch } from "../../common/barrel";
import type { TicketTableFocus } from "../../../store/ticketStore";
import { getOverdueTickets, isTicketSlaAtRisk } from "../../dashboard/dashboardMetrics";

interface TicketTableProps {
  tickets: Ticket[];
  teams?: Team[];
  departments?: Department[];
  employees?: Employee[];
  onViewTicket: (ticketId: string) => void;
  onCreateNew: () => void;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialChannelFilter?: string[];
  initialStatusFilter?: string[];
  initialPriorityFilter?: string[];
  initialDepartmentFilter?: string[];
  initialSortField?: string;
  initialSortAsc?: boolean;
  initialFocus?: TicketTableFocus;
  activeScope?: TicketTableFocus | null;
  viewTitle?: string;
  onClearScope?: () => void;
  onReturnToAllTickets?: () => void;
  onTableStateChange?: (state: {
    page: number;
    pageSize: number;
    search: string;
    channelFilter: string[];
    statusFilter: string[];
    priorityFilter: string[];
    departmentFilter: string[];
    sortField?: string;
    sortAsc?: boolean;
  }) => void;
}

type SortField = "code" | "title" | "company" | "priority" | "status" | "time";

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  teams = [],
  departments = [],
  employees = [],
  onViewTicket,
  onCreateNew,
  initialPage,
  initialPageSize,
  initialSearch,
  initialChannelFilter,
  initialStatusFilter,
  initialPriorityFilter,
  initialDepartmentFilter,
  initialSortField,
  initialSortAsc,
  initialFocus,
  activeScope = null,
  viewTitle,
  onClearScope,
  onReturnToAllTickets,
  onTableStateChange,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");
  const [selectedTicketRowId, setSelectedTicketRowId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<string[]>(initialChannelFilter ?? []);
  const [statusFilter, setStatusFilter] = useState<string[]>(initialStatusFilter ?? []);
  const [priorityFilter, setPriorityFilter] = useState<string[]>(initialPriorityFilter ?? []);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>(initialDepartmentFilter ?? []);

  const sortField = (initialSortField as SortField) || "time";
  // The time comparator is newest first, so the initial direction is ascending.
  const sortAsc = initialSortAsc ?? true;
  const [page, setPage] = useState<number>(initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize ?? 10);

  // Debounce search input by 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Report table state changes so parent can preserve them
  useEffect(() => {
    onTableStateChange?.({
      page,
      pageSize,
      search: searchInput,
      channelFilter,
      statusFilter,
      priorityFilter,
      departmentFilter,
      sortField,
      sortAsc,
    });
  }, [
    page,
    pageSize,
    searchInput,
    channelFilter,
    statusFilter,
    priorityFilter,
    departmentFilter,
    sortField,
    sortAsc,
    onTableStateChange,
  ]);

  // Map team to department lookup
  const teamToDept = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    const deptMap = new Map<string, string>();
    for (const d of departments) {
      deptMap.set(d.id, d.name);
    }
    for (const t of teams) {
      const deptName = deptMap.get(t.departmentId) || "General";
      map.set(t.id, { id: t.departmentId, name: deptName });
    }
    return map;
  }, [teams, departments]);

  const clearAllFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setChannelFilter([]);
    setStatusFilter([]);
    setPriorityFilter([]);
    setDepartmentFilter([]);
    setPage(1);
  };

  const overdueTicketIds = new Set(getOverdueTickets(tickets).map((ticket) => ticket.id));
  const filtered = tickets.filter((t) => {
    if (initialFocus === "active" && ["Resolved", "Closed"].includes(t.status)) {
      return false;
    }
    if (initialFocus === "resolved" && !["Resolved", "Closed"].includes(t.status)) {
      return false;
    }
    if (initialFocus === "overdue" && !overdueTicketIds.has(t.id)) return false;
    if (initialFocus === "sla-risk" && !isTicketSlaAtRisk(t)) return false;

    if (channelFilter.length > 0 && !channelFilter.includes(t.channel)) {
      return false;
    }
    if (priorityFilter.length > 0 && !priorityFilter.includes(t.priority)) {
      return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(t.status)) {
      return false;
    }

    const deptInfo = t.teamId ? teamToDept.get(t.teamId) : undefined;
    if (departmentFilter.length > 0) {
      if (!deptInfo || !departmentFilter.includes(deptInfo.id)) {
        return false;
      }
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      const matchesCode = t.code.toLowerCase().includes(q);
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesCompany = t.companyName.toLowerCase().includes(q);
      const matchesContact = t.clientContact?.toLowerCase().includes(q);
      const matchesAssignee = t.assignedToName?.toLowerCase().includes(q);
      const matchesDept = deptInfo?.name.toLowerCase().includes(q);

      return (
        matchesCode ||
        matchesTitle ||
        matchesCompany ||
        matchesContact ||
        matchesAssignee ||
        matchesDept
      );
    }

    return true;
  });
  const scopeFilteredCount = filtered.length;

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
  const kpiCards = [
    ["TOTAL", tickets.length, "border-blue-400/30 bg-blue-500/15 text-blue-200"],
    ["ACTIVE", tickets.filter((ticket) => ["Open", "In Progress"].includes(ticket.status)).length, "border-indigo-400/30 bg-indigo-500/15 text-indigo-200"],
    ["NEEDS ATTENTION", tickets.filter((ticket) => ["Escalated", "Under Review", "Pending QA"].includes(ticket.status)).length, "border-amber-400/30 bg-amber-500/15 text-amber-200"],
    ["RESOLVED", tickets.filter((ticket) => ["Resolved", "Closed"].includes(ticket.status)).length, "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"],
  ] as const;
  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > lastPage) setPage(lastPage);
  }, [filtered.length, page, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 bg-slate-900 px-5 py-5 text-white sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{activeScope ? ({ active: "Active Tickets", overdue: "Overdue Tickets", "sla-risk": "SLA Risk Tickets", resolved: "Resolved Tickets" } as Record<TicketTableFocus, string>)[activeScope] : viewTitle ?? "All Tickets"}</h2>
          <p className="mt-1 text-xs text-slate-300">Review, prioritize, and manage support requests.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kpiCards.map(([label, count, styles]) => <div key={label} className={`min-w-20 rounded-lg border px-3 py-1.5 text-center ${styles}`}><span className="block text-[9px] font-bold tracking-wide">{label}</span><strong className="block text-lg leading-5">{count}</strong></div>)}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <TableSearch id="ticket-search" value={searchInput} onChange={setSearchInput} placeholder="Search tickets..." aria-label="Search tickets" className="min-w-52 w-full sm:w-auto sm:flex-1 sm:max-w-[480px]" />
        {activeScope && <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"><span>{({ active: "Active", overdue: "Overdue", "sla-risk": "SLA risk", resolved: "Resolved" } as Record<TicketTableFocus, string>)[activeScope]}</span><button type="button" aria-label="Remove dashboard scope" onClick={onClearScope} className="rounded-full px-1 text-indigo-700 hover:bg-indigo-100">×</button></div>}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
        <TicketTableFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => { setChannelFilter(c); setPage(1); }}
          priorityFilter={priorityFilter}
          setPriorityFilter={(p) => { setPriorityFilter(p); setPage(1); }}
          statusFilter={statusFilter}
          setStatusFilter={(status) => { setStatusFilter(status); setPage(1); }}
          departmentFilter={departmentFilter}
          setDepartmentFilter={(d) => { setDepartmentFilter(d); setPage(1); }}
          departmentOptions={departments}
          onClearAll={clearAllFilters}
          showStatus
          showPriority
          showChannelFilter={false}
          showDepartmentFilter={false}
        />
        <button type="button" onClick={onCreateNew} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><span aria-hidden="true" className="material-symbols-outlined text-base">add</span>New Ticket</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ticket-list-table w-full border-collapse text-left text-xs">
          <thead className="bg-white text-[11px] font-bold tracking-wider text-slate-700 uppercase select-none">
            <tr>
              <th className="px-5 py-2.5">ID</th>
              <th className="px-4 py-2.5">Incident</th>
              <th className="px-3 py-2.5">Priority</th>
              <th
                className=" px-4 py-2.5"
          
              >
                <div className="flex items-center gap-1">
                  <span>Company</span>
             
                </div>
              </th>
        
              <th className="px-4 py-2.5">Assignee</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-5 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => {
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicketRowId(t.id)}
                  onDoubleClick={() => onViewTicket(t.id)}
                  className={`group cursor-pointer transition-colors hover:bg-indigo-50/40 ${selectedTicketRowId === t.id ? "bg-indigo-50" : ""}`}
                >
                  <td className="px-5 py-3 font-mono font-bold whitespace-nowrap text-slate-500">
                    {t.code}
                  </td>
                  <td className="max-w-sm px-4 py-2.5">
                    <button type="button" data-ticket-link={t.id} onClick={(event) => { event.stopPropagation(); onViewTicket(t.id); }} aria-label={`Open ${t.code}: ${t.title}`} title={t.title} className="line-clamp-2 text-left font-bold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-indigo-600">
                      {t.title}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>

                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{t.companyName}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                        <StaffAvatar src={employees.find((employee) => employee.id === t.assignedToId)?.avatar || "person"} alt={`${t.assignedToName} profile`} sizeClassName="h-7 w-7" fallbackClassName="text-[15px]" />
                      </span>
                      <span>{t.assignedToName || "Unassigned"}</span>
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  <td className="px-5 py-2.5 whitespace-nowrap"><button type="button" onClick={(event) => { event.stopPropagation(); onViewTicket(t.id); }} aria-label={`Open ticket ${t.code}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><span>Open ticket</span><span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span></button></td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      search_off
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {tickets.length === 0 ? "No tickets in this queue yet" : "No matching tickets"}
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        {tickets.length === 0 ? "Tickets available to your role will appear here." : "No tickets match the selected search criteria or filter tags."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={tickets.length === 0 ? onReturnToAllTickets : clearAllFilters}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        restart_alt
                      </span>
                      <span>{tickets.length === 0 ? "Return to all tickets" : "Clear all filters"}</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{scopeFilteredCount} tickets match the current search and filters. Sorted by {sortField}, {sortAsc ? "ascending" : "descending"}.</p>
      <NumericPagination
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
