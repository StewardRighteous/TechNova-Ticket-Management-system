import React, { useState } from "react";
import type { Notification, Ticket } from "../../types/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const relativeTime = (value: string) => {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - Date.parse(value)) / 60000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export const RecentTickets: React.FC<{
  tickets: Ticket[];
  onOpen: (id: string) => void;
  onViewAll?: () => void;
  onSelectCompany?: (companyId: string) => void;
  onSelectAssignee?: (employeeId: string) => void;
  hideLatestUpdates?: boolean;
}> = ({
  tickets,
  onOpen,
  onViewAll,
  onSelectCompany,
  onSelectAssignee,
  hideLatestUpdates = false,
}) => (
  <section
    id="recent-tickets"
    className="scroll-mt-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
  >
    <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
          update
        </span>
        <h2 className="text-base font-bold text-slate-900">Recent tickets</h2>
      </div>
      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Latest updates
        </button>
      ) : !hideLatestUpdates ? (
        <span className="text-xs font-bold text-indigo-600">
          Latest updates
        </span>
      ) : null}
    </div>
    <div className="divide-y divide-slate-100">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onOpen(ticket.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(ticket.id);
            }
          }}
          role="button"
          tabIndex={0}
          className="grid w-full grid-cols-1 gap-1.5 px-4 py-2 text-left transition hover:bg-slate-50 focus:bg-indigo-50/50 focus:outline-none md:grid-cols-[100px_72px_2fr_1fr_1fr] md:items-center"
        >
          <span className="text-[11px] text-slate-500">
            {displayDate(ticket.updatedAt)}
          </span>
          <span className="font-mono text-xs font-bold text-slate-500">
            {ticket.code}
          </span>
          <span className="truncate text-xs font-semibold text-slate-900">
            {ticket.title}
          </span>
          {onSelectCompany ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectCompany(ticket.companyId);
              }}
              onKeyDown={(event) => event.stopPropagation()}
              className="truncate text-left text-xs font-medium text-slate-700 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
              title={`View ${ticket.companyName}`}
            >
              {ticket.companyName}
            </button>
          ) : (
            <span className="truncate text-xs text-slate-600">
              {ticket.companyName}
            </span>
          )}
          {onSelectAssignee ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectAssignee(ticket.assignedToId);
              }}
              onKeyDown={(event) => event.stopPropagation()}
              className="truncate text-left text-xs text-slate-600 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
              title={`View ${ticket.assignedToName}`}
            >
              {ticket.assignedToName}
            </button>
          ) : (
          <span className="truncate text-xs text-slate-600">
            {ticket.assignedToName}
          </span>
          )}
        </div>
      ))}
      {!tickets.length && (
        <p className="p-8 text-center text-xs text-slate-500">
          No tickets available.
        </p>
      )}
    </div>
  </section>
);

export const NotificationsCard: React.FC<{
  notifications: Notification[];
  onOpen: (id: string, notificationId: string) => void;
  onViewAll: () => void;
}> = ({ notifications, onOpen, onViewAll }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
          notifications
        </span>
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          View all{" "}
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
    <div className="divide-y divide-slate-100">
      {notifications.slice(0, 5).map((notification) => (
        <button
          key={notification.id}
          type="button"
          onClick={() =>
            notification.ticketId &&
            onOpen(notification.ticketId, notification.id)
          }
          disabled={!notification.ticketId}
          className="group flex w-full items-start gap-2.5 px-4 py-2 text-left transition hover:bg-slate-50 focus-visible:bg-indigo-50/60 focus-visible:outline-none disabled:cursor-default"
        >
          <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-500">
            {notification.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-bold text-slate-800">
                {notification.title}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-slate-500">
                {relativeTime(notification.createdAt)}
              </span>
            </span>
            <span className="mt-1 hidden text-[11px] leading-4 text-slate-600 group-hover:block group-focus-visible:block">
              {notification.message}
            </span>
          </span>
        </button>
      ))}
      {!notifications.length && (
        <p className="p-8 text-center text-xs text-slate-500">
          No notifications.
        </p>
      )}
    </div>
  </section>
);

export const DashboardActivityCard: React.FC<{
  tickets: Ticket[];
  notifications: Notification[];
  onOpenTicket: (id: string) => void;
  onOpenNotification: (id: string, notificationId: string) => void;
  onViewAll: () => void;
}> = ({
  tickets,
  notifications,
  onOpenTicket,
  onOpenNotification,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<"recent" | "notifications">(
    "recent",
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div
          className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Dashboard activity"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "recent"}
            onClick={() => setActiveTab("recent")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${activeTab === "recent" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Recent tickets
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${activeTab === "notifications" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Notifications
          </button>
        </div>
        {activeTab === "notifications" && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View all{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        )}
      </div>
      {activeTab === "recent" ? (
        <div role="tabpanel" className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onOpenTicket(ticket.id)}
              className="grid w-full grid-cols-1 gap-1.5 px-4 py-2.5 text-left transition hover:bg-slate-50 md:grid-cols-[150px_72px_minmax(0,2fr)_1fr] md:items-center"
            >
              <span className="text-[11px] text-slate-500">
                {displayDate(ticket.updatedAt)}
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">
                {ticket.code}
              </span>
              <span className="truncate text-xs font-semibold text-slate-900">
                {ticket.title}
              </span>
              <span className="truncate text-xs text-slate-600">
                {ticket.companyName}
              </span>
              <span className="truncate text-xs text-slate-600">
                {ticket.assignedToName}
              </span>
            </button>
          ))}
          {!tickets.length && (
            <p className="p-8 text-center text-xs text-slate-500">
              No tickets available.
            </p>
          )}
        </div>
      ) : (
        <div role="tabpanel" className="divide-y divide-slate-100">
          {notifications.slice(0, 5).map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() =>
                notification.ticketId &&
                onOpenNotification(notification.ticketId, notification.id)
              }
              disabled={!notification.ticketId}
              className="group flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-slate-50 focus-visible:bg-indigo-50/60 focus-visible:outline-none disabled:cursor-default"
            >
              <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-500">
                {notification.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-800">
                  {notification.title}
                </span>
                <span className="mt-1 hidden text-[11px] leading-4 text-slate-600 group-hover:block group-focus-visible:block">
                  {notification.message}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-medium text-slate-500">
                {relativeTime(notification.createdAt)}
              </span>
            </button>
          ))}
          {!notifications.length && (
            <p className="p-8 text-center text-xs text-slate-500">
              No notifications.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
