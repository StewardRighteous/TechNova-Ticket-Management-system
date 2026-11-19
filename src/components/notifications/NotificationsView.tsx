import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Notification } from "../../types/barrel";
import { canAccessTicket } from "../../utils/rolePermissions";
import { notificationForViewer } from "../../utils/notificationDisplay";

type Filter = "all" | "unread" | "tickets";

const relativeTime = (value: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const kindFor = (notification: Notification) => {
  const value = `${notification.title} ${notification.message} ${notification.icon}`.toLowerCase();
  if (value.includes("sla") || value.includes("deadline") || value.includes("clock")) return "sla";
  if (value.includes("escalat") || value.includes("urgent") || value.includes("warning")) return "urgent";
  if (value.includes("assign") || value.includes("person")) return "assignment";
  return "update";
};

const styles = {
  urgent: { icon: "priority_high", color: "text-amber-700", badge: "bg-amber-100", card: "border-amber-100 bg-amber-50/80" },
  assignment: { icon: "person", color: "text-teal-700", badge: "bg-teal-100", card: "border-teal-100 bg-teal-50/80" },
  sla: { icon: "schedule", color: "text-violet-800", badge: "bg-violet-100", card: "border-slate-200 bg-white" },
  update: { icon: "notifications", color: "text-cyan-700", badge: "bg-cyan-100", card: "border-slate-200 bg-white" },
};

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
    const companyIds = data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id);
    return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id, companyIds));
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
  const markAllRead = () => notifications.filter((item) => !item.read).forEach((item) => markNotificationRead(item.id));
  const renderRow = (notification: Notification) => {
    const kind = kindFor(notification);
    const style = styles[kind];
    const ticket = data.tickets.find((item) => item.id === notification.ticketId);
    return <article key={notification.id} className={`flex min-w-0 items-center gap-3 rounded-xl border px-4 py-4 sm:gap-5 sm:px-6 ${notification.read ? "border-slate-200 bg-white" : style.card}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.badge} ${style.color}`} aria-hidden="true"><span className="material-symbols-outlined block text-2xl leading-none">{style.icon}</span></span>
      <span className="hidden h-12 border-l border-slate-300/70 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{notification.title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          {ticket && <><button type="button" onClick={() => openTicket(notification)} className="font-bold text-teal-700 underline decoration-teal-500 underline-offset-2 hover:text-teal-900">{ticket.code}</button>{" "}</>}
          {notification.message}
        </p>
      </div>
      <span className="hidden shrink-0 text-sm text-slate-500 sm:block">{relativeTime(notification.createdAt)}</span>
      {!notification.read && <span aria-label="Unread" className="h-3 w-3 shrink-0 rounded-full bg-teal-500" />}
      {notification.ticketId && <button type="button" onClick={() => openTicket(notification)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-teal-700/20 bg-white/70 px-3 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">View ticket <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span></button>}
    </article>;
  };

  return <div className="min-h-full bg-white px-4 py-5 sm:px-7 sm:py-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Notification filters">
        {([ ["all", `All (${notifications.length})`], ["unread", `Unread (${unreadCount})`], ["tickets", `Tickets (${notifications.filter((item) => item.ticketId).length})`] ] as [Filter, string][]).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-5 py-2 text-sm font-bold transition ${filter === value ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"}`}>{label}</button>)}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {searchOpen && <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" aria-label="Search notifications" className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 sm:w-56" />}
        <button type="button" aria-label={searchOpen ? "Close search" : "Search"} onClick={() => { setSearchOpen((open) => !open); if (searchOpen) setSearch(""); }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"><span className="material-symbols-outlined">{searchOpen ? "close" : "search"}</span></button>
        <button type="button" aria-label="Toggle unread only" aria-pressed={unreadOnly} onClick={() => setUnreadOnly((value) => !value)} className={`flex h-10 w-10 items-center justify-center rounded-lg border ${unreadOnly ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-300 text-slate-700"}`}><span className="material-symbols-outlined">filter_alt</span></button>
        <button type="button" onClick={markAllRead} disabled={!unreadCount} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex"><span className="material-symbols-outlined text-lg">check</span>Mark all as read</button>
      </div>
    </div>
    <div className="space-y-8 py-5">
      {today.length > 0 && <section aria-labelledby="today-heading"><h3 id="today-heading" className="mb-4 text-xl font-bold text-slate-900">Today</h3><div className="space-y-3">{today.map(renderRow)}</div></section>}
      {earlier.length > 0 && <section aria-labelledby="earlier-heading"><h3 id="earlier-heading" className="mb-4 text-xl font-bold text-slate-900">Earlier</h3><div className="space-y-3">{earlier.map(renderRow)}</div></section>}
      {!visible.length && <p className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">No notifications match this view.</p>}
    </div>
  </div>;
};
