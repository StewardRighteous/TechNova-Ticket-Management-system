import React from "react";
import { useTicketStore } from "../../store";

import { DashboardStatsRow } from "./DashboardStatsRow";
import { DashboardTicketTable } from "./DashboardTicketTable";
import { filterTicketsByRole } from "../../utils";

export const DashboardView: React.FC = () => {
  const { data, activeRole, currentUser, setSelectedTicketId, setActiveTab } =
    useTicketStore();

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab("tickets");
  };

  const roleFilteredTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );

  const p1Count = roleFilteredTickets.filter((t) =>
    t.priority.includes("P1"),
  ).length;
  const p2Count = roleFilteredTickets.filter((t) =>
    t.priority.includes("P2"),
  ).length;
  const p3Count = roleFilteredTickets.filter((t) =>
    t.priority.includes("P3"),
  ).length;

  const whatsappCount = roleFilteredTickets.filter(
    (t) => t.channel === "whatsapp",
  ).length;
  const emailCount = roleFilteredTickets.filter(
    (t) => t.channel === "email",
  ).length;
  const phoneCount = roleFilteredTickets.filter(
    (t) => t.channel === "phone",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <DashboardStatsRow
        p1Count={p1Count}
        p2Count={p2Count}
        p3Count={p3Count}
        whatsappCount={whatsappCount}
        emailCount={emailCount}
        phoneCount={phoneCount}
        totalTickets={roleFilteredTickets.length}
      />

      <DashboardTicketTable
        tickets={roleFilteredTickets}
        onSelectTicket={handleSelectTicket}
        onExploreAll={() => setActiveTab("tickets")}
      />
    </div>
  );
};
