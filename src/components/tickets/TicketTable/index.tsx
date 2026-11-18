import React, { useState, useEffect } from "react";
import type {
  Ticket,
  Team,
  Department,
} from "../../../types/barrel";
import { PriorityBadge, StatusBadge, NumericPagination } from "../../common/barrel";
import { TicketTableFilters } from "../TicketTableFilters";
import type { TicketTableFocus } from "../../../store/ticketStore";
import { getOverdueTickets, isTicketSlaAtRisk } from "../../dashboard/dashboardMetrics";

interface TicketTableProps {
  tickets: Ticket[];
  teams?: Team[];
  departments?: Department[];
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
  onTableStateChange,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");
  const [channelFilter, setChannelFilter] = useState<string[]>(initialChannelFilter ?? []);
  const [statusFilter, setStatusFilter] = useState<string[]>(initialStatusFilter ?? []);
  const [priorityFilter, setPriorityFilter] = useState<string[]>(initialPriorityFilter ?? []);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>(initialDepartmentFilter ?? []);

  const [sortField, setSortField] = useState<SortField>((initialSortField as SortField) || "time");
  // The time comparator is newest first, so the initial direction is ascending.
  const [sortAsc, setSortAsc] = useState<boolean>(initialSortAsc ?? true);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {[
            ["TOTAL", tickets.length, "border-blue-400/30 bg-blue-500/15 text-blue-200"],
            ["OPEN", tickets.filter((ticket) => ticket.status === "Open").length, "border-indigo-400/30 bg-indigo-500/15 text-indigo-200"],
            ["IN PROGRESS", tickets.filter((ticket) => ticket.status === "In Progress").length, "border-amber-400/30 bg-amber-500/15 text-amber-200"],
            ["ESCALATED", tickets.filter((ticket) => ticket.status === "Escalated").length, "border-orange-400/30 bg-orange-500/15 text-orange-200"],
            ["UNDER REVIEW", tickets.filter((ticket) => ticket.status === "Under Review").length, "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"],
            ["PENDING QA", tickets.filter((ticket) => ticket.status === "Pending QA").length, "border-violet-400/30 bg-violet-500/15 text-violet-200"],
            ["RESOLVED", tickets.filter((ticket) => ticket.status === "Resolved").length, "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"],
            ["CLOSED", tickets.filter((ticket) => ticket.status === "Closed").length, "border-slate-400/30 bg-slate-500/15 text-slate-200"],
          ].map(([label, count, styles]) => <div key={String(label)} className={`min-w-20 rounded-lg border px-3 py-1.5 text-center ${styles}`}><span className="block text-[9px] font-bold tracking-wide">{label}</span><strong className="block text-lg leading-5">{count}</strong></div>)}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="relative min-w-52 w-full sm:w-auto sm:flex-1 sm:max-w-xs">
          <span aria-hidden="true" className="material-symbols-outlined absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-500">search</span>
          <input type="search" id="ticket-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search tickets..." aria-label="Search tickets" className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-3 pl-8 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-200" />
        </div>
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
        
              <th className="px-4 py-2.5">Department</th>
              
          
              <th className="px-3 py-2.5">Status</th>
              <th className="px-5 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => {
              const deptInfo = t.teamId ? teamToDept.get(t.teamId) : undefined;
              return (
                <tr
                  key={t.id}
                  onClick={() => onViewTicket(t.id)}
                  className="group cursor-pointer transition-colors hover:bg-indigo-50/40"
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
                    <div className="font-semibold text-slate-900">
                      {t.companyName}
                    </div>
                  
                  </td>

              

                  <td className="px-4 py-2.5 whitespace-normal">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        corporate_fare
                      </span>
                      {deptInfo ? deptInfo.name : "Operations"}
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
                      onClick={tickets.length === 0 ? onClearScope : clearAllFilters}
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
        pageSizeOptions={[5, 10, 20, 25, 50, 75, 100]}
      />
    </div>
  );
};
