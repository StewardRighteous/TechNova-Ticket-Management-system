import React, { useMemo, useState } from "react";
import type { Company, ServiceLine, Ticket } from "../../types/barrel";
import { ComboboxFilter, TableSearch } from "../common/barrel";

interface ServiceDetailHeroProps {
  service: ServiceLine;
  tickets?: Ticket[];
  companies?: Company[];
  onUpdateService: (updates: Partial<ServiceLine>) => void;
  canEdit?: boolean;
  onOpenTicket?: (ticketId: string) => void;
}
type Tab = "details" | "tickets" | "companies";

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  tickets = [],
  companies = [],
  onUpdateService,
  canEdit = true,
  onOpenTicket,
}) => {
  const [tab, setTab] = useState<Tab>("details");
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(service.description);
  const [technologies, setTechnologies] = useState(service.technologies.join(", "));
  const [escalationGuidelines, setEscalationGuidelines] = useState(`Escalate unresolved incidents nearing the ${service.slaTarget} response target to ${service.lead}, with diagnostic context and customer impact.`);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatuses, setTicketStatuses] = useState<string[]>([]);
  const linkedTickets = tickets.filter(
    (ticket) => ticket.serviceId === service.id && !["Resolved", "Closed"].includes(ticket.status),
  );
  const visibleTickets = useMemo(() => linkedTickets.filter((ticket) =>
    (ticketStatuses.length === 0 || ticketStatuses.includes(ticket.status)) &&
    `${ticket.code} ${ticket.title} ${ticket.assignedToName}`.toLowerCase().includes(ticketSearch.toLowerCase()),
  ), [linkedTickets, ticketSearch, ticketStatuses]);
  const subscribedCompanies = companies.filter(
    (company) => company.subscribedServices.includes(service.name) || company.subscribedServices.includes(service.code),
  );
  const metrics: [string, string | number][] = [
    ["Active tickets", linkedTickets.length],
    ["Health / uptime", service.uptime],
    ["Assigned specialists", new Set(linkedTickets.map((ticket) => ticket.assignedToId)).size],
  ];
  const tabs: [Tab, string][] = [["details", "Service details"], ["tickets", "Linked tickets"], ["companies", "Subscribed companies"]];

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-teal-200" aria-hidden="true"><span className="material-symbols-outlined text-[23px] leading-none">layers</span></span>
            <div className="min-w-0">
            <h1 className="mt-1 text-lg font-bold leading-tight text-white sm:text-xl">{service.name}</h1>
            <p className="mt-1 text-xs text-slate-200"><span className="rounded-full bg-teal-400/20 px-2 py-0.5 font-semibold text-teal-100">{service.status}</span></p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-center">
            <button type="button" onClick={() => setTab("tickets")} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">View active tickets</button>
            <button type="button" onClick={() => setTab("details")} className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">Escalation guide</button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
          {[["Department lead", service.lead], ["Status", service.status], ["SLA target", service.slaTarget], ["Uptime", service.uptime]].map(([label, value]) => (
            <div key={label} className="min-w-0 border-r border-white/10 px-3 py-2.5 last:border-r-0 sm:px-4"><p className="text-[10px] text-slate-300">{label}</p><p className="truncate text-xs font-semibold text-white">{value}</p></div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">{label}</p>
          <p className="mt-1 text-xl font-bold leading-none text-[#1f2041]">{value}</p>
        </div>)}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3">
          <div role="tablist" aria-label="Service information" className="flex min-w-0 gap-1 overflow-x-auto">
            {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
          </div>
          {tab === "details" && (editing ? <div className="flex shrink-0 gap-2 py-1"><button type="button" onClick={() => { setDescription(service.description); setTechnologies(service.technologies.join(", ")); setEscalationGuidelines(`Escalate unresolved incidents nearing the ${service.slaTarget} response target to ${service.lead}, with diagnostic context and customer impact.`); setEditing(false); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={() => { onUpdateService({ description, technologies: technologies.split(",").map((item) => item.trim()).filter(Boolean) }); setEditing(false); }} className="rounded-lg bg-[#119da4] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0e858d]">Save</button></div> : canEdit && <button type="button" onClick={() => { setDescription(service.description); setTechnologies(service.technologies.join(", ")); setEditing(true); }} className="my-1 shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Edit details</button>)}
        </div>
        <div className="p-3 pt-2 sm:p-4 sm:pt-2">
          {tab === "details" && <div className="space-y-4">
            {editing ? <textarea aria-label="Service description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#119da4] focus:outline-none" /> : <p className="max-w-4xl text-sm leading-6 text-slate-600">{service.description}</p>}
            <div className="rounded-lg border border-[#a8dddd] bg-[#e9f7f7] px-4 py-3"><div className="flex items-center justify-between gap-3"><h3 className="text-[10px] font-bold tracking-wide text-[#0d6d77] uppercase">Escalation guidelines</h3>{editing && <button type="button" onClick={() => document.getElementById("service-escalation-guidelines")?.focus()} className="rounded-md border border-[#0d6d77]/30 px-2 py-1 text-[10px] font-semibold text-[#0d6d77]">Edit</button>}</div>{editing ? <textarea id="service-escalation-guidelines" aria-label="Escalation guidelines" value={escalationGuidelines} onChange={(event) => setEscalationGuidelines(event.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-[#a8dddd] bg-white p-3 text-sm text-slate-700 focus:border-[#119da4] focus:outline-none" /> : <p className="mt-1 text-sm leading-5 text-slate-700">{escalationGuidelines}</p>}</div>
            <div><div className="flex items-center justify-between gap-3"><h3 className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Supported technology stack</h3>{editing && <button type="button" onClick={() => document.getElementById("service-technologies")?.focus()} className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-600">Edit</button>}</div>{editing ? <input id="service-technologies" aria-label="Supported technology stack" value={technologies} onChange={(event) => setTechnologies(event.target.value)} placeholder="Enter technologies separated by commas" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#119da4] focus:outline-none" /> : <div className="mt-2 flex flex-wrap gap-2">{service.technologies.map((technology) => <span key={technology} className="rounded-md bg-[#e9f7f7] px-2.5 py-1 text-xs font-semibold text-[#0d6d77]">{technology}</span>)}</div>}</div>
          </div>}
          {tab === "tickets" && <LinkedTickets tickets={visibleTickets} total={linkedTickets.length} search={ticketSearch} onSearch={setTicketSearch} statuses={ticketStatuses} onStatuses={setTicketStatuses} onOpenTicket={onOpenTicket} />}
          {tab === "companies" && <CompanyList companies={subscribedCompanies} />}
        </div>
      </section>
    </div>
  );
};

const LinkedTickets: React.FC<{ tickets: Ticket[]; total: number; search: string; onSearch: (value: string) => void; statuses: string[]; onStatuses: (values: string[]) => void; onOpenTicket?: (id: string) => void }> = ({ tickets, total, search, onSearch, statuses, onStatuses, onOpenTicket }) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold text-[#1f2041]">Linked tickets <span className="font-medium text-slate-500">({total})</span></h2><div className="flex flex-wrap items-center gap-2">
      <TableSearch id="linked-ticket-search" value={search} onChange={onSearch} placeholder="Search tickets..." aria-label="Search linked tickets" className="w-full sm:w-64" />
      <ComboboxFilter label="Status" placeholder="Search status..." options={[...new Set(tickets.map((ticket) => ticket.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} />
      <span className="text-xs font-semibold text-slate-500">{tickets.length} shown</span></div></div>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase"><tr>{["Ticket", "Subject", "Status", "Priority", "Assignee", "Updated", "SLA"].map((heading) => <th key={heading} className="px-2.5 py-2 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{tickets.length ? tickets.map((ticket) => <tr key={ticket.id} className="hover:bg-slate-50/70"><td className="px-2.5 py-2.5"><button type="button" onClick={() => onOpenTicket?.(ticket.id)} className="font-bold text-[#0d6d77] hover:underline">{ticket.code}</button></td><td className="max-w-56 truncate px-2.5 py-2.5 font-medium text-slate-700">{ticket.title}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.status}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.priority.replace(/^P\d\s*/, "")}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.assignedToName || "Unassigned"}</td><td className="whitespace-nowrap px-2.5 py-2.5 text-slate-500">{ticket.timeAgo}</td><td className="whitespace-nowrap px-2.5 py-2.5 text-slate-600">{ticket.slaDeadline || ticket.slaRisk}</td></tr>) : <tr><td colSpan={7} className="px-2.5 py-6 text-center text-slate-500">{total ? "No tickets match these filters." : "No active tickets linked to this service."}</td></tr>}</tbody></table></div>
  </div>
);

const CompanyList: React.FC<{ companies: Company[] }> = ({ companies }) => (
  <div><h2 className="text-base font-bold text-[#1f2041]">Subscribed client companies <span className="font-medium text-slate-500">({companies.length})</span></h2>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase"><tr>{["Company", "Tier", "Account manager", "Active tickets", "Status"].map((heading) => <th key={heading} className="px-2.5 py-2 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{companies.length ? companies.map((company) => <tr key={company.id} className="hover:bg-slate-50/70"><td className="px-2.5 py-2.5 font-semibold text-slate-900">{company.name}</td><td className="px-2.5 py-2.5 text-slate-600">{company.tier}</td><td className="px-2.5 py-2.5 text-slate-600">{company.accountManager}</td><td className="px-2.5 py-2.5 text-slate-600">{company.activeTickets}</td><td className="px-2.5 py-2.5 text-slate-600">{company.status}</td></tr>) : <tr><td colSpan={5} className="px-2.5 py-6 text-center text-slate-500">No subscribed companies found.</td></tr>}</tbody></table></div>
  </div>
);
