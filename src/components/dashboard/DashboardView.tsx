import React from "react";
import { useTicketStore } from "../../store";
import type { InboundChannel, Notification } from "../../types";
import { filterTicketsByRole } from "../../utils";

const channels: InboundChannel[] = ["whatsapp", "email", "phone"];
const priorities = ["P1 Urgent", "P2 Normal", "P3 Low", "P4 Trivial"];
const statuses = [
  "Open",
  "In Progress",
  "Escalated",
  "Under Review",
  "Pending QA",
  "Resolved",
  "Closed",
];
const channelNames: Record<InboundChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone",
};
const colors = [
  "#243b64",
  "#54749f",
  "#8ca5c3",
  "#c7d4e2",
  "#64748b",
  "#334155",
  "#94a3b8",
];

const labelColors: Record<string, string> = {
  // Statuses
  Open: "#3b82f6",
  "In Progress": "#f59e0b",
  Escalated: "#ef4444",
  "Under Review": "#8b5cf6",
  "Pending QA": "#06b6d4",
  Resolved: "#10b981",
  Closed: "#64748b",

  // Priorities
  "P1 Urgent": "#ef4444",
  "P2 Normal": "#f59e0b",
  "P3 Low": "#3b82f6",
  "P4 Trivial": "#94a3b8",

  // Channels
  WhatsApp: "#10b981",
  Email: "#3b82f6",
  Phone: "#8b5cf6",
};

const isToday = (value?: string) =>
  !!value &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toDateString() === new Date().toDateString();
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
type Item = { label: string; value: number };

const PieChart: React.FC<{ title: string; items: Item[] }> = ({
  title,
  items,
}) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const stops = items.reduce<string[]>((segments, item, index) => {
    const start = segments.length
      ? (Number(segments.at(-1)?.split(" ")[2]?.replace("%", "")) *
          (total || 1)) /
        100
      : 0;
    const end = start + item.value;
    const itemColor = labelColors[item.label] || colors[index % colors.length];
    segments.push(
      `${itemColor} ${total ? (start / total) * 100 : 0}% ${(end / (total || 1)) * 100}%`,
    );
    return segments;
  }, []);

  return (
    <section className="flex flex-col justify-start rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 pt-2">
        {/* Modern Donut Chart */}
        <div
          className="relative size-36 shrink-0 rounded-full shadow-inner"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        >
          <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white shadow-xs">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {total}
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Tickets
            </span>
          </div>
        </div>

        {/* Clean Modern Legend Grid */}
        <div
          className={`grid w-full gap-2 ${items.length > 4 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {items.map((item, index) => {
            const itemColor =
              labelColors[item.label] || colors[index % colors.length];
            const percentage =
              total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 transition hover:bg-slate-100/80"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full shadow-xs"
                    style={{ backgroundColor: itemColor }}
                  />
                  <span className="truncate text-xs font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
                {items.length <= 4 && (
                  <div className="flex items-center gap-1.5 pl-2">
                    <span className="text-[10px] text-slate-400">
                      ({percentage}%)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const DashboardView: React.FC = () => {
  const { data, activeRole, currentUser, setSelectedTicketId, setActiveTab } =
    useTicketStore();
  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );
  const count = (key: "channel" | "priority" | "status", value: string) =>
    tickets.filter((ticket) => ticket[key] === value).length;
  const recent = [...tickets]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 7);
  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab("tickets");
  };
  const cards = [
    ["Total tickets", tickets.length, "confirmation_number"],
    [
      "Due today",
      tickets.filter((ticket) => isToday(ticket.dueAt)).length,
      "today",
    ],
    [
      "Employees present",
      data.employees.filter((employee) => employee.status !== "Off Shift")
        .length,
      "groups",
    ],
    ["Closed tickets", count("status", "Closed"), "task_alt"],
  ] as const;
  return (
    <div className="max-w-8xl space-y-5 p-5">
      <div className="grid grid-flow-col-dense gap-4">
        {cards.map(([label, value, icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {label}
              </span>
              <span className="material-symbols-outlined text-[20px] text-slate-500">
                {icon}
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <PieChart
          title="Tickets by status"
          items={statuses
            .map((key) => ({ label: key, value: count("status", key) }))
            .filter((item) => item.value > 0)}
        />
        <PieChart
          title="Tickets by priority"
          items={priorities.map((key) => ({
            label: key,
            value: count("priority", key),
          }))}
        />
        <PieChart
          title="Tickets by channel"
          items={channels.map((key) => ({
            label: channelNames[key],
            value: count("channel", key),
          }))}
        />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <RecentTickets tickets={recent} onOpen={openTicket} />
        <NotificationsCard
          notifications={data.notifications}
          onOpen={openTicket}
        />
      </div>
    </div>
  );
};
const RecentTickets: React.FC<{
  tickets: ReturnType<typeof filterTicketsByRole>;
  onOpen: (id: string) => void;
}> = ({ tickets, onOpen }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-5">
      <h2 className="text-lg font-bold text-slate-950">Recent tickets</h2>
    </div>
    <div className="divide-y divide-slate-100">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onOpen(ticket.id)}
          className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[60px_2fr_100px_1fr] md:items-center"
        >
          <span className="font-mono text-xs font-bold text-slate-700">
            {ticket.code}
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">
            {ticket.title}
          </span>
          <span className="text-xs text-slate-500">
            {displayDate(ticket.updatedAt)}
          </span>
          <span className="truncate text-xs text-slate-600">
            {ticket.assignedToName}
          </span>
        </button>
      ))}
      {!tickets.length && (
        <p className="p-8 text-center text-sm text-slate-500">
          No tickets match these filters.
        </p>
      )}
    </div>
  </section>
);

const NotificationsCard: React.FC<{
  notifications: Notification[];
  onOpen: (id: string) => void;
}> = ({ notifications, onOpen }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-200 p-5">
      <h2 className="text-lg font-bold text-slate-950">Notifications</h2>
      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
        {notifications.filter((notification) => !notification.read).length} new
      </span>
    </div>
    <div className="divide-y divide-slate-100">
      {notifications.slice(0, 5).map((notification) => (
        <button
          key={notification.id}
          onClick={() => notification.ticketId && onOpen(notification.ticketId)}
          disabled={!notification.ticketId}
          className="flex w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-50 disabled:cursor-default"
        >
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-indigo-500">
            {notification.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="truncate text-xs font-bold text-slate-800">
                {notification.title}
              </span>
              {!notification.read && (
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-indigo-500" />
              )}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {notification.message}
            </span>
            <span className="mt-1 block text-[10px] font-medium text-slate-400">
              {relativeTime(notification.createdAt)}
            </span>
          </span>
        </button>
      ))}
      {!notifications.length && (
        <p className="p-8 text-center text-sm text-slate-500">
          No notifications.
        </p>
      )}
    </div>
  </section>
);
