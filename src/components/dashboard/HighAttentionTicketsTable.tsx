import React, { useState } from "react";
import type { Ticket } from "../../types/barrel";
import { NumericPagination } from "../common/barrel";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const paginatedTickets = highAttentionTickets.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section
      id="high-attention-incidents"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined rounded-lg bg-rose-50 p-2 text-[20px] text-rose-600">
            crisis_alert
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h2 className="text-base font-bold text-slate-900">
                Attention Needed
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
            <span>Open ticket registry</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[28%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th className="px-3 py-2.5">Ticket</th>
              <th className="px-3 py-2.5">Company</th>
              <th className="px-3 py-2.5">Due status</th>
              <th className="px-3 py-2.5">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className="group cursor-pointer transition hover:bg-rose-50/40"
              >
                <td className="max-w-0 px-3 py-2.5">
                  <div className="font-mono text-[10px] font-bold text-slate-500">{ticket.code}</div>
                  <span className="mt-0.5 block truncate font-semibold text-slate-900 group-hover:text-rose-700 transition-colors" title={ticket.title}>{ticket.title}</span>
                </td>
                <td className="max-w-0 px-3 py-2.5">
                  <div className="truncate font-semibold text-slate-800" title={ticket.companyName}>{ticket.companyName}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="whitespace-nowrap">{renderSlaBadge(ticket.slaRisk)}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-1 text-[10px] text-slate-600">
                    <span className="material-symbols-outlined shrink-0 text-[13px] text-slate-400">person</span>
                    <span className="">{ticket.assignedToName}</span>
                  </div>
                </td>
              </tr>
            ))}
            {highAttentionTickets.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-emerald-500">
                      check_circle
                    </span>
                    <p className="font-semibold text-slate-700">
                      No tickets need attention
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
      <NumericPagination
        totalItems={highAttentionTickets.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 25]}
      />
    </section>
  );
};

