import React, { useMemo, useState } from "react";
import type { Company, Department, Employee, ServiceLine, Team, Ticket } from "../../types/barrel";
import { ComboboxFilter, SelectDropdown, TableSearch, formControlClassName } from "../common/barrel";

import { Link, useSearchParams } from "react-router-dom";
import { matchesService } from "../../utils/matchesService";
import { durationMinutes, isContractActive, ticketPriorities, weekdays } from "../../utils/supportPolicy";
import { ServiceEditDialog } from "./ServiceEditDialog";
import { SlaPolicyFields } from "../common/SlaPolicyFields";

interface ServiceDetailHeroProps {
  service: ServiceLine;
  tickets?: Ticket[];
  companies?: Company[];
  services?: ServiceLine[];
  departments?: Department[];
  employees?: Employee[];
  teams?: Team[];
  onUpdateService: (updates: Partial<ServiceLine>) => void;
  onDeleteService?: () => void;
  canEdit?: boolean;
  onOpenTicket?: (ticketId: string) => void;
}
type Tab = "details" | "support" | "tickets" | "companies" | "contracts";
const serviceIcon = (code: string) => code.startsWith("CUST") ? "web" : code.startsWith("CLOUD") ? "cloud" : code.startsWith("BIZ") ? "business" : code.startsWith("SUPP") ? "support_agent" : "security";

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  tickets = [],
  companies = [],
  services = [],
  departments = [],
  employees = [],
  teams = [],
  onUpdateService,
  onDeleteService,
  canEdit = true,
  onOpenTicket,
}) => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "details";
  const setTab = (next: Tab) => setParams({ tab: next }, { replace: true });
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingSupport, setEditingSupport] = useState(false);
  const [supportDraft, setSupportDraft] = useState(service);
  const [confirmAction, setConfirmAction] = useState<"details-save" | "details-cancel" | "support-save" | "support-cancel" | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState(service.description);
  const [technologiesDraft, setTechnologiesDraft] = useState(service.technologies.join(", "));
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatuses, setTicketStatuses] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyTiers, setCompanyTiers] = useState<string[]>([]);
  const [companyStatuses, setCompanyStatuses] = useState<string[]>([]);
  const linkedTickets = useMemo(() => tickets.filter(
    (ticket) => ticket.serviceId === service.id && !["Resolved", "Closed"].includes(ticket.status),
  ), [tickets, service.id]);
  const serviceTicketCount = tickets.filter((ticket) => ticket.serviceId === service.id).length;
  const visibleTickets = useMemo(() => linkedTickets.filter((ticket) =>
    (ticketStatuses.length === 0 || ticketStatuses.includes(ticket.status)) &&
    `${ticket.code} ${ticket.title} ${ticket.assignedToName}`.toLowerCase().includes(ticketSearch.toLowerCase()),
  ), [linkedTickets, ticketSearch, ticketStatuses]);
  const subscribedCompanies = companies.filter(
    (company) => company.subscribedServices.some((reference) => matchesService(service, reference)),
  );
  const visibleCompanies = subscribedCompanies.filter((company) =>
    (companyTiers.length === 0 || companyTiers.includes(company.tier)) &&
    (companyStatuses.length === 0 || companyStatuses.includes(company.status)) &&
    `${company.name} ${company.accountManager} ${company.tier} ${company.status}`.toLowerCase().includes(companySearch.toLowerCase()),
  );
  const tabs: [Tab, string][] = [["details", "Service details"], ["support", "Support & SLA"], ["tickets", "Linked tickets"], ["companies", "Subscribed companies"], ["contracts", "Contracts"]];

  const contracts = companies.flatMap((company) => (company.contracts ?? [])
    .filter((contract) => contract.serviceIds.includes(service.id)).map((contract) => ({ company, contract })));
  const calendar = service.slaPolicy?.calendar;
  const defaultResponse = durationMinutes(service.slaTarget);
  const teamName = (id?: string) => teams.find((team) => team.id === id)?.name;

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-slate-200" aria-hidden="true">{service.logo ? <img src={service.logo} alt="" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined block text-center text-[23px] leading-none">{serviceIcon(service.code)}</span>}</span>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold leading-tight text-white sm:text-xl">{service.name}</h1>
            <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-xs font-semibold text-teal-100">{service.status}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-center">
            {canEdit && <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Edit Details</button>}
            {canEdit && onDeleteService && <button type="button" onClick={() => setShowDeleteConfirmation(true)} className="rounded-lg border border-red-300/60 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">Delete</button>}
            <button type="button" onClick={() => setTab("tickets")} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">View active tickets</button>
            <button type="button" onClick={() => setTab("support")} className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">Escalation guide</button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-3">
          {[["Service code", service.code], ["Owning department", service.department], ["Service lead", service.lead]].map(([label, value]) => (
            <div key={label} className="min-w-0 border-r border-white/10 px-3 py-2.5 last:border-r-0 sm:px-4"><p className="text-[10px] text-slate-300">{label}</p><p className="truncate text-xs font-semibold text-white">{value}</p></div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-1.5">
          <div role="tablist" aria-label="Service information" className="flex min-w-0 gap-1 overflow-x-auto">
            {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
          </div>
          {tab === "details" && canEdit && (editingDetails ? <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setConfirmAction("details-cancel")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">Cancel</button>
            <button type="button" onClick={() => setConfirmAction("details-save")} className="rounded-lg bg-[#1f2041] px-3 py-1.5 text-xs font-semibold text-white">Save</button>
          </div> : <button type="button" onClick={() => {
            setDescriptionDraft(service.description);
            setTechnologiesDraft(service.technologies.join(", "));
            setEditingDetails(true);
          }} className="my-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"><span className="material-symbols-outlined text-[15px]" aria-hidden="true">edit</span>Edit details</button>)}
          {tab === "support" && canEdit && (editingSupport ? <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setConfirmAction("support-cancel")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">Cancel</button>
            <button type="button" onClick={() => setConfirmAction("support-save")} className="rounded-lg bg-[#1f2041] px-3 py-1.5 text-xs font-semibold text-white">Save</button>
          </div> : <button type="button" onClick={() => { setSupportDraft(service); setEditingSupport(true); }} className="my-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"><span className="material-symbols-outlined text-[15px]" aria-hidden="true">edit</span>Edit</button>)}
        </div>
        <div className="p-3 pt-2 sm:p-4 sm:pt-2">
          {tab === "details" && <div className="space-y-3 text-sm">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-500">Description<textarea readOnly={!editingDetails} className={`${formControlClassName} mt-1 min-h-32 resize-y text-sm leading-6`} value={editingDetails ? descriptionDraft : service.description || "No description."} onChange={(event) => setDescriptionDraft(event.target.value)} /></label>
            </div>
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-500">Technology stack</label>
              {editingDetails ? <input className={`${formControlClassName} mt-1 text-sm`} placeholder="Separate technologies with commas" value={technologiesDraft} onChange={(event) => setTechnologiesDraft(event.target.value)} /> : service.technologies.length > 0 ? <ul className="mt-2 flex flex-wrap gap-2">{service.technologies.map((technology) => <li key={technology} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{technology}</li>)}</ul> : <p className="mt-1 text-sm text-slate-500">No technologies recorded.</p>}
            </div>
            {service.uptimeTarget && <p><strong>Uptime target</strong> {service.uptimeTarget}</p>}
          </div>}
          {tab === "support" && <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">Default assignment team</dt><dd>{editingSupport ? <SelectDropdown label="Default assignment team" options={teams.map((team) => ({ value: team.id, label: team.name }))} value={supportDraft.defaultTeamId ?? ""} onChange={(defaultTeamId) => setSupportDraft({ ...supportDraft, defaultTeamId })} placeholder="Select a team" /> : <input readOnly aria-label="Default assignment team" className={formControlClassName} value={teamName(service.defaultTeamId) || "—"} />}</dd></div>
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">Escalation team</dt><dd>{editingSupport ? <SelectDropdown label="Escalation team" options={teams.map((team) => ({ value: team.id, label: team.name }))} value={supportDraft.escalationTeamId ?? ""} onChange={(escalationTeamId) => setSupportDraft({ ...supportDraft, escalationTeamId })} placeholder="Select a team" /> : <input readOnly aria-label="Escalation team" className={formControlClassName} value={teamName(service.escalationTeamId) || "—"} />}</dd></div>
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">On-call contact</dt><dd>{editingSupport ? <SelectDropdown label="On-call contact" options={employees.filter((item) => item.accountStatus !== "Disabled").map((employee) => ({ value: employee.id, label: employee.name }))} value={supportDraft.onCallContactId ?? ""} onChange={(onCallContactId) => setSupportDraft({ ...supportDraft, onCallContactId })} placeholder="Select a contact" /> : <input readOnly aria-label="On-call contact" className={formControlClassName} value={employees.find((item) => item.id === service.onCallContactId)?.name || "—"} />}</dd></div>
            </dl>
            <div><h3 className="mb-1 font-semibold">Escalation guidelines</h3><textarea readOnly={!editingSupport} aria-label="Escalation guidelines" className={`${formControlClassName} min-h-20 resize-y`} value={editingSupport ? supportDraft.escalationGuidelines ?? "" : service.escalationGuidelines || "No escalation guidelines recorded."} onChange={(event) => setSupportDraft({ ...supportDraft, escalationGuidelines: event.target.value })} />
              {editingSupport ? <label className="mt-3 block text-xs font-semibold text-slate-500">Runbook URL<input type="url" className={`${formControlClassName} mt-1`} value={supportDraft.runbookUrl ?? ""} onChange={(event) => setSupportDraft({ ...supportDraft, runbookUrl: event.target.value })} /></label> : service.runbookUrl && /^https?:\/\//i.test(service.runbookUrl) && <a className="mt-2 inline-block font-semibold text-teal-700 underline" href={service.runbookUrl} target="_blank" rel="noreferrer">Open runbook</a>}
            </div>
            <div className="overflow-x-auto">
              <h3 className="mb-2 font-semibold">Default SLA</h3>
              {editingSupport && <div className="mb-3 max-w-sm"><label className="block text-xs font-semibold text-slate-500">Fallback first-response target<input className={`${formControlClassName} mt-1`} value={supportDraft.slaTarget} onChange={(event) => setSupportDraft({ ...supportDraft, slaTarget: event.target.value })} placeholder="Example: 30m" /></label></div>}
              {!editingSupport && <p className="mb-2 text-xs text-slate-600">{calendar ? `${calendar.weekdays.map((day) => weekdays[day]).join(", ")} · ${calendar.opensAt}–${calendar.closesAt} · ${calendar.timeZone}` : "No support calendar configured."}</p>}
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900">
                <span className="material-symbols-outlined mt-0.5 text-base text-sky-700" aria-hidden="true">info</span>
                <div><h4 className="font-semibold">How SLA timers work</h4><p className="mt-0.5 leading-5 text-sky-800">Timers start when a ticket is created, count configured support hours, and stop when the first response is recorded or the ticket is resolved.</p></div>
              </div>
              {editingSupport ? <SlaPolicyFields value={supportDraft.slaPolicy ?? { targets: {} }} onChange={(slaPolicy) => setSupportDraft({ ...supportDraft, slaPolicy })} /> : <>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50"><tr>{["Priority", "First response", "Resolution"].map((label) => <th key={label} className="px-2 py-2">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-200">{ticketPriorities.map((priority) => {
                  const target = service.slaPolicy?.targets[priority];
                  const response = target?.responseMinutes ?? defaultResponse;
                  return <tr key={priority}><td className="px-2 py-2">{priority}</td><td className="px-2 py-2">{response ? `${response} min` : "—"}</td><td className="px-2 py-2">{target?.resolutionMinutes ? `${target.resolutionMinutes} min` : "—"}</td></tr>;
                })}</tbody>
              </table>
              </>}
            </div>
          </div>}
          {tab === "tickets" && <LinkedTickets tickets={visibleTickets} total={linkedTickets.length} search={ticketSearch} onSearch={setTicketSearch} statuses={ticketStatuses} onStatuses={setTicketStatuses} onOpenTicket={onOpenTicket} />}
          {tab === "contracts" && <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr>
                {["Company", "Contract", "Coverage active"].map((label) => <th key={label} className="px-3 py-2">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(({ company, contract }) => <tr key={contract.id}>
                  <td className="px-3 py-2.5"><Link className="font-semibold text-teal-700 hover:underline" to={`/companies/${encodeURIComponent(company.id)}?tab=contracts`}>{company.name}</Link></td>
                  <td className="px-3 py-2.5">{contract.reference}</td>
                  <td className="px-3 py-2.5">{isContractActive(contract) ? "Yes" : "No"}</td>
                </tr>)}
                {!contracts.length && <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-500">No company contracts linked to this service.</td></tr>}
              </tbody>
            </table>
          </div>}
          {tab === "companies" && <CompanyList companies={visibleCompanies} total={subscribedCompanies.length} allCompanies={subscribedCompanies} search={companySearch} onSearch={setCompanySearch} tiers={companyTiers} onTiers={setCompanyTiers} statuses={companyStatuses} onStatuses={setCompanyStatuses} />}
        </div>
      </section>
      {editing && <ServiceEditDialog service={service} services={services} departments={departments} employees={employees} onCancel={() => setEditing(false)} onSave={(updates) => {
        onUpdateService(updates);
        setEditing(false);
      }} />}
      {showDeleteConfirmation && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-service-title" aria-describedby="delete-service-description" className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700" aria-hidden="true"><span className="material-symbols-outlined block text-[22px] leading-none">warning</span></span>
            <div><h2 id="delete-service-title" className="text-base font-bold text-slate-900">Delete {service.name}?</h2>
              <p id="delete-service-description" className="mt-1.5 text-sm leading-5 text-slate-600">This permanently deletes the service and all {serviceTicketCount} linked {serviceTicketCount === 1 ? "ticket" : "tickets"}, including their history. To preserve ticket history, deactivate the service instead.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setShowDeleteConfirmation(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Keep service</button>
            <button type="button" onClick={() => { onUpdateService({ status: "Retired" }); setShowDeleteConfirmation(false); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Deactivate instead</button>
            <button type="button" onClick={onDeleteService} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete service</button>
          </div>
        </div>
      </div>}
      {confirmAction && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4" role="presentation">
        <div role="dialog" aria-modal="true" aria-labelledby="service-confirm-title" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <h2 id="service-confirm-title" className="text-base font-bold text-slate-900">{confirmAction.endsWith("save") ? `Save ${confirmAction.startsWith("support") ? "support & SLA" : "service detail"} changes?` : `Discard ${confirmAction.startsWith("support") ? "support & SLA" : "service detail"} changes?`}</h2>
          <p className="mt-1.5 text-sm text-slate-600">{confirmAction.endsWith("save") ? "Your changes will be applied to this service." : "Your unsaved changes will be lost."}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" autoFocus onClick={() => setConfirmAction(null)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Keep editing</button>
            <button type="button" onClick={() => {
              const save = confirmAction.endsWith("save");
              if (confirmAction.startsWith("details")) {
                if (save) onUpdateService({
                  description: descriptionDraft.trim(),
                  technologies: [...new Set(technologiesDraft.split(",").map((technology) => technology.trim()).filter(Boolean))],
                });
                else {
                  setDescriptionDraft(service.description);
                  setTechnologiesDraft(service.technologies.join(", "));
                }
                setEditingDetails(false);
              } else {
                if (save) onUpdateService({
                  defaultTeamId: supportDraft.defaultTeamId,
                  escalationTeamId: supportDraft.escalationTeamId,
                  onCallContactId: supportDraft.onCallContactId,
                  escalationGuidelines: supportDraft.escalationGuidelines?.trim(),
                  runbookUrl: supportDraft.runbookUrl?.trim(),
                  slaTarget: supportDraft.slaTarget.trim(),
                  slaPolicy: supportDraft.slaPolicy,
                });
                else setSupportDraft(service);
                setEditingSupport(false);
              }
              setConfirmAction(null);
            }} className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white ${confirmAction.endsWith("cancel") ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"}`}>{confirmAction.endsWith("save") ? "Save changes" : "Discard changes"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
};

const LinkedTickets: React.FC<{ tickets: Ticket[]; total: number; search: string; onSearch: (value: string) => void; statuses: string[]; onStatuses: (values: string[]) => void; onOpenTicket?: (id: string) => void }> = ({ tickets, total, search, onSearch, statuses, onStatuses, onOpenTicket }) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold text-[#1f2041]">Linked tickets <span className="font-medium text-slate-500">({total})</span></h2><span className="text-xs font-semibold text-slate-500"></span></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><TableSearch id="linked-ticket-search" value={search} onChange={onSearch} placeholder="Search tickets..." aria-label="Search linked tickets" className="w-full sm:w-96 lg:w-[32rem]" /><ComboboxFilter label="Status" placeholder="Search status..." options={[...new Set(tickets.map((ticket) => ticket.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} portal /></div>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase"><tr>{["Ticket", "Subject", "Status", "Priority", "Assignee", "Updated", "SLA"].map((heading) => <th key={heading} className="px-2.5 py-2 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{tickets.length ? tickets.map((ticket) => <tr key={ticket.id} className="hover:bg-slate-50/70"><td className="px-2.5 py-2.5"><button type="button" onClick={() => onOpenTicket?.(ticket.id)} className="font-bold text-[#0d6d77] hover:underline">{ticket.code}</button></td><td className="max-w-56 truncate px-2.5 py-2.5 font-medium text-slate-700">{ticket.title}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.status}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.priority.replace(/^P\d\s*/, "")}</td><td className="px-2.5 py-2.5 text-slate-600">{ticket.assignedToName || "Unassigned"}</td><td className="whitespace-nowrap px-2.5 py-2.5 text-slate-500">{ticket.timeAgo}</td><td className="whitespace-nowrap px-2.5 py-2.5 text-slate-600">{ticket.slaDeadline || ticket.slaRisk}</td></tr>) : <tr><td colSpan={7} className="px-2.5 py-6 text-center text-slate-500">{total ? "No tickets match these filters." : "No active tickets linked to this service."}</td></tr>}</tbody></table></div>
  </div>
);

const CompanyList: React.FC<{ companies: Company[]; total: number; allCompanies: Company[]; search: string; onSearch: (value: string) => void; tiers: string[]; onTiers: (values: string[]) => void; statuses: string[]; onStatuses: (values: string[]) => void }> = ({ companies, total, allCompanies, search, onSearch, tiers, onTiers, statuses, onStatuses }) => (
  <div><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold text-[#1f2041]">Subscribed client companies <span className="font-medium text-slate-500">({total})</span></h2><span className="text-xs font-semibold text-slate-500"></span></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><TableSearch id="subscribed-company-search" value={search} onChange={onSearch} placeholder="Search companies..." aria-label="Search subscribed companies" className="w-full sm:w-96 lg:w-[32rem]" /><div className="flex flex-wrap items-center gap-2"><ComboboxFilter label="Tier" placeholder="Filter tiers..." options={[...new Set(allCompanies.map((company) => company.tier))].map((item) => ({ value: item, label: item }))} selectedValues={tiers} onChange={onTiers} /><ComboboxFilter label="Status" placeholder="Filter status..." options={[...new Set(allCompanies.map((company) => company.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} /></div></div>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase"><tr>{["Company", "Tier", "Account manager", "Active tickets", "Status"].map((heading) => <th key={heading} className="px-2.5 py-2 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{companies.length ? companies.map((company) => <tr key={company.id} className="hover:bg-slate-50/70"><td className="px-2.5 py-2.5 font-semibold text-slate-900"><Link to={`/companies/${encodeURIComponent(company.id)}`} className="hover:text-teal-700 hover:underline">{company.name}</Link></td><td className="px-2.5 py-2.5 text-slate-600">{company.tier}</td><td className="px-2.5 py-2.5 text-slate-600">{company.accountManager}</td><td className="px-2.5 py-2.5 text-slate-600">{company.activeTickets}</td><td className="px-2.5 py-2.5 text-slate-600">{company.status}</td></tr>) : <tr><td colSpan={5} className="px-2.5 py-6 text-center text-slate-500">No subscribed companies found.</td></tr>}</tbody></table></div>
  </div>
);

