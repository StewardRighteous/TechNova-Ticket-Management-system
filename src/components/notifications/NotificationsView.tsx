import { NotificationList, Button, Heading, Icon, Input } from "../../ui/barrel";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Notification } from "../../types/barrel";
import { canAccessTicket } from "../../utils/rolePermissions";
import { notificationForViewer } from "../../utils/notificationDisplay";

type Filter = "all" | "unread" | "tickets";

export const NotificationsView: React.FC = () => {
  const { data, activeRole, currentUser, setSelectedTicketId, markNotificationRead } = useTicketStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const personaId = currentUser?.id ?? activeRole;
  const notifications = useMemo(() => data.notifications.filter((notification) => {
    if (!notification.ticketId) return true;
    const ticket = data.tickets.find((item) => item.id === notification.ticketId);
    return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id));
  }).map((notification) => ({
    ...notificationForViewer(notification, data, currentUser),
    read: notification.readBy ? notification.readBy.includes(personaId) : notification.read,
  })).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [data, activeRole, currentUser, personaId]);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visible = notifications.filter((item) => {
    if ((filter === "unread" || unreadOnly) && item.read) return false;
    if (filter === "tickets" && !item.ticketId) return false;
    return `${item.title} ${item.message} ${item.ticketId ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });
  const today = visible.filter((item) => Date.now() - Date.parse(item.createdAt) < 24 * 60 * 60 * 1000);
  const earlier = visible.filter((item) => Date.now() - Date.parse(item.createdAt) >= 24 * 60 * 60 * 1000);
  const openTicket = (notification: Notification) => {
    if (!notification.ticketId) return;
    markNotificationRead(notification.id);
    setSelectedTicketId(notification.ticketId);
    navigate(`/tickets/${encodeURIComponent(notification.ticketId)}`);
  };
  const getTicketCode = (id: string) => data.tickets.find((ticket) => ticket.id === id)?.code;
  const getAction = (notification: Notification) => notification.ticketId ? () => openTicket(notification) : undefined;
  const markAllRead = () => notifications.filter((item) => !item.read).forEach((item) => markNotificationRead(item.id));
  return <div className="min-h-full bg-white px-4 py-5 sm:px-7 sm:py-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Notification filters">
        {([ ["all", `All (${notifications.length})`], ["unread", `Unread (${unreadCount})`], ["tickets", `Tickets (${notifications.filter((item) => item.ticketId).length})`] ] as [Filter, string][]).map(([value, label]) => <Button tone="plain" key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-5 py-2 text-sm font-bold transition ${filter === value ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"}`}>{label}</Button>)}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {searchOpen && <Input appearance="plain" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" aria-label="Search notifications" className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 sm:w-56" />}
        <Button tone="plain" type="button" aria-label={searchOpen ? "Close search" : "Search"} onClick={() => { setSearchOpen((open) => !open); if (searchOpen) setSearch(""); }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"><Icon>{searchOpen ? "close" : "search"}</Icon></Button>
        <Button tone="plain" type="button" aria-label="Toggle unread only" aria-pressed={unreadOnly} onClick={() => setUnreadOnly((value) => !value)} className={`flex h-10 w-10 items-center justify-center rounded-lg border ${unreadOnly ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-300 text-slate-700"}`}><Icon>filter_alt</Icon></Button>
        <Button tone="plain" type="button" onClick={markAllRead} disabled={!unreadCount} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex"><Icon className="text-lg">check</Icon>Mark all as read</Button>
      </div>
    </div>
    <div className="space-y-8 py-5">
      {today.length > 0 && <section aria-labelledby="today-heading"><Heading as="h3" variant="plain" id="today-heading" className="mb-4 text-xl font-bold text-slate-900">Today</Heading><NotificationList notifications={today} getTicketCode={getTicketCode} getAction={getAction} /></section>}
      {earlier.length > 0 && <section aria-labelledby="earlier-heading"><Heading as="h3" variant="plain" id="earlier-heading" className="mb-4 text-xl font-bold text-slate-900">Earlier</Heading><NotificationList notifications={earlier} getTicketCode={getTicketCode} getAction={getAction} /></section>}
      {!visible.length && <p className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">No notifications match this view.</p>}
    </div>
  </div>;
};
