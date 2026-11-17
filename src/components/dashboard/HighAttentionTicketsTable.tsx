import React from "react";
import type { Ticket } from "../../types";
import { ChannelBadge, PriorityBadge, StatusBadge } from "../common";
import { getHighAttentionTickets } from "./dashboardMetrics";

export interface HighAttentionTicketsTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onExploreAll?: () => void;
}

const renderSlaBadge = (risk: Ticket["slaRisk"], deadline?: string) => {
  if (risk === "Breached") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 shadow-xs">
        <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
        Breached
      </span>
    );
  }

  if (risk === "At Risk") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-xs">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        At Risk {deadline ? `(${deadline})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      On Target
    </span>
  );
};

export const HighAttentionTicketsTable: React.FC<HighAttentionTicketsTableProps> = ({
  tickets,
  onSelectTicket,
  onExploreAll,
}) => {
  const highAttentionTickets = getHighAttentionTickets(tickets);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined rounded-lg bg-rose-50 p-2 text-[20px] text-rose-600">
            crisis_alert
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                High-Attention & Critical Incidents
              </h2>
            </div>
          </div>
        </div>

        {onExploreAll && (
          <button
            type="button"
            onClick={onExploreAll}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span>View All Tickets</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-4 py-3">Incident Title</th>
              <th className="px-3 py-3">SLA Status</th>
              <th className="px-3 py-3">Assignee</th>
              <th className="px-5 py-3 ">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {highAttentionTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className="group cursor-pointer transition hover:bg-rose-50/40"
              >
                <td className="px-5 py-3 font-mono font-bold whitespace-nowrap text-slate-500">
                  {ticket.code}
                </td>
                <td className="px-3 py-3 font-semibold whitespace-nowrap text-slate-800">
                  {ticket.companyName}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <span className="block truncate font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {ticket.title}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {renderSlaBadge(ticket.slaRisk, ticket.slaDeadline)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      person
                    </span>
                    <span className="font-medium">{ticket.assignedToName}</span>
                  </div>
                </td>
      
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-600 hover:text-white"
                  >
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-[14px]">
                      open_in_new
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            {highAttentionTickets.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-emerald-500">
                      check_circle
                    </span>
                    <p className="font-semibold text-slate-700">
                      Zero high-attention tickets
                    </p>
                    <p className="text-slate-400">
                      All tickets are within SLA boundaries and no critical incidents are pending.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
