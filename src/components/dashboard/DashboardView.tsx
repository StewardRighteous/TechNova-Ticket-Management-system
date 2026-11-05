import React, { useState } from "react";
import { useTicketStore } from "../../store";
import type { InboundChannel, TicketPriority, TicketStatus } from "../../types";
import { filterTicketsByRole } from "../../utils";

const channels: InboundChannel[] = ["whatsapp", "email", "phone"];
const priorities: TicketPriority[] = [
  "P1 Urgent",
  "P2 Normal",
  "P3 Low",
  "P4 Trivial",
];
const statuses: TicketStatus[] = [
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
    segments.push(
      `${colors[index % colors.length]} ${total ? (start / total) * 100 : 0}% ${(end / (total || 1)) * 100}%`,
    );
    return segments;
  }, []);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <div className="mt-5 flex items-center gap-5">
        <div
          className="relative h-28 w-28 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        >
          <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-xl font-bold text-slate-900">
            {total}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {items.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
const FilterGroup: React.FC<{
  title: string;
  items: string[];
  selected: string[];
  counts: (value: string) => number;
  onToggle: (value: string) => void;
  labels?: Record<string, string>;
}> = ({ title, items, selected, counts, onToggle, labels }) => (
  <fieldset>
    <legend className="mb-2 text-xs font-bold tracking-wide text-slate-700 uppercase">
      {title}
    </legend>
    {items.map((item) => (
      <label
        key={item}
        className="flex cursor-pointer items-center justify-between py-1.5 text-sm text-slate-600"
      >
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          {labels?.[item] ?? item}
        </span>
        <span className="text-xs text-slate-400">({counts(item)})</span>
      </label>
    ))}
  </fieldset>
);

export const DashboardView: React.FC = () => {
  const { data, activeRole, currentUser, setSelectedTicketId, setActiveTab } =
    useTicketStore();
  const [selectedPriorities, setSelectedPriorities] = useState<
    TicketPriority[]
  >([]);
  const [selectedChannels, setSelectedChannels] = useState<InboundChannel[]>(
    [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<TicketStatus[]>([]);
  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );
  const count = (key: "channel" | "priority" | "status", value: string) =>
    tickets.filter((ticket) => ticket[key] === value).length;
  const recent = [...tickets]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .filter(
      (ticket) =>
        (!selectedPriorities.length ||
          selectedPriorities.includes(ticket.priority)) &&
        (!selectedChannels.length ||
          selectedChannels.includes(ticket.channel)) &&
        (!selectedStatuses.length || selectedStatuses.includes(ticket.status)),
    )
    .slice(0, 15);
  const toggle = <T extends string>(
    value: T,
    selected: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
  ) =>
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  const resetFilters = () => {
    setSelectedPriorities([]);
    setSelectedChannels([]);
    setSelectedStatuses([]);
  };
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
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Dashboard</h1>
        <button
          onClick={() => setActiveTab("tickets")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          View all tickets{" "}
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
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
      <div className="grid gap-4 lg:grid-cols-3">
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
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Filters</h2>
            <span className="material-symbols-outlined text-slate-400">
              tune
            </span>
          </div>
          <div className="mt-5 space-y-5">
            <FilterGroup
              title="Status"
              items={statuses}
              selected={selectedStatuses}
              counts={(value) => count("status", value)}
              onToggle={(value) =>
                toggle(
                  value as TicketStatus,
                  selectedStatuses,
                  setSelectedStatuses,
                )
              }
            />
            <FilterGroup
              title="Priority"
              items={priorities}
              selected={selectedPriorities}
              counts={(value) => count("priority", value)}
              onToggle={(value) =>
                toggle(
                  value as TicketPriority,
                  selectedPriorities,
                  setSelectedPriorities,
                )
              }
            />
            {/* <FilterGroup
              title="Channel"
              items={channels}
              labels={channelNames}
              selected={selectedChannels}
              counts={(value) => count("channel", value)}
              onToggle={(value) =>
                toggle(
                  value as InboundChannel,
                  selectedChannels,
                  setSelectedChannels,
                )
              }
            /> */}
          </div>
          <button
            onClick={resetFilters}
            className="mt-5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Reset filters
          </button>
        </aside>
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
