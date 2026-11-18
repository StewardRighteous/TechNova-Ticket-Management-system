import React from "react";
import { useTicketStore } from "../../../store/barrel";
import { filterTicketsByRole } from "../../../utils/barrel";
import { ExecutiveKpiRibbon } from "../ExecutiveKpiRibbon";
import { VolumeBreakdownCards } from "../VolumeBreakdownCards";
import { HighAttentionTicketsTable } from "../HighAttentionTicketsTable";
import { computeExecutiveMetrics } from "../dashboardMetrics";
import { RecentTickets, NotificationsCard } from "../activityCards";
import { useNavigate } from "react-router-dom";
import { notificationForViewer } from "../../../utils/notificationDisplay";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    setTicketTableFocus,
    markNotificationRead,
  } = useTicketStore();

  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
    data.companies
      .filter((company) => company.accountManager === currentUser?.name)
      .map((company) => company.id),
  );

  const referenceNow = new Date();
  const metrics = computeExecutiveMetrics(tickets, referenceNow);

  const recent = [...tickets]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const openTicket = (id: string, notificationId?: string) => {
    if (notificationId) markNotificationRead(notificationId);
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  const openTicketSection = (
    focus: "active" | "overdue" | "sla-risk" | "resolved",
  ) => {
    setSelectedTicketId(null);
    setTicketTableFocus(focus);
    navigate(`/tickets?scope=${focus}`);
  };

  const visibleNotifications = data.notifications.filter((notification) => {
    if (!notification.ticketId) return true;
    const ticket = tickets.find((item) => item.id === notification.ticketId);
    return Boolean(ticket);
  });
  const personaId = currentUser?.id ?? activeRole;
  const notificationsForPersona = visibleNotifications.map((notification) => ({
    ...notificationForViewer(notification, data, currentUser),
    read: notification.readBy
      ? notification.readBy.includes(personaId)
      : notification.read,
  }));

  return (
    <div className="dashboard-page mx-auto max-w-[1600px] space-y-3 p-3">
      <section className="dashboard-overview-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="dashboard-welcome flex flex-col gap-5 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined rounded-xl bg-indigo-500/30 p-3 text-3xl text-indigo-100">
              layers
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {getGreeting()}, {currentUser?.name?.split(" ")[0] || "Team"}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Support operations at a glance
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:pr-1">
            <div className="flex min-w-36 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
              <span className="material-symbols-outlined rounded-lg bg-indigo-500/30 p-2 text-indigo-100">
                confirmation_number
              </span>
              <div>
                <strong className="block text-xl leading-6">
                  {metrics.totalTickets}
                </strong>
                <span className="text-xs text-slate-300">Tickets</span>
              </div>
            </div>
            <div className="flex min-w-36 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
              <span className="material-symbols-outlined rounded-lg bg-rose-500/20 p-2 text-rose-200">
                warning
              </span>
              <div>
                <strong className="block text-xl leading-6">
                  {metrics.slaAtRiskOrBreachedCount}
                </strong>
                <span className="text-xs text-slate-300">High attention</span>
              </div>
            </div>
          </div>
        </div>

        <section
          aria-labelledby="dashboard-operations-heading"
          className="p-2"
        >
          <h2 id="dashboard-operations-heading" className="sr-only">
            Operational health
          </h2>
          <ExecutiveKpiRibbon
            totalActive={metrics.totalActive}
            overdueCount={metrics.overdueCount}
            slaAtRiskOrBreachedCount={metrics.slaAtRiskOrBreachedCount}
            formattedAvgResolutionTime={metrics.formattedAvgResolutionTime}
            onActiveClick={() => openTicketSection("active")}
            onOverdueClick={() => openTicketSection("overdue")}
            onSlaRiskClick={() => openTicketSection("sla-risk")}
            onResolvedClick={() => openTicketSection("resolved")}
          />
        </section>

      </section>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]">
        <div className="space-y-3">
          <HighAttentionTicketsTable
            tickets={tickets}
            onSelectTicket={openTicket}
            onExploreAll={() => {
              setSelectedTicketId(null);
              setTicketTableFocus("sla-risk");
              navigate("/tickets?scope=sla-risk");
            }}
          />
          <RecentTickets tickets={recent} onOpen={openTicket} />
        </div>
        <div className="space-y-3">
          <VolumeBreakdownCards
            tickets={tickets}
            teams={data.teams}
            departments={data.departments}
          />
          <NotificationsCard
            notifications={notificationsForPersona}
            onOpen={openTicket}
            onViewAll={() => navigate("/notifications")}
          />
        </div>
      </div>
    </div>
  );
};

