import React from "react";
import type { Notification, Ticket } from "../../types/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const relativeTime = (value: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export const RecentTickets: React.FC<{
  tickets: Ticket[];
  onOpen: (id: string) => void;
}> = ({ tickets, onOpen }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div className="border-b border-slate-100 p-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">update</span>
        <h2 className="text-base font-bold text-slate-900">Recently Updated Tickets</h2>
      </div>
    </div>
    <div className="divide-y divide-slate-100">
      {tickets.map((ticket) => (
        <button key={ticket.id} type="button" onClick={() => onOpen(ticket.id)} className="grid w-full grid-cols-1 gap-1.5 px-4 py-2.5 text-left transition hover:bg-slate-50 md:grid-cols-[72px_2fr_100px_1fr] md:items-center">
          <span className="font-mono text-xs font-bold text-slate-500">{ticket.code}</span>
          <span className="truncate text-xs font-semibold text-slate-900">{ticket.title}</span>
          <span className="text-[11px] text-slate-500">{displayDate(ticket.updatedAt)}</span>
          <span className="truncate text-xs text-slate-600">{ticket.assignedToName}</span>
        </button>
      ))}
      {!tickets.length && <p className="p-8 text-center text-xs text-slate-500">No tickets available.</p>}
    </div>
  </section>
);

export const NotificationsCard: React.FC<{
  notifications: Notification[];
  onOpen: (id: string) => void;
  onViewAll: () => void;
}> = ({ notifications, onOpen, onViewAll }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div className="flex items-center justify-between border-b border-slate-100 p-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">notifications</span>
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
          {notifications.filter((notification) => !notification.read).length} new
        </span>
        <button type="button" onClick={onViewAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View all</button>
      </div>
    </div>
    <div className="divide-y divide-slate-100">
      {notifications.slice(0, 5).map((notification) => (
        <button key={notification.id} type="button" onClick={() => notification.ticketId && onOpen(notification.ticketId)} disabled={!notification.ticketId} className="flex w-full gap-2.5 px-4 py-2.5 text-left transition hover:bg-slate-50 disabled:cursor-default">
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-indigo-500">{notification.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="truncate text-xs font-bold text-slate-800">{notification.title}</span>
              {!notification.read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-indigo-500" />}
            </span>
            <span className="mt-1 block text-xs text-slate-500 line-clamp-2">{notification.message}</span>
            <span className="mt-1 block text-[10px] font-medium text-slate-400">{relativeTime(notification.createdAt)}</span>
          </span>
        </button>
      ))}
      {!notifications.length && <p className="p-8 text-center text-xs text-slate-500">No notifications.</p>}
    </div>
  </section>
);
