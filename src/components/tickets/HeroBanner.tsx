import React from "react";
import type { Ticket } from "../../types/barrel";

interface HeroBannerProps { ticket: Ticket; onDelete?: () => void }

export const HeroBanner: React.FC<HeroBannerProps> = ({ ticket, onDelete }) => {
  const metrics: [string, string, string][] = [
    ["Assignee", ticket.assignedToName || "Unassigned", "person"],
    ["Customer", ticket.companyName || "No customer", "domain"],
    ["Service", ticket.serviceName || "No service", "layers"],
    ["Priority", ticket.priority.replace(/^P\d\s*/, ""), "flag"],
  ];

  return <div className="overflow-hidden rounded-2xl bg-slate-900 text-white">
    <section aria-labelledby="ticket-summary-title">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-teal-200" aria-hidden="true"><span className="material-symbols-outlined block text-[23px] leading-none">confirmation_number</span></span>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h1 id="ticket-summary-title" className="min-w-0 truncate text-lg font-bold text-white sm:text-xl">{ticket.title || "Untitled ticket"}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(ticket.status)}`}>{ticket.status}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-200">
              <span className="font-mono font-bold text-slate-300">{ticket.code}</span>
            </div>
          </div>
        </div>
        {onDelete && <button type="button" onClick={onDelete} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300/70 bg-fuchsia-950/60 px-3 py-2 text-xs font-bold text-rose-100 shadow-sm transition hover:bg-fuchsia-900/75"><span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>Delete</button>}
      </div>
      <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
        {metrics.map(([label, value, icon]) => <div key={label} className="flex min-w-0 items-center gap-2.5 border-white/10 px-4 py-2.5 sm:border-r sm:px-5 sm:last:border-r-0">
          <span className="material-symbols-outlined shrink-0 text-[20px] text-teal-200" aria-hidden="true">{icon}</span>
          <div className="min-w-0"><p className="text-[10px] text-slate-400">{label}</p><p className="truncate text-xs font-bold text-white">{value}</p></div>
        </div>)}
      </div>
    </section>
  </div>;
};

const statusColor = (status: Ticket["status"]) => ({ Open: "bg-blue-700/80", "In Progress": "bg-blue-700/80", Escalated: "bg-amber-600/80", "Under Review": "bg-cyan-600/80", "Pending QA": "bg-violet-700/80", Resolved: "bg-emerald-700/80", Closed: "bg-slate-600/80" })[status];
