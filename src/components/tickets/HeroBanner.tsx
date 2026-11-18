import React from "react";
import type { Ticket } from "../../types/barrel";
import { PriorityBadge, StatusBadge } from "../common/barrel";

interface HeroBannerProps { ticket: Ticket }

export const HeroBanner: React.FC<HeroBannerProps> = ({ ticket }) => {
  const sectionLinks = [
    ["Issue", "ticket-issue"], ["Activity", "ticket-activity"],
    ["Details", "ticket-details"], ...(ticket.attachments?.length ? [["Files", "ticket-attachments"]] : []),
  ];
  return <section aria-labelledby="ticket-summary-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm font-bold text-indigo-700">{ticket.code || "Ticket"}</span>
      <StatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ticket.slaRisk === "Breached" ? "bg-rose-50 text-rose-700" : ticket.slaRisk === "At Risk" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>SLA · {ticket.slaRisk || "Not set"}{ticket.slaDeadline && ticket.slaDeadline !== ticket.slaRisk ? ` · ${ticket.slaDeadline}` : ""}</span>
    </div>
    <h1 id="ticket-summary-title" className="mt-3 break-words text-xl font-bold leading-snug tracking-tight text-slate-900">{ticket.title || "Untitled ticket"}</h1>
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
      <p><span className="text-slate-500">Assigned to</span> <strong>{ticket.assignedToName || "Unassigned"}</strong></p>
      <p><span className="text-slate-500">Customer</span> <strong>{ticket.companyName || "No customer"}</strong></p>
      <p><span className="text-slate-500">Service</span> <strong>{ticket.serviceName || "No service"}</strong></p>
    </div>
    <nav aria-label="Ticket sections" className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
      {sectionLinks.map(([label, id]) => <a key={id} href={`#${id}`} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600">{label}</a>)}
    </nav>
  </section>;
};
