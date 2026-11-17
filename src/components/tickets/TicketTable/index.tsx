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
  initialFocus?: TicketTableFocus;
  onTableStateChange?: (state: {
    page: number;
    pageSize: number;
    search: string;
    channelFilter: string[];
    statusFilter: string[];
    priorityFilter: string[];
    departmentFilter: string[];
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
  initialFocus,
  onTableStateChange,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");
  const [channelFilter, setChannelFilter] = useState<string[]>(initialChannelFilter ?? []);
  const [statusFilter, setStatusFilter] = useState<string[]>(initialStatusFilter ?? []);
  const [priorityFilter, setPriorityFilter] = useState<string[]>(initialPriorityFilter ?? []);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>(initialDepartmentFilter ?? []);

  const [sortField, setSortField] = useState<SortField>("time");
  // The time comparator is newest first, so the initial direction is ascending.
  const [sortAsc, setSortAsc] = useState<boolean>(true);
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
    });
  }, [
    page,
    pageSize,
    searchInput,
    channelFilter,
    statusFilter,
    priorityFilter,
    departmentFilter,
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

  const filtered = tickets.filter((t) => {
    if (initialFocus === "active" && ["Resolved", "Closed"].includes(t.status)) {
      return false;
    }
    if (initialFocus === "resolved" && !["Resolved", "Closed"].includes(t.status)) {
      return false;
    }
    if (initialFocus === "overdue") {
      if (["Resolved", "Closed"].includes(t.status) || !t.dueAt || Date.parse(t.dueAt) >= Date.now()) {
        return false;
      }
    }
    if (
      initialFocus === "sla-risk" &&
      !["At Risk", "Breached"].includes(t.slaRisk)
    ) {
      return false;
    }

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
        searchQuery={searchInput}
        onSearchChange={(s) => setSearchInput(s)}
        searchPlaceholder="Filter by ID, issue, client..."
        onClick={onCreateNew}
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
        <table className="w-full border-collapse text-left text-xs">
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
                  <td className="max-w-xs px-4 py-3">
                    <div className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                      {t.title}
                    </div>
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

                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewTicket(t.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-600 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        visibility
                      </span>
                      <span>View</span>
                    </button>
                  </td>
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
                        No matching tickets
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        No tickets match the selected search criteria or filter tags.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        restart_alt
                      </span>
                      <span>Clear all filters</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
