import { Heading } from "../../../ui/barrel";
import React, { useEffect } from "react";
import { useTicketStore } from "../../../store/barrel";
import { filterTicketsByRole } from "../../../utils/barrel";
import { ExecutiveKpiRibbon } from "../ExecutiveKpiRibbon";
import { VolumeBreakdownCards } from "../VolumeBreakdownCards";
import { HighAttentionTicketsTable } from "../HighAttentionTicketsTable";
import { computeExecutiveMetrics } from "../dashboardMetrics";
import { RecentTickets, NotificationsCard } from "../activityCards";
import { useLocation, useNavigate } from "react-router-dom";
import { notificationForViewer } from "../../../utils/notificationDisplay";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

const getDashboardMessage = () =>
  `${new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())} · Review open tickets, prioritize urgent issues, and keep your team moving.`;

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    setTicketTableFocus,
    markNotificationRead,
  } = useTicketStore();

  useEffect(() => {
    if (location.hash !== "#recent-tickets") return;
    document.getElementById("recent-tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
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
        <div className="dashboard-welcome flex flex-col gap-2 px-4 py-2 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center">
            <div>
              <Heading as="h1" variant="plain" className="text-[20px] font-bold tracking-tight">
                {getGreeting()}, {currentUser?.name?.split(" ")[0] || "Team"}
              </Heading>
              <p className="mt-0.5 text-xs text-white/75 sm:text-sm">
                {getDashboardMessage()}
              </p>
            </div>
          </div>
        </div>

        <section
          aria-labelledby="dashboard-operations-heading"
          className="bg-slate-50/80 p-2 sm:p-2.5"
        >
          <Heading variant="plain" id="dashboard-operations-heading" className="sr-only">
            Operational health
          </Heading>
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
            employees={data.employees}
            onSelectTicket={openTicket}
            onSelectCompany={(companyId) => navigate(`/companies/${encodeURIComponent(companyId)}`)}
            onSelectAssignee={(employeeId) => navigate(`/employees/${encodeURIComponent(employeeId)}`)}
            onExploreAll={() => {
              setSelectedTicketId(null);
              setTicketTableFocus("sla-risk");
              navigate("/tickets?scope=sla-risk");
            }}
          />
          <RecentTickets
            tickets={recent}
            onOpen={openTicket}
            onViewAll={() => navigate("/latest-updates")}
            onSelectCompany={(companyId) => navigate(`/companies/${encodeURIComponent(companyId)}`)}
            onSelectAssignee={(employeeId) => navigate(`/employees/${encodeURIComponent(employeeId)}`)}
          />
        </div>
        <div className="space-y-3">
          <VolumeBreakdownCards
            tickets={tickets}
            teams={data.teams}
            departments={data.departments}
            referenceNow={referenceNow}
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

