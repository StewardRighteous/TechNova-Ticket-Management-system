import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTicketStore } from "../../../../store/barrel";
import { ROLE_PERMISSIONS, canAccessCompany, canAccessEmployee, canAccessService, canAccessTicket } from "../../../../utils/rolePermissions";
import { notificationForViewer } from "../../../../utils/notificationDisplay";
import { filterTicketsByRole } from "../../../../utils/rolePermissions";


export const Header: React.FC = () => {
  const {
    activeRole,
    activeTab,
    currentUser,
    data,
    isSidebarCollapsed,
    logout,
    setSelectedTicketId,
  } = useTicketStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);
  const notificationPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileDropdownOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    if (!isNotificationPopoverOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !notificationPopoverRef.current?.contains(event.target)) {
        setIsNotificationPopoverOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNotificationPopoverOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isNotificationPopoverOpen]);
  const currentRoleInfo =
    data.roles.find((r) => r.id === activeRole) || data.roles[0];
  const activeEmployee = currentUser || data.employees[0];
  const permissions = ROLE_PERMISSIONS[activeRole];
  const accountCompanyIds = data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id);
  const createPage = location.pathname.match(/^\/(tickets|companies|services|employees)\/new$/);
  const createLabels: Record<string, string> = { tickets: "New ticket", companies: "New company", services: "New service", employees: "New employee" };
  const detailPage = createPage ? null : location.pathname.match(/^\/(tickets|companies|services|employees)\/([^/]+)$/);
  const detailId = detailPage ? decodeURIComponent(detailPage[2]) : "";
  const detailLabels: Record<string, string> = {
    tickets: (() => { const item = data.tickets.find((entry) => entry.id === detailId); return item && canAccessTicket(item, activeRole, currentUser?.id, accountCompanyIds) ? item.code : "Ticket details"; })(),
    companies: (() => { const item = data.companies.find((entry) => entry.id === detailId); return item && canAccessCompany(item, activeRole, currentUser?.name) ? item.name : "Company details"; })(),
    services: (() => { const item = data.services.find((entry) => entry.id === detailId); return item && canAccessService(item, activeRole) ? item.name : "Service details"; })(),
    employees: (() => { const item = data.employees.find((entry) => entry.id === detailId); return item && canAccessEmployee(item, activeRole) ? item.name : "Employee details"; })(),
  };
  const personaId = currentUser?.id ?? activeRole;
  const myQueueCount = filterTicketsByRole(data.tickets, activeRole, currentUser?.id, accountCompanyIds)
    .filter((ticket) => ticket.assignedToId === currentUser?.id).length;
  const visibleNotifications = data.notifications
    .filter((notification) => {
      if (!notification.ticketId) return true;
      const ticket = data.tickets.find((item) => item.id === notification.ticketId);
      return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id, accountCompanyIds));
    })
    .map((notification) => ({
      ...notificationForViewer(notification, data, currentUser),
      read: notification.readBy ? notification.readBy.includes(personaId) : notification.read,
    }));
  const unreadNotificationCount = visibleNotifications.filter((notification) => !notification.read).length;
  const recentNotifications = [...visibleNotifications]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);
  const openNotification = (notificationId: string, ticketId?: string) => {
    useTicketStore.getState().markNotificationRead(notificationId);
    setIsNotificationPopoverOpen(false);
    if (ticketId) {
      setSelectedTicketId(ticketId);
      navigate(`/tickets/${encodeURIComponent(ticketId)}`);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur transition-all duration-300 sm:px-6 ${
        isSidebarCollapsed ? "left-15" : "left-64"
      }`}
    >
      {createPage || detailPage ? <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
        <button type="button" onClick={() => { const section = (createPage || detailPage)![1]; if (section === "tickets" && detailPage) setSelectedTicketId(null); const returnTo = section === "tickets" && detailPage ? (location.state as { returnTo?: string } | null)?.returnTo : undefined; navigate(returnTo || `/${section}`, { state: { ...((location.state as object | null) || {}), ticketScrollY: window.history.state?.usr?.ticketScrollY } }); }} className="capitalize text-indigo-600 hover:text-indigo-800">{(createPage || detailPage)![1]}</button>
        <span className="text-slate-300">›</span>
        <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">{createPage ? createLabels[createPage[1]] : detailLabels[detailPage![1]]}</h1>
      </nav> : location.pathname === "/notifications" || location.pathname === "/latest-updates" ? <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
        <button type="button" onClick={() => navigate("/dashboard")} className="text-indigo-600 hover:text-indigo-800">Dashboard</button>
        <span aria-hidden="true" className="text-slate-300">›</span>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{location.pathname === "/notifications" ? "Notifications" : "Latest Updates"}</h1>
      </nav> : <h1 className="text-xl font-extrabold tracking-tight capitalize sm:text-2xl">{location.pathname === "/tickets" ? "All Tickets" : activeTab}</h1>}
      <nav aria-label="Header shortcuts" className="ml-auto mr-2 flex shrink-0 items-center justify-end gap-2 sm:mr-4">
        <button type="button" onClick={() => navigate("/tickets?view=mine")} aria-label="My Queue" title="My Queue" className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span aria-hidden="true" className="material-symbols-outlined text-lg">checklist</span>
          {myQueueCount > 0 && <span className="rounded-full bg-indigo-950 px-1.5 text-[11px] font-bold text-white">{myQueueCount}</span>}
        </button>
        <button type="button" onClick={() => navigate("/services")} aria-label="Resources" title="Resources" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span aria-hidden="true" className="material-symbols-outlined text-lg">menu_book</span>
        </button>
        <button type="button" onClick={() => navigate("/latest-updates")} aria-label="Recent activity" title="Recent activity" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span aria-hidden="true" className="material-symbols-outlined text-lg">history</span>
        </button>
        <div className="relative" ref={notificationPopoverRef}>
          <button type="button" onClick={() => setIsNotificationPopoverOpen((open) => !open)} aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ""}`} title="Notifications" aria-expanded={isNotificationPopoverOpen} aria-haspopup="dialog" className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <span aria-hidden="true" className="material-symbols-outlined text-lg">notifications</span>
            {unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-indigo-950 px-1 text-center text-[11px] font-bold text-white">{unreadNotificationCount}</span>}
          </button>
          {isNotificationPopoverOpen && <div role="dialog" aria-label="Recent notifications" className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                <p className="mt-0.5 text-xs text-slate-500">{unreadNotificationCount ? `${unreadNotificationCount} unread` : "You're all caught up"}</p>
              </div>
              <button type="button" onClick={() => { setIsNotificationPopoverOpen(false); navigate("/notifications"); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {recentNotifications.map((notification) => <button key={notification.id} type="button" onClick={() => openNotification(notification.id, notification.ticketId)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 rounded-lg bg-indigo-50 p-1.5 text-[17px] text-indigo-600">{notification.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-slate-800">{notification.title}</span>
                    {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-label="Unread" />}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-4 text-slate-600">{notification.message}</span>
                </span>
              </button>)}
              {!recentNotifications.length && <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p>}
            </div>
            <button type="button" onClick={() => { setIsNotificationPopoverOpen(false); navigate("/notifications"); }} className="w-full border-t border-slate-100 px-4 py-3 text-center text-xs font-bold text-indigo-600 transition hover:bg-indigo-50">View all notifications</button>
          </div>}
        </div>
      </nav>
      <div className="flex shrink-0 items-center gap-4">
    

        {activeTab === "tickets" && permissions.canCreateTicket && <button
          aria-label="New ticket"
          onClick={() => navigate("/tickets/new")}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[17px]">add</span>
          <span>New Ticket</span>
        </button>}

        <div className="relative" ref={profileMenuRef}>
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
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 max-h-[75vh] w-full min-w-0 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-xl duration-150">
              <div className="border-b border-slate-100 px-2 py-1.5">
                <span className="block text-xs font-bold text-slate-900">
                  {activeEmployee.name}
                </span>
                <span className="block font-mono text-[11px] text-slate-500">
                  {activeEmployee.email}
                </span>
              </div>

              <div className="px-1 pt-1.5">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
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
