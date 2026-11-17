import React from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Notification } from "../../types/barrel";
import { canAccessTicket } from "../../utils/rolePermissions";

const relativeTime = (value: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const NotificationRow: React.FC<{ notification: Notification; onOpenTicket: (id: string) => void }> = ({ notification, onOpenTicket }) => (
  <button
    type="button"
    onClick={() => notification.ticketId && onOpenTicket(notification.ticketId)}
    disabled={!notification.ticketId}
    className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50 disabled:cursor-default"
  >
    <span className="material-symbols-outlined mt-0.5 rounded-xl bg-indigo-50 p-2 text-[20px] text-indigo-600">{notification.icon}</span>
    <span className="min-w-0 flex-1">
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-bold text-slate-900">{notification.title}</span>
        {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" />}
      </span>
      <span className="mt-1 block text-sm text-slate-600">{notification.message}</span>
      <span className="mt-2 block text-xs font-medium text-slate-400">{relativeTime(notification.createdAt)}</span>
    </span>
  </button>
);

export const NotificationsView: React.FC = () => {
  const { data, activeRole, currentUser, setSelectedTicketId } = useTicketStore();
  const navigate = useNavigate();
  const notifications = data.notifications.filter((notification) => {
    if (!notification.ticketId) return true;
    const ticket = data.tickets.find((item) => item.id === notification.ticketId);
    const companyIds = data.companies.filter((company) => company.accountManager === currentUser?.name).map((company) => company.id);
    return Boolean(ticket && canAccessTicket(ticket, activeRole, currentUser?.id, companyIds));
  });
  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-6 p-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-xl bg-indigo-50 p-2 text-[20px] text-indigo-600">notifications</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">Updates about tickets and service activity</p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            {notifications.filter((notification) => !notification.read).length} new
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} onOpenTicket={openTicket} />)}
          {!notifications.length && <p className="p-10 text-center text-sm text-slate-500">You’re all caught up.</p>}
        </div>
      </section>
    </div>
  );
};
