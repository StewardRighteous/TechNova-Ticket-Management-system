import React, { useRef, useCallback, useLayoutEffect } from "react";
import { useTicketStore } from "../../store/barrel";
import { TicketTable } from "./TicketTable";
import { TicketDetailHero } from "./TicketDetailHero";
import { filterTicketsByRole } from "../../utils/barrel";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { loadWorkspacePreferences } from "../../utils/workspacePreferences";

export const TicketRegistryView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { ticketId } = useParams<{ ticketId: string }>();
  const validSortFields = ["time", "code", "title", "company", "priority", "status"];
  const sortField = validSortFields.includes(searchParams.get("sort") || "") ? searchParams.get("sort")! : "time";
  const sortAsc = searchParams.get("dir") !== "desc";
  const parseList = (key: string) => searchParams.getAll(key).flatMap((value) => value.split(",")).filter(Boolean);
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    ticketTableFocus,
    setTicketTableFocus,
    updateTicketStatus,
    assignTicket,
    updateTicket,
    removeTicket,
    addToast,
  } = useTicketStore();
  const preferredView = loadWorkspacePreferences(currentUser?.id).defaultView;

  const queryFocus = searchParams.get("scope");
  const validFocus = queryFocus === "active" || queryFocus === "overdue" || queryFocus === "sla-risk" || queryFocus === "resolved" ? queryFocus : null;
  const tableFocus = validFocus;
  const explicitView = searchParams.get("view");
  const defaultView = explicitView === "all" || explicitView === "mine" || explicitView === "urgent" ? explicitView : preferredView;
  React.useEffect(() => {
    if (ticketTableFocus) setTicketTableFocus(null);
  }, [setTicketTableFocus, ticketTableFocus]);

  // Preserve table scroll/filter state across detail-view round-trips.
  // The ref survives the TicketTable unmount so we can restore from it.
  const tableStateRef = useRef<{
    page: number;
    pageSize: number;
    scrollTop: number;
    search: string;
    channelFilter: string[];
    statusFilter: string[];
    priorityFilter: string[];
    departmentFilter: string[];
    sortField?: string;
    sortAsc?: boolean;
    focusTicketId?: string;
  }>({
    page: 1,
    pageSize: 10,
    scrollTop: 0,
    search: "",
    channelFilter: [],
    statusFilter: [],
    priorityFilter: [],
    departmentFilter: [],
  });
  const hasExplicitReturn = Boolean((location.state as { returnTo?: string } | null)?.returnTo);
  const isDirectDetail = Boolean(ticketId && !hasExplicitReturn && !window.history.state?.usr?.returnTo && !window.history.state?.usr?.directEntry);
  React.useEffect(() => {
    if (ticketId && isDirectDetail) {
      const params = new URLSearchParams(location.search);
      for (const key of ["page", "size", "q", "channel", "status", "priority", "department", "sort", "dir"]) params.delete(key);
      const suffix = params.toString();
      navigate(`/tickets/${encodeURIComponent(ticketId)}${suffix ? `?${suffix}` : ""}`, { replace: true, state: { returnTo: `/tickets${suffix ? `?${suffix}` : ""}`, directEntry: true } });
    }
  }, [ticketId, isDirectDetail, location.search, navigate]);

  useLayoutEffect(() => {
    if (!ticketId) {
      const state = window.history.state?.usr as { ticketScrollY?: number; focusTicketId?: string } | undefined;
      const scrollTop = state?.ticketScrollY ?? tableStateRef.current.scrollTop;
      window.scrollTo(0, scrollTop);
      const focusTicketId = state?.focusTicketId ?? tableStateRef.current.focusTicketId;
      if (focusTicketId) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-ticket-link="${CSS.escape(focusTicketId)}"]`)?.focus());
    }
  }, [ticketId]);

  const updateUrlState = useCallback((state: { page: number; pageSize: number; search: string; channelFilter: string[]; statusFilter: string[]; priorityFilter: string[]; departmentFilter: string[]; sortField?: string; sortAsc?: boolean }) => {
    tableStateRef.current = { ...tableStateRef.current, ...state };
    const params = new URLSearchParams(location.search);
    const entries: Record<string, string | string[] | undefined> = { page: state.page > 1 ? String(state.page) : undefined, size: state.pageSize !== 10 ? String(state.pageSize) : undefined, q: state.search || undefined, channel: state.channelFilter, status: state.statusFilter, priority: state.priorityFilter, department: state.departmentFilter, sort: state.sortField && state.sortField !== "time" ? state.sortField : undefined, dir: state.sortAsc === false ? "desc" : undefined };
    for (const [key, values] of Object.entries(entries)) { params.delete(key); if (Array.isArray(values)) values.forEach((value) => params.append(key, value)); else if (values) params.set(key, values); }
    if (params.toString() !== new URLSearchParams(location.search).toString()) setSearchParams(params, { replace: true });
  }, [location.search, setSearchParams]);

  // Role-specific filtered tickets
  const roleTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
    data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id),
  );
  const visibleTickets = validFocus || explicitView === "all"
    ? roleTickets
    : roleTickets.filter((ticket) => {
        if (defaultView === "mine") return ticket.assignedToId === currentUser?.id;
        if (defaultView === "urgent") return ticket.priority === "P1 Urgent";
        return true;
      });
  const viewTitle = defaultView === "mine" ? "My Tickets" : defaultView === "urgent" ? "Urgent Tickets" : undefined;
  const selectedTicket =
    roleTickets.find((t) => t.id === ticketId);
  React.useEffect(() => {
    if (selectedTicket) window.scrollTo(0, 0);
  }, [selectedTicket?.id]);

  const handleViewTicket = useCallback(
    (id: string) => {
      // Save the current scroll position before navigating away
      tableStateRef.current.scrollTop = window.scrollY;
      tableStateRef.current.focusTicketId = id;
      setSelectedTicketId(id);
      navigate(`/tickets/${encodeURIComponent(id)}${location.search}`, { state: { returnTo: `${location.pathname}${location.search}`, ticketScrollY: window.scrollY, focusTicketId: id } });
      window.scrollTo(0, 0);
    },
    [location.pathname, location.search, navigate, setSelectedTicketId],
  );

  return (
    <div className="space-y-6 p-2">
      {ticketId && !selectedTicket ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Ticket unavailable</h1>
          <p className="mt-2 text-sm text-slate-700">This ticket may not exist or may not be available to your role.</p>
          <button type="button" onClick={() => navigate("/tickets")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to tickets</button>
        </section>
      ) : selectedTicket ? (
        <TicketDetailHero
          ticket={selectedTicket}
          employees={activeRole === "operations_manager" || activeRole === "management" ? data.employees : data.employees.filter((employee) => employee.id === selectedTicket.assignedToId)}
          companies={data.companies}
          services={data.services}
          onUpdateTicket={(updates) => updateTicket(selectedTicket.id, updates)}
          onDelete={() => {
            removeTicket(selectedTicket.id);
            addToast(`${selectedTicket.code} deleted`, "success");
            navigate(`/tickets${location.search}`, { replace: true });
          }}
          onStatusChange={(status, note) =>
            updateTicketStatus(selectedTicket.id, status, note)
          }
          onAssigneeChange={(empId, note) =>
            assignTicket(selectedTicket.id, empId, note)
          }
          onViewEmployee={(employeeId) => navigate(`/employees/${encodeURIComponent(employeeId)}`)}
          onViewCompany={(companyId) => navigate(`/companies/${encodeURIComponent(companyId)}`)}
          onOpenClientNotification={() => navigate(`/tickets/${encodeURIComponent(selectedTicket.id)}/notify-client`)}
        />
      ) : (
      <TicketTable
          tickets={visibleTickets}
          teams={data.teams}
          departments={data.departments}
          employees={data.employees}
          onViewTicket={handleViewTicket}
          onViewCompany={(companyId) => navigate(`/companies/${encodeURIComponent(companyId)}`)}
          onViewAssignee={(employeeId) => navigate(`/employees/${encodeURIComponent(employeeId)}`)}
          onCreateNew={() => navigate("/tickets/new")}
          initialPage={Number(searchParams.get("page")) || tableStateRef.current.page}
          initialPageSize={Number(searchParams.get("size")) || tableStateRef.current.pageSize}
          initialSearch={searchParams.get("q") ?? tableStateRef.current.search}
          initialChannelFilter={parseList("channel").length ? parseList("channel") : tableStateRef.current.channelFilter}
          initialStatusFilter={parseList("status").length ? parseList("status") : tableStateRef.current.statusFilter}
          initialPriorityFilter={parseList("priority").length ? parseList("priority") : tableStateRef.current.priorityFilter}
          initialDepartmentFilter={parseList("department").length ? parseList("department") : tableStateRef.current.departmentFilter}
          initialSortField={sortField}
          initialSortAsc={sortAsc}
          initialFocus={tableFocus ?? undefined}
          activeScope={validFocus}
          viewTitle={viewTitle}
          onClearScope={() => { const params = new URLSearchParams(searchParams); params.delete("scope"); setSearchParams(params, { replace: true }); }}
          onReturnToAllTickets={() => navigate("/tickets?view=all")}
          onTableStateChange={updateUrlState}
        />
      )}
    </div>
  );
};
