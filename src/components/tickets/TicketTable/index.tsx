import React, { useState, useEffect } from "react";
import type {
  Ticket,
  Team,
  Department,
} from "../../../types/barrel";
import {
  PriorityBadge,
  StatusBadge,
  NumericPagination,
  TableHeaderSection,
} from "../../common/barrel";
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
      <TableHeaderSection
        title={activeScope ? ({ active: "Active Tickets", overdue: "Overdue Tickets", "sla-risk": "SLA Risk Tickets", resolved: "Resolved Tickets" } as Record<TicketTableFocus, string>)[activeScope] : viewTitle ?? "All Tickets"}
        searchQuery={searchInput}
        onSearchChange={(s) => setSearchInput(s)}
        searchPlaceholder="Filter by ID, issue, client..."
        onClick={onCreateNew}
      >
        {activeScope && <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"><span>{({ active: "Active", overdue: "Overdue", "sla-risk": "SLA risk", resolved: "Resolved" } as Record<TicketTableFocus, string>)[activeScope]}</span><button type="button" aria-label="Remove dashboard scope" onClick={onClearScope} className="rounded-full px-1 text-indigo-700 hover:bg-indigo-100">×</button></div>}
        <span className="text-xs text-slate-500" aria-live="polite">{filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}</span>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">Sort by <select aria-label="Sort tickets by" className="rounded-md border border-slate-200 bg-white px-2 py-1" value={sortField} onChange={(event) => setSortField(event.target.value as SortField)}>{[["time", "Date created"], ["code", "Ticket ID"], ["title", "Title"], ["company", "Company"], ["priority", "Priority"], ["status", "Status"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button type="button" aria-label={`Sort ${sortAsc ? "descending" : "ascending"}`} onClick={() => setSortAsc((ascending) => !ascending)} className="rounded border border-slate-200 px-2 py-1">{sortAsc ? "Ascending" : "Descending"}</button></label>
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
          departmentFilter={departmentFilter}
          setDepartmentFilter={(d) => {
            setDepartmentFilter(d);
            setPage(1);
          }}
          departmentOptions={departments}
          onClearAll={clearAllFilters}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="ticket-list-table w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th aria-sort={sortField === "code" ? (sortAsc ? "ascending" : "descending") : "none"} className="px-5 py-3">
                <button type="button" onClick={() => handleSort("code")} className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "code"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
                </button>
              </th>
              <th className="px-4 py-3">Incident</th>
              <th aria-sort={sortField === "priority" ? (sortAsc ? "ascending" : "descending") : "none"} className="px-3 py-3">
                <button type="button" onClick={() => handleSort("priority")} className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "priority"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
                </button>
              </th>
              <th
                className=" px-4 py-3"
          
              >
                <div className="flex items-center gap-1">
                  <span>Company</span>
             
                </div>
              </th>
        
              <th className="px-4 py-3">Department</th>
              
          
              <th aria-sort={sortField === "status" ? (sortAsc ? "ascending" : "descending") : "none"} className="px-3 py-3">
                <button type="button" onClick={() => handleSort("status")} className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "status"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
                </button>
              </th>
              <th className="px-5 py-3">Action</th>
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
                  <td className="max-w-sm px-4 py-3">
                    <button type="button" data-ticket-link={t.id} onClick={(event) => { event.stopPropagation(); onViewTicket(t.id); }} aria-label={`Open ${t.code}: ${t.title}`} title={t.title} className="line-clamp-2 text-left font-bold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-indigo-600">
                      {t.title}
                    </button>
                    <div className="line-clamp-1 text-[11px] text-slate-500">
                      {t.description}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {t.companyName}
                    </div>
                  
                  </td>

              

                  <td className="px-4 py-3 whitespace-normal">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        corporate_fare
                      </span>
                      {deptInfo ? deptInfo.name : "Operations"}
                    </span>
                  </td>

                  

                

                  <td className="px-3 py-3 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  <td className="px-5 py-3 text-right whitespace-nowrap"><span className="text-xs text-slate-400">Open ticket</span></td>
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
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};
