import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTicketStore } from "../../../../store/barrel";
import { ROLE_PERMISSIONS, canAccessCompany, canAccessEmployee, canAccessService, canAccessTicket } from "../../../../utils/rolePermissions";
import { DemoPersonaGrid } from "../../../auth/DemoPersonaGrid";
import { notificationForViewer } from "../../../../utils/notificationDisplay";


export const Header: React.FC = () => {
  const {
    activeRole,
    activeTab,
    currentUser,
    data,
    isSidebarCollapsed,
    logout,
    loginAsEmployee,
    setSelectedTicketId,
    markNotificationRead,
  } = useTicketStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isPersonaSwitcherOpen, setIsPersonaSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const currentRoleInfo =
    data.roles.find((r) => r.id === activeRole) || data.roles[0];
  const activeEmployee = currentUser || data.employees[0];
  const permissions = ROLE_PERMISSIONS[activeRole];
  const accountCompanyIds = data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id);
  const visibleNotifications = data.notifications.filter((notification) => {
    if (!notification.ticketId) return true;
    const ticket = data.tickets.find((item) => item.id === notification.ticketId);
    return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id, accountCompanyIds));
  });
  const personaId = currentUser?.id ?? activeRole;
  const personaNotifications = visibleNotifications.map((notification) => ({ ...notificationForViewer(notification, data, currentUser), read: notification.readBy ? notification.readBy.includes(personaId) : notification.read }));
  const createPage = location.pathname.match(/^\/(tickets|companies|services|employees)\/new$/);
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const createLabels: Record<string, string> = { tickets: "New ticket", companies: "New company", services: "New service", employees: "New employee" };
  const detailPage = createPage ? null : location.pathname.match(/^\/(tickets|companies|services|employees)\/([^/]+)$/);
  const detailId = detailPage ? decodeURIComponent(detailPage[2]) : "";
  const detailLabels: Record<string, string> = {
    tickets: (() => { const item = data.tickets.find((entry) => entry.id === detailId); return item && canAccessTicket(item, activeRole, currentUser?.id, accountCompanyIds) ? item.code : "Ticket details"; })(),
    companies: (() => { const item = data.companies.find((entry) => entry.id === detailId); return item && canAccessCompany(item, activeRole, currentUser?.name) ? item.name : "Company details"; })(),
    services: (() => { const item = data.services.find((entry) => entry.id === detailId); return item && canAccessService(item, activeRole) ? item.name : "Service details"; })(),
    employees: (() => { const item = data.employees.find((entry) => entry.id === detailId); return item && canAccessEmployee(item, activeRole) ? item.name : "Employee details"; })(),
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all duration-300 ${
        isSidebarCollapsed ? "left-15" : "left-64"
      }`}
    >
      {createPage || detailPage ? <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <button type="button" onClick={() => { const section = (createPage || detailPage)![1]; if (section === "tickets" && detailPage) setSelectedTicketId(null); const returnTo = section === "tickets" && detailPage ? (location.state as { returnTo?: string } | null)?.returnTo : undefined; navigate(returnTo || `/${section}`, { state: { ...((location.state as object | null) || {}), ticketScrollY: window.history.state?.usr?.ticketScrollY } }); }} className="capitalize text-indigo-600 hover:text-indigo-800">{(createPage || detailPage)![1]}</button>
        <span className="text-slate-300">›</span>
        <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{createPage ? createLabels[createPage[1]] : detailLabels[detailPage![1]]}</h1>
      </nav> : <h1 className="text-xl font-extrabold tracking-tight capitalize sm:text-2xl">{location.pathname === "/notifications" ? "Notifications" : location.pathname === "/tickets" ? "All Tickets" : activeTab}</h1>}
      <div className="flex items-center gap-4">
    

        {isDashboard && permissions.canCreateTicket && <button
          aria-label="Add ticket"
          onClick={() => navigate("/tickets/new")}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[17px]">add</span>
          <span>Add Ticket</span>
        </button>}

        {activeTab === "tickets" && permissions.canCreateTicket && <button
          aria-label="New ticket"
          onClick={() => navigate("/tickets/new")}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[17px]">add</span>
          <span>New Ticket</span>
        </button>}

        <div className="h-6 w-px bg-slate-200"></div>

        {(
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notifications"
              className="relative flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              title="Notifications"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">notifications</span>
              {personaNotifications.some(
                (notification) => !notification.read,
              ) && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-indigo-500 ring-2 ring-white" />
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                  <span className="text-sm font-bold text-slate-900">
                    Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {personaNotifications.filter((notification) => !notification.read).length} unread
                  </span>
                </div>
                {personaNotifications.slice(0, 5).map((notification) => (
                  <button type="button" onClick={() => { if (notification.ticketId) { markNotificationRead(notification.id); setSelectedTicketId(notification.ticketId); navigate(`/tickets/${encodeURIComponent(notification.ticketId)}`); setIsNotificationsOpen(false); } }} disabled={!notification.ticketId} aria-label={`${notification.read ? "Read" : "Unread"}: ${notification.title}`}
                    key={notification.id}
                    className="flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 disabled:cursor-default"
                  >
                    <span className="material-symbols-outlined text-[18px] text-indigo-500">
                      {notification.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {notification.message}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setIsNotificationsOpen(false); navigate("/notifications"); }}
                  className="mt-1 w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}

        <div className="relative">
            <button
              aria-label="User profile"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-all hover:bg-slate-50"
            title="User profile and demo persona"
            aria-expanded={isProfileDropdownOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-[17px]">
                {activeEmployee.avatar}
              </span>
            </div>
            <div className="hidden flex-col md:flex">
              <div className="flex items-center gap-1.5">
                <span className="text-xs leading-none font-bold text-slate-800">
                  {activeEmployee.name}
                </span>
                <span className="py-0.2 rounded bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-800">
                  Online
                </span>
              </div>
              <span className="text-[11px] font-medium text-indigo-600">
                {currentRoleInfo.name}
              </span>
            </div>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-slate-500">
              expand_more
            </span>
          </button>

          {isProfileDropdownOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 max-h-[75vh] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-100 bg-white p-3 shadow-xl duration-150">
              <div className="border-b border-slate-100 px-3 py-2">
                <span className="block text-xs font-bold text-slate-900">
                  {activeEmployee.name}
                </span>
                <span className="block font-mono text-[11px] text-slate-500">
                  {activeEmployee.email}
                </span>
              </div>

              <button
                type="button"
                aria-expanded={isPersonaSwitcherOpen}
                onClick={() => setIsPersonaSwitcherOpen((open) => !open)}
                className="mt-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Switch demo persona</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base">{isPersonaSwitcherOpen ? "expand_less" : "expand_more"}</span>
              </button>
              {isPersonaSwitcherOpen && (
                <DemoPersonaGrid
                  employees={data.employees}
                  roles={data.roles}
                  selectedEmployeeId={activeEmployee.id}
                  heading="Choose a persona"
                  onSelectPersona={(employeeId) => {
                    loginAsEmployee(employeeId);
                    setIsPersonaSwitcherOpen(false);
                    setIsProfileDropdownOpen(false);
                  }}
                />
              )}

              <div className="border-slate-100 px-2 pt-2">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                    logout
                  </span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
