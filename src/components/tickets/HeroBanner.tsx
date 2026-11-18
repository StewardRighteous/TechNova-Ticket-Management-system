import React from "react";
import type { Ticket } from "../../types/barrel";

interface HeroBannerProps { ticket: Ticket }

export const HeroBanner: React.FC<HeroBannerProps> = ({ ticket }) => {
  return <div className="rounded-t-2xl bg-gradient-to-br from-slate-950 via-[#10264a] to-[#102f54] p-4 text-white sm:p-6">
    <section aria-labelledby="ticket-summary-title">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white ${statusColor(ticket.status)}`}>{ticket.status}</span>
        <span className="font-mono text-xs font-bold text-slate-300">{ticket.code}</span>
        <span className={`ml-auto flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold ${ticket.slaRisk === "Breached" ? "border-rose-400/50 bg-rose-500/15 text-rose-200" : ticket.slaRisk === "At Risk" ? "border-amber-400/50 bg-amber-500/15 text-amber-200" : "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"}`}><span className="material-symbols-outlined text-sm">schedule</span>{ticket.slaRisk === "At Risk" ? "At risk" : ticket.slaRisk === "Breached" ? "Breached" : "Within SLA"} · {ticket.slaDeadline}</span>
      </div>
      <h1 id="ticket-summary-title" className="mt-3 w-full whitespace-normal break-words text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{ticket.title || "Untitled ticket"}</h1>
      <div className="mt-4 border-t border-white/15 pt-3">
        <div className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <span className="text-slate-300">Assignee: <strong className="text-white">{ticket.assignedToName || "Unassigned"}</strong></span>
          <span className="text-slate-300">Customer: <strong className="text-white">{ticket.companyName || "No customer"}</strong></span>
          <span className="text-slate-300">Service: <strong className="text-white">{ticket.serviceName || "No service"}</strong></span>
          <span className="text-slate-300">Priority: <strong className="text-white">{ticket.priority.replace(/^P\d\s*/, "")}</strong></span>
        </div>
      </div>
    </section>
  </div>;
};

const statusColor = (status: Ticket["status"]) => ({ Open: "bg-blue-700", "In Progress": "bg-blue-700", Escalated: "bg-amber-600", "Under Review": "bg-cyan-600", "Pending QA": "bg-violet-700", Resolved: "bg-emerald-700", Closed: "bg-slate-600" })[status];
