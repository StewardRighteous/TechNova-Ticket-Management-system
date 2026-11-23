import React from "react";
import { useTicketStore } from "../../../store/barrel";
import { ROLE_PERMISSIONS, filterTicketsByRole } from "../../../utils/barrel";
import { useLocation, useNavigate } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data,
    activeRole,
    currentUser,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useTicketStore();

  const permissions = ROLE_PERMISSIONS[activeRole];
  const roleTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );

  const isTabAllowed = (tab: string) => permissions.allowedTabs.includes(tab);
  const currentTab = location.pathname.split("/")[1] || "dashboard";
  const goTo = (tab: string) => navigate(`/${tab}`);
  const accountTab = isTabAllowed("profile") ? "profile" : "settings";
  const accountTabLabel = accountTab === "profile" ? "Profile" : "Settings";

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-[#302a49] bg-[#1f2041] transition-all duration-300 select-none ${
        isSidebarCollapsed ? "w-17" : "w-64"
      }`}
    >
      <div className="flex scrollbar-none flex-col overflow-y-auto">
        <div
          className="flex h-16 items-center justify-between border-b border-slate-100 px-4"
          onClick={toggleSidebarCollapse}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <button>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#19647e] text-white shadow-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  confirmation_number
                </span>
              </div>
            </button>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="truncate text-[15px] font-bold tracking-tight text-white">
                  TechNova
                </span>
                <span className="truncate text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Solutions Pvt. Ltd
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 px-3 py-3">
          {isTabAllowed("dashboard") && <button
            onClick={() => goTo("dashboard")}
            aria-current={currentTab === "dashboard" ? "page" : undefined}
            aria-label={isSidebarCollapsed ? "Dashboard" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
              currentTab === "dashboard"
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
              grid_view
            </span>
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>}

          {isTabAllowed("tickets") && (
            <button
              onClick={() => goTo("tickets")}
              aria-current={currentTab === "tickets" ? "page" : undefined}
              aria-label={isSidebarCollapsed ? "Tickets" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                currentTab === "tickets"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                  confirmation_number
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">Tickets</span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-800">
                  {roleTickets.length}
                </span>
              )}
            </button>
          )}

          {isTabAllowed("companies") && (
            <button
              onClick={() => goTo("companies")}
              aria-current={currentTab === "companies" ? "page" : undefined}
              aria-label={isSidebarCollapsed ? "Companies" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                currentTab === "companies"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                  domain
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">Companies</span>
                )}
              </div>
            </button>
          )}

          {isTabAllowed("services") && (
            <button
              onClick={() => goTo("services")}
              aria-current={currentTab === "services" ? "page" : undefined}
              aria-label={isSidebarCollapsed ? "Services" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                currentTab === "services"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                  layers
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">Services</span>
                )}
              </div>
            </button>
          )}

          {isTabAllowed("employees") && (
            <button
              onClick={() => goTo("employees")}
              aria-current={currentTab === "employees" ? "page" : undefined}
              aria-label={isSidebarCollapsed ? "Employees" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                currentTab === "employees"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                  badge
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">Employees</span>
                )}
              </div>
            </button>
          )}

          {isTabAllowed(accountTab) && (
            <button
              onClick={() => goTo(accountTab)}
              aria-current={currentTab === accountTab ? "page" : undefined}
              aria-label={isSidebarCollapsed ? accountTabLabel : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                currentTab === accountTab
                  ? "bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                {accountTab === "profile" ? "person" : "settings"}
              </span>
              {!isSidebarCollapsed && <span>{accountTabLabel}</span>}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={toggleSidebarCollapse}></div>
    </aside>
  );
};
