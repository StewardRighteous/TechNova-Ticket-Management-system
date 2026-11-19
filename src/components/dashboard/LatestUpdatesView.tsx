import React from "react";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "../../types/barrel";
import { useTicketStore } from "../../store/barrel";
import { filterTicketsByRole } from "../../utils/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const priorityStyles: Record<Ticket["priority"], string> = {
  "P1 Urgent": "bg-rose-50 text-rose-700 ring-rose-200",
  "P2 Normal": "bg-amber-50 text-amber-700 ring-amber-200",
  "P3 Low": "bg-sky-50 text-sky-700 ring-sky-200",
  "P4 Trivial": "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusStyles: Record<Ticket["status"], string> = {
  Open: "bg-blue-50 text-blue-700",
  "Under Review": "bg-cyan-50 text-cyan-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  "Pending QA": "bg-violet-50 text-violet-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-rose-50 text-rose-700",
};

export const LatestUpdatesView: React.FC = () => {
  const navigate = useNavigate();
  const { data, activeRole, currentUser, setSelectedTicketId } = useTicketStore();
  const tickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
    data.companies
      .filter((company) => company.accountManager === currentUser?.name)
      .map((company) => company.id),
  ).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="mt-1 text-sm text-slate-500">
          Tickets ordered by their most recent activity.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
              update
            </span>
            <h2 className="text-base font-bold text-slate-900">Recent tickets</h2>
          </div>
          <span className="text-xs text-slate-500">{tickets.length} tickets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Ticket</th>
                <th scope="col" className="px-4 py-3">Company / service</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Priority</th>
                <th scope="col" className="px-4 py-3">Last activity</th>
                <th scope="col" className="px-4 py-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  tabIndex={0}
                  onClick={() => openTicket(ticket.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTicket(ticket.id);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-slate-50 focus:bg-indigo-50/50 focus:outline-none"
                >
                  <td className="px-4 py-3">
                    <span className="block font-mono text-xs font-bold text-slate-500">{ticket.code}</span>
                    <span className="mt-1 block max-w-[360px] truncate text-xs font-semibold text-slate-900">{ticket.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[200px] truncate text-xs font-medium text-slate-800">{ticket.companyName}</span>
                    <span className="mt-1 block max-w-[200px] truncate text-[11px] text-slate-500">{ticket.serviceName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[ticket.status]}`}>{ticket.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{displayDate(ticket.updatedAt)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{ticket.assignedToName}</td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500">No tickets available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
