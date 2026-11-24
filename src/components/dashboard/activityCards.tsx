import { InteractiveListRow, NotificationList, Button, Heading, Icon } from "../../ui/barrel";
import React, { useState } from "react";
import type { Notification, Ticket } from "../../types/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

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
        <Icon className="rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
          update
        </Icon>
        <Heading>Recent tickets</Heading>
      </div>
      {onViewAll ? (
        <Button tone="plain"
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Latest updates
        </Button>
      ) : !hideLatestUpdates ? (
        <span className="text-xs font-bold text-indigo-600">
          Latest updates
        </span>
      ) : null}
    </div>
    <div className="divide-y divide-slate-100">
      {tickets.map((ticket) => (
        <InteractiveListRow
          key={ticket.id}
          onOpen={() => onOpen(ticket.id)}
          className="grid grid-cols-1 gap-1.5 px-4 py-2 md:grid-cols-[100px_72px_2fr_1fr_1fr] md:items-center"
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
            <Button tone="plain"
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
            </Button>
          ) : (
            <span className="truncate text-xs text-slate-600">
              {ticket.companyName}
            </span>
          )}
          {onSelectAssignee ? (
            <Button tone="plain"
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
            </Button>
          ) : (
          <span className="truncate text-xs text-slate-600">
            {ticket.assignedToName}
          </span>
          )}
        </InteractiveListRow>
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
        <Icon className="rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
          notifications
        </Icon>
        <Heading>Notifications</Heading>
      </div>
      <div className="flex items-center gap-3">
        <Button tone="plain"
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          View all{" "}
          <Icon className="text-sm">
            arrow_forward
          </Icon>
        </Button>
      </div>
    </div>
    <NotificationList notifications={notifications.slice(0, 5)} variant="compact" getAction={(notification) => {
      const id = notification.ticketId;
      return id ? () => onOpen(id, notification.id) : undefined;
    }} />
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
          <Button tone="plain"
            type="button"
            role="tab"
            aria-selected={activeTab === "recent"}
            onClick={() => setActiveTab("recent")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${activeTab === "recent" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Recent tickets
          </Button>
          <Button tone="plain"
            type="button"
            role="tab"
            aria-selected={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${activeTab === "notifications" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Notifications
          </Button>
        </div>
        {activeTab === "notifications" && (
          <Button tone="plain"
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View all{" "}
            <Icon className="text-sm">
              arrow_forward
            </Icon>
          </Button>
        )}
      </div>
      {activeTab === "recent" ? (
        <div role="tabpanel" className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <Button tone="plain"
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
            </Button>
          ))}
          {!tickets.length && (
            <p className="p-8 text-center text-xs text-slate-500">
              No tickets available.
            </p>
          )}
        </div>
      ) : (
        <div role="tabpanel">
          <NotificationList notifications={notifications.slice(0, 5)} variant="compact" getAction={(notification) => {
            const id = notification.ticketId;
            return id ? () => onOpenNotification(id, notification.id) : undefined;
          }} />
        </div>
      )}
    </section>
  );
};
