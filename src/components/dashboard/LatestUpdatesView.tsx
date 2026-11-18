import React from "react";
import { useNavigate } from "react-router-dom";
import { RecentTickets } from "./activityCards";
import { useTicketStore } from "../../store/barrel";
import { filterTicketsByRole } from "../../utils/barrel";

export const LatestUpdatesView: React.FC = () => {
  const navigate = useNavigate();
  const { data, activeRole, currentUser, setSelectedTicketId } = useTicketStore();
  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
    data.companies
      .filter((company) => company.accountManager === currentUser?.name)
      .map((company) => company.id),
  ).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="mt-1 text-sm text-slate-500">Tickets ordered by their most recent activity.</p>
      </div>
      <RecentTickets tickets={tickets} onOpen={openTicket} hideLatestUpdates />
    </div>
  );
};
