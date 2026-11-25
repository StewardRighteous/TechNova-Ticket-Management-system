import { useTicketStore } from "../../../store/barrel";
import React, { useState, useEffect } from "react";
import type {
  Ticket,
  Team,
  Department,
  Employee,
  Company,
} from "../../../types/barrel";
import { TableRefreshButton, CallToAction, TableToolbar, Button, DataTable, getTablePageRows, Heading, Icon, LogoMark, TableBody, TableCell, TableHead, TableHeader, TableRow, PriorityBadge, StatusBadge, StaffAvatar, TableSearch } from "../../../ui/barrel";
import { TicketTableFilters } from "../TicketTableFilters";
import type { TicketTableFocus } from "../../../store/ticketStore";
import { getOverdueTickets, isTicketSlaAtRisk } from "../../dashboard/dashboardMetrics";

interface TicketTableProps {
  tickets: Ticket[];
  companies?: readonly Company[];
  teams?: Team[];
  departments?: Department[];
  employees?: Employee[];
  onViewTicket: (ticketId: string) => void;
  onCreateNew?: () => void;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialChannelFilter?: string[];
  initialStatusFilter?: string[];
  initialPriorityFilter?: string[];
  initialDepartmentFilter?: string[];
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
  }) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  companies = [],
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
  initialFocus,
  activeScope = null,
  viewTitle,
  onReturnToAllTickets,
  onTableStateChange,
}) => {
  const addToast = useTicketStore((state) => state.addToast);
  const companyLogos = new Map(companies.map(({ id, logo }) => [id, logo]));
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");
  const [selectedTicketRowId, setSelectedTicketRowId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<string[]>(initialChannelFilter ?? []);
  const [statusFilter, setStatusFilter] = useState<string[]>(initialStatusFilter ?? []);
  const [priorityFilter, setPriorityFilter] = useState<string[]>(initialPriorityFilter ?? []);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>(initialDepartmentFilter ?? []);

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
      departmentFilter,    });
  }, [
    page,
    pageSize,
    searchInput,
    channelFilter,
    statusFilter,
    priorityFilter,
    departmentFilter,    onTableStateChange,
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

  const paginated = getTablePageRows(filtered, page, pageSize);
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
          <Heading variant="plain" className="text-lg font-bold tracking-tight">{activeScope ? ({ active: "Active Tickets", overdue: "Overdue Tickets", "sla-risk": "SLA Risk Tickets", resolved: "Resolved Tickets" } as Record<TicketTableFocus, string>)[activeScope] : viewTitle ?? "All Tickets"}</Heading>
          <p className="mt-1 text-xs text-slate-300">Review, prioritize, and manage support requests.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kpiCards.map(([label, count, styles]) => <div key={label} className={`min-w-20 rounded-lg border px-3 py-1.5 text-center ${styles}`}><span className="block text-[9px] font-bold tracking-wide">{label}</span><strong className="block text-lg leading-5">{count}</strong></div>)}
        </div>
      </div>
      <DataTable rowCount={filtered.length} className="ticket-list-table border-collapse"
        scroll
        toolbar={
          <TableToolbar>
            <TableSearch id="ticket-search" value={searchInput} onChange={setSearchInput} placeholder="Search tickets..." aria-label="Search tickets" className="min-w-52 w-full sm:w-auto sm:flex-1 sm:max-w-[480px]" />
            {activeScope && <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"><span>{({ active: "Active", overdue: "Overdue", "sla-risk": "SLA risk", resolved: "Resolved" } as Record<TicketTableFocus, string>)[activeScope]}</span></div>}
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
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
              hasExtraFilters={Boolean(activeScope)}
              showStatus
              showPriority
              showChannelFilter={false}
              showDepartmentFilter={false}
            />
            <TableRefreshButton onRefresh={() => addToast("Tickets refreshed", "success")} />
            {onCreateNew && <CallToAction icon="add" onClick={onCreateNew} className="h-8 shrink-0 px-3 py-0 text-xs">New Ticket</CallToAction>}
            </div>
          </TableToolbar>
        }
        pagination={{ currentPage: page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      >
        <TableHead>
          <TableRow>
            <TableHeader density="edge">ID</TableHeader>
            <TableHeader>Incident</TableHeader>
            <TableHeader density="narrow">Priority</TableHeader>
            <TableHeader>Company</TableHeader>
            <TableHeader>Assignee</TableHeader>
            <TableHeader density="narrow">Status</TableHeader>
            <TableHeader density="edge">Action</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white">
          {paginated.map((t) => {
            return (
              <TableRow selected={selectedTicketRowId === t.id}
                key={t.id}
                onSelect={() => setSelectedTicketRowId(t.id)}
                onOpen={() => onViewTicket(t.id)}

              >
                <TableCell density="edge" className="font-mono font-bold whitespace-nowrap text-slate-500">
                  <span className="cursor-text">{t.code}</span>
                </TableCell>
                <TableCell className="max-w-sm">
                  <Button tone="plain" type="button" data-ticket-link={t.id} onClick={(event) => { event.stopPropagation(); onViewTicket(t.id); }} aria-label={`Open ${t.code}: ${t.title}`} title={t.title} className="line-clamp-2 text-left font-bold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-indigo-600">
                    {t.title}
                  </Button>
                </TableCell>
                <TableCell density="narrow" className="whitespace-nowrap">
                  <span className="cursor-text"><PriorityBadge priority={t.priority} /></span>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <LogoMark variant="compact" src={companyLogos.get(t.companyId) || "/company-marks.svg#company"} />
                    <span className="cursor-text font-semibold text-slate-900">{t.companyName}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                      <StaffAvatar src={employees.find((employee) => employee.id === t.assignedToId)?.avatar || "person"} alt={`${t.assignedToName} profile`} sizeClassName="h-7 w-7" fallbackClassName="text-[15px]" />
                    </span>
                    <span className="cursor-text">{t.assignedToName || "Unassigned"}</span>
                  </span>
                </TableCell>

                <TableCell density="narrow" className="whitespace-nowrap">
                  <span className="cursor-text"><StatusBadge status={t.status} /></span>
                </TableCell>

                <TableCell density="edge" className="whitespace-nowrap"><Button tone="plain" type="button" onClick={(event) => { event.stopPropagation(); onViewTicket(t.id); }} aria-label={`Open ticket ${t.code}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><span>Open ticket</span><Icon aria-hidden="true" className="text-sm">arrow_forward</Icon></Button></TableCell>
              </TableRow>
            );
          })}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell density="plain" colSpan={9} className="p-8 text-center text-xs text-slate-500">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Icon className="text-4xl text-slate-300">
                    search_off
                  </Icon>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {tickets.length === 0 ? "No tickets in this queue yet" : "No matching tickets"}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      {tickets.length === 0 ? "Tickets available to your role will appear here." : "No tickets match the selected search criteria or filter tags."}
                    </p>
                  </div>
                  {tickets.length === 0 && onReturnToAllTickets && <Button tone="plain" type="button" onClick={onReturnToAllTickets}>Return to ticket queue</Button>}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>

      <p className="sr-only" role="status" aria-live="polite">{scopeFilteredCount} tickets match the current search and filters.</p>
    </div>
  );
};
