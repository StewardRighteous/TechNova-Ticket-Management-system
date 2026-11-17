import React from "react";
import { useTicketStore } from "../../../store/barrel";
import {
  filterCompaniesByRole,
  filterEmployeesByRole,
  filterServicesByRole,
  filterTicketsByRole,
} from "../../../utils/barrel";
import { ExecutiveKpiRibbon } from "../ExecutiveKpiRibbon";
import { VolumeBreakdownCards } from "../VolumeBreakdownCards";
import { HighAttentionTicketsTable } from "../HighAttentionTicketsTable";
import { computeExecutiveMetrics } from "../dashboardMetrics";
import { RecentTickets, NotificationsCard } from "../activityCards";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export const DashboardView: React.FC = () => {
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    setActiveTab,
    setTicketTableFocus,
  } =
    useTicketStore();

  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );

  const metrics = computeExecutiveMetrics(tickets);

  const recent = [...tickets]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab("tickets");
  };

  const openTicketSection = (focus: "active" | "overdue" | "sla-risk" | "resolved") => {
    setSelectedTicketId(null);
    setTicketTableFocus(focus);
    setActiveTab("tickets");
  };

  const entityCards = [
    {
      label: "Tickets",
      value: tickets.length,
      icon: "confirmation_number",
      tab: "tickets",
      caption: "Active service requests",
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

  return (
    <div className="max-w-8xl space-y-6 p-6">
      {/* Executive Welcome Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
         
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {getGreeting()}, {currentUser?.name || "Executive Leader"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Operational overview of active service contracts, SLA compliance, and cross-department workloads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 hover:shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                table_view
              </span>
              <span>All Tickets</span>
            </button>
          </div>
        </div>
      </section>

      {/* 1. Executive KPI Ribbon */}
      <ExecutiveKpiRibbon
        totalActive={metrics.totalActive}
        overdueCount={metrics.overdueCount}
        slaAtRiskOrBreachedCount={metrics.slaAtRiskOrBreachedCount}
        formattedAvgResolutionTime={metrics.formattedAvgResolutionTime}
        onActiveClick={() => openTicketSection("active")}
        onOverdueClick={() => openTicketSection("overdue")}
        onSlaRiskClick={() =>
          document
            .getElementById("high-attention-incidents")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        onResolvedClick={() => openTicketSection("resolved")}
      />

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {entityCards.map(({ label, value, icon, tab, caption, iconClass }) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div className="absolute -top-8 -right-8 size-24 rounded-full bg-slate-50 transition group-hover:scale-125" />
            <div className="relative flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                  {label}
                </span>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                  {value}
                </p>
              </div>
              <span className={`material-symbols-outlined rounded-xl p-2.5 text-[21px] transition group-hover:text-white ${iconClass}`}>
                {icon}
              </span>
            </div>
            <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500">{caption}</p>
              <span className="material-symbols-outlined text-[17px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                arrow_forward
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* 2. Interactive Volume Breakdown Cards */}
      <VolumeBreakdownCards
        tickets={tickets}
        teams={data.teams}
        departments={data.departments}
      />

      {/* 3. High-Attention Actionable Ticket Table */}
      <HighAttentionTicketsTable
        tickets={tickets}
        onSelectTicket={openTicket}
        onExploreAll={() => setActiveTab("tickets")}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentTickets tickets={recent} onOpen={openTicket} />
        <NotificationsCard notifications={data.notifications} onOpen={openTicket} />
      </div>
    </div>
  );
};

