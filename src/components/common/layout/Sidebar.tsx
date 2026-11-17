import React from "react";
import { useTicketStore } from "../../../store/barrel";
import { ROLE_PERMISSIONS, filterTicketsByRole } from "../../../utils/barrel";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
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

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 bg-slate-900 transition-all duration-300 select-none ${
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
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
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[20px]">
              grid_view
            </span>
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          {isTabAllowed("tickets") && (
            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "tickets"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined shrink-0 text-[20px]">
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
              onClick={() => setActiveTab("companies")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "companies"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined shrink-0 text-[20px]">
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
              onClick={() => setActiveTab("services")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "services"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined shrink-0 text-[20px]">
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
              onClick={() => setActiveTab("employees")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "employees"
                  ? "border border-indigo-200 bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined shrink-0 text-[20px]">
                  badge
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">Employees</span>
                )}
              </div>
            </button>
          )}

          {isTabAllowed("settings") && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-indigo-50 font-bold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">
                settings
              </span>
              {!isSidebarCollapsed && <span>Settings</span>}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={toggleSidebarCollapse}></div>
    </aside>
  );
};
