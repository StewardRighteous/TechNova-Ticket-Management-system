import { NotificationPopover, CallToAction, Button, Heading, Icon } from "../../../ui/barrel";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTicketStore } from "../../../store/barrel";
import { ROLE_PERMISSIONS, canAccessService, canAccessTicket, filterTicketsByRole } from "../../../utils/rolePermissions";
import { notificationForViewer } from "../../../utils/notificationDisplay";
import { StaffAvatar } from "../../../ui/atoms/StaffAvatar";


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
  const createPage = location.pathname.match(/^\/(tickets|companies|services|employees)\/new$/);
  const createLabels: Record<string, string> = { tickets: "New ticket", companies: "New company", services: "New service", employees: "New employee" };
  const detailPage = createPage ? null : location.pathname.match(/^\/(tickets|companies|services|employees)\/([^/]+)$/);
  const detailId = detailPage ? decodeURIComponent(detailPage[2]) : "";
  const detailLabels: Record<string, string> = {
    tickets: data.tickets.find((item) => item.id === detailId && canAccessTicket(item, activeRole, currentUser?.id))?.code || "Ticket details",
    companies: data.companies.find((item) => item.id === detailId)?.name || "Company details",
    services: data.services.find((item) => item.id === detailId && currentUser && canAccessService(item, currentUser))?.name || "Service details",
    employees: (permissions.canManageTeam && data.employees.find((item) => item.id === detailId)?.name) || "Employee details",
  };
  const personaId = currentUser?.id ?? activeRole;
  const myQueueCount = filterTicketsByRole(data.tickets, activeRole, currentUser?.id)
    .filter((ticket) => ticket.assignedToId === currentUser?.id).length;
  const visibleNotifications = data.notifications
    .filter((notification) => {
      if (!notification.ticketId) return true;
      const ticket = data.tickets.find((item) => item.id === notification.ticketId);
      return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id));
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
      {(createPage || detailPage) && permissions.allowedTabs.includes((createPage || detailPage)![1]) ? <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
        <Button tone="plain" type="button" onClick={() => { const section = (createPage || detailPage)![1]; if (section === "tickets" && detailPage) setSelectedTicketId(null); const returnTo = section === "tickets" && detailPage ? (location.state as { returnTo?: string } | null)?.returnTo : undefined; navigate(returnTo || `/${section}`, { state: { ...((location.state as object | null) || {}), ticketScrollY: window.history.state?.usr?.ticketScrollY } }); }} className="capitalize text-indigo-600 hover:text-indigo-800">{(createPage || detailPage)![1]}</Button>
        <span className="text-slate-300">›</span>
        <Heading as="h1" variant="plain" className="truncate font-extrabold tracking-tight text-slate-900">{createPage ? createLabels[createPage[1]] : detailLabels[detailPage![1]]}</Heading>
      </nav> : permissions.canManageTeam && (location.pathname === "/notifications" || location.pathname === "/latest-updates") ? <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
        <Button tone="plain" type="button" onClick={() => navigate("/dashboard")} className="text-indigo-600 hover:text-indigo-800">Dashboard</Button>
        <span aria-hidden="true" className="text-slate-300">›</span>
        <Heading as="h1" variant="plain" className="font-extrabold tracking-tight text-slate-900">{location.pathname === "/notifications" ? "Notifications" : "Latest Updates"}</Heading>
      </nav> : <Heading as="h1" variant="pageHeader" className="min-w-0 truncate capitalize">{location.pathname === "/tickets" ? (permissions.canManageTeam ? "All Tickets" : "My Tickets") : activeTab}</Heading>}
      <nav aria-label="Header shortcuts" className="ml-auto mr-2 flex shrink-0 items-center justify-end gap-2 sm:mr-4">
        <Button tone="plain" type="button" onClick={() => navigate("/tickets?view=mine")} aria-label="My Queue" title="My Queue" className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Icon aria-hidden="true" className="text-lg">checklist</Icon>
          {myQueueCount > 0 && <span className="rounded-full bg-indigo-950 px-1.5 text-[11px] font-bold text-white">{myQueueCount}</span>}
        </Button>
        <Button tone="plain" type="button" onClick={() => navigate("/services")} aria-label="Resources" title="Resources" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Icon aria-hidden="true" className="text-lg">menu_book</Icon>
        </Button>
        {permissions.canManageTeam && <Button tone="plain" type="button" onClick={() => navigate("/latest-updates")} aria-label="Recent activity" title="Recent activity" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Icon aria-hidden="true" className="text-lg">history</Icon>
        </Button>}
        {permissions.allowedTabs.includes("notifications") && <div className="relative" ref={notificationPopoverRef}>
          <Button tone="plain" type="button" onClick={() => setIsNotificationPopoverOpen((open) => !open)} aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ""}`} title="Notifications" aria-expanded={isNotificationPopoverOpen} aria-haspopup="dialog" className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <Icon aria-hidden="true" className="text-lg">notifications</Icon>
            {unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-indigo-950 px-1 text-center text-[11px] font-bold text-white">{unreadNotificationCount}</span>}
          </Button>
          {isNotificationPopoverOpen && <NotificationPopover
            notifications={recentNotifications}
            unreadCount={unreadNotificationCount}
            onOpen={(notification) => openNotification(notification.id, notification.ticketId)}
            onViewAll={() => { setIsNotificationPopoverOpen(false); navigate("/notifications"); }}
          />}
        </div>}
      </nav>
      <div className="flex shrink-0 items-center gap-4">
    

        {activeTab === "tickets" && permissions.canCreateTicket && <CallToAction
          aria-label="New ticket"
          icon="add"
          size="small"
          onClick={() => navigate("/tickets/new")}
        >New Ticket</CallToAction>}

        <div className="relative" ref={profileMenuRef}>
            <Button tone="plain"
              aria-label="User profile"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-all hover:bg-slate-50"
            title="User profile"
            aria-expanded={isProfileDropdownOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
              <StaffAvatar src={activeEmployee.avatar} alt={`${activeEmployee.name} profile`} sizeClassName="h-8 w-8" />
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
            <Icon aria-hidden="true" className="text-[16px] text-slate-500">
              expand_more
            </Icon>
          </Button>

          {isProfileDropdownOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 max-h-[75vh] w-full min-w-0 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-xl duration-150">
              <div className="border-b border-slate-100 px-2 py-1.5">
                <span className="block truncate text-xs font-bold text-slate-900" title={activeEmployee.name}>
                  {activeEmployee.name}
                </span>
                <span className="block truncate font-mono text-[11px] text-slate-500" title={activeEmployee.email}>
                  {activeEmployee.email}
                </span>
              </div>

              <div className="px-1 pt-1.5">
                {permissions.allowedTabs.includes("profile") && <Button tone="plain" type="button" onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate("/profile");
                }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <Icon aria-hidden="true" className="text-[16px]">person</Icon>
                  <span>Profile</span>
                </Button>}
                <Button tone="plain"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Icon aria-hidden="true" className="text-[16px]">
                    logout
                  </Icon>
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
