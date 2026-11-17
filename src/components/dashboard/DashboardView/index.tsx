import React from "react";
import { useTicketStore } from "../../../store/barrel";
import {
  filterCompaniesByRole,
  filterEmployeesByRole,
  filterServicesByRole,
  filterTicketsByRole,
  ROLE_PERMISSIONS,
} from "../../../utils/barrel";
import { ExecutiveKpiRibbon } from "../ExecutiveKpiRibbon";
import { VolumeBreakdownCards } from "../VolumeBreakdownCards";
import { HighAttentionTicketsTable } from "../HighAttentionTicketsTable";
import { computeExecutiveMetrics } from "../dashboardMetrics";
import { RecentTickets, NotificationsCard } from "../activityCards";
import { useNavigate } from "react-router-dom";

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
  } =
    useTicketStore();

  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
    data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id),
  );

  const referenceNow = new Date();
  const metrics = computeExecutiveMetrics(tickets, referenceNow);

  const recent = [...tickets]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  const openTicketSection = (focus: "active" | "overdue" | "sla-risk" | "resolved") => {
    setSelectedTicketId(null);
    setTicketTableFocus(focus);
    navigate("/tickets");
  };

  const entityCards = [
    {
      label: "Tickets",
      value: metrics.totalTickets,
      icon: "confirmation_number",
      tab: "tickets",
      caption: "All requests, including resolved and closed",
      iconClass: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",
    },
    {
      label: "Companies",
      value: filterCompaniesByRole(data.companies, activeRole, currentUser?.name).length,
      icon: "business",
      tab: "companies",
      caption: "Client companies managed",
      iconClass: "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
    },
    {
      label: "Employees",
      value: filterEmployeesByRole(data.employees, activeRole).length,
      icon: "groups",
      tab: "employees",
      caption: "Team members in your role",
      iconClass: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
    },
    {
      label: "Services",
      value: filterServicesByRole(data.services, activeRole).length,
      icon: "design_services",
      tab: "services",
      caption: "Contracted service lines",
      iconClass: "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
    },
  ] as const;
  const allowedEntityCards = entityCards.filter(({ tab }) => ROLE_PERMISSIONS[activeRole].allowedTabs.includes(tab));
  const visibleNotifications = data.notifications.filter((notification) => {
    if (!notification.ticketId) return true;
    const ticket = tickets.find((item) => item.id === notification.ticketId);
    return Boolean(ticket);
  });

  return (
    <div className="max-w-8xl space-y-5 p-6">
      <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {getGreeting()}, {currentUser?.name || "Team"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Your service requests and the work that needs attention first.
        </p>
      </section>

      <section aria-labelledby="dashboard-operations-heading">
        <div className="mb-3">
          <h2 id="dashboard-operations-heading" className="text-sm font-bold text-slate-900">Operational health</h2>
          <p className="mt-0.5 text-xs text-slate-600">Role-scoped ticket totals, calculated from the current time.</p>
        </div>
        <ExecutiveKpiRibbon
          totalActive={metrics.totalActive}
          overdueCount={metrics.overdueCount}
          slaAtRiskOrBreachedCount={metrics.slaAtRiskOrBreachedCount}
          formattedAvgResolutionTime={metrics.formattedAvgResolutionTime}
          onActiveClick={() => openTicketSection("active")}
          onOverdueClick={() => openTicketSection("overdue")}
          onSlaRiskClick={() => document.getElementById("high-attention-incidents")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          onResolvedClick={() => openTicketSection("resolved")}
        />
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Resolution average uses all resolved and closed tickets. Resolved tickets use their last update; closed tickets use their close time, or last update when no close time is recorded.
        </p>
      </section>

      <HighAttentionTicketsTable
        tickets={tickets}
        onSelectTicket={openTicket}
        onExploreAll={() => navigate("/tickets")}
      />

      <section aria-labelledby="dashboard-workspace-heading" className="space-y-4">
        <div>
          <h2 id="dashboard-workspace-heading" className="text-sm font-bold text-slate-900">Browse workspace</h2>
          <p className="mt-0.5 text-xs text-slate-600">Directory totals and ticket breakdowns.</p>
        </div>
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {allowedEntityCards.map(({ label, value, icon, tab, caption, iconClass }) => (
            <button key={label} type="button" onClick={() => navigate(`/${tab}`)} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-sm">
              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-600">{label}</span>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
                <span aria-hidden="true" className={`material-symbols-outlined rounded-lg p-2 text-xl ${iconClass}`}>{icon}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <p className="text-xs text-slate-600">{caption}</p>
                <span aria-hidden="true" className="material-symbols-outlined text-base text-slate-400">arrow_forward</span>
              </div>
            </button>
          ))}
        </section>
        <VolumeBreakdownCards tickets={tickets} teams={data.teams} departments={data.departments} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentTickets tickets={recent} onOpen={openTicket} />
        <NotificationsCard notifications={visibleNotifications} onOpen={openTicket} onViewAll={() => navigate("/notifications")} />
      </div>
    </div>
  );
};

