import React, { useState, useRef, useCallback } from "react";
import { useTicketStore } from "../../store/barrel";
import { TicketTable } from "./TicketTable";
import { TicketDetailHero } from "./TicketDetailHero";
import { filterTicketsByRole } from "../../utils/barrel";
import { useNavigate, useParams } from "react-router-dom";

export const TicketRegistryView: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
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
  } = useTicketStore();

  const [tableFocus] = useState(ticketTableFocus);
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

  // Role-specific filtered tickets
  const roleTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );
  const selectedTicket =
    roleTickets.find((t) => t.id === ticketId) ||
    data.tickets.find((t) => t.id === ticketId);

  const handleViewTicket = useCallback(
    (id: string) => {
      // Save the current scroll position before navigating away
      tableStateRef.current.scrollTop = window.scrollY;
      setSelectedTicketId(id);
      navigate(`/tickets/${encodeURIComponent(id)}`);
      window.scrollTo(0, 0);
    },
    [navigate, setSelectedTicketId],
  );

  const handleTableStateChange = useCallback(
    (state: {
      page: number;
      pageSize: number;
      search: string;
      channelFilter: string[];
      statusFilter: string[];
      priorityFilter: string[];
      departmentFilter: string[];
    }) => {
      tableStateRef.current = { ...tableStateRef.current, ...state };
    },
    [],
  );

  return (
    <div className="space-y-6 p-2">
      {selectedTicket ? (
        <TicketDetailHero
          ticket={selectedTicket}
          employees={data.employees}
          companies={data.companies}
          services={data.services}
          onUpdateTicket={(updates) => updateTicket(selectedTicket.id, updates)}
          onStatusChange={(status) =>
            updateTicketStatus(selectedTicket.id, status)
          }
          onAssigneeChange={(empId, note) =>
            assignTicket(selectedTicket.id, empId, note)
          }
        />
      ) : (
        <TicketTable
          tickets={roleTickets}
          teams={data.teams}
          departments={data.departments}
          onViewTicket={handleViewTicket}
          onCreateNew={() => navigate("/tickets/new")}
          initialPage={tableStateRef.current.page}
          initialPageSize={tableStateRef.current.pageSize}
          initialSearch={tableStateRef.current.search}
          initialChannelFilter={tableStateRef.current.channelFilter}
          initialStatusFilter={tableStateRef.current.statusFilter}
          initialPriorityFilter={tableStateRef.current.priorityFilter}
          initialDepartmentFilter={tableStateRef.current.departmentFilter}
          initialFocus={tableFocus ?? undefined}
          onTableStateChange={handleTableStateChange}
        />
      )}
    </div>
  );
};
