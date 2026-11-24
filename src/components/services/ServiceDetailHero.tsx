import React, { useMemo, useState } from "react";
import type { Company, Department, Employee, ServiceLine, Team, Ticket } from "../../types/barrel";
import { ExternalLink, ConfirmationDialog, DeleteDialog, DetailBanner, ActionLink, Button, DataTable, Heading, Icon, Input, Label, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, ComboboxFilter, SelectDropdown, TableSearch } from "../../ui/barrel";

import { useSearchParams } from "react-router-dom";
import { matchesService } from "../../utils/matchesService";
import { durationMinutes, isContractActive, ticketPriorities, weekdays } from "../../utils/supportPolicy";
import { ServiceEditDialog } from "./ServiceEditDialog";
import { SlaPolicyFields } from "../shared/SlaPolicyFields";

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
      <DetailBanner
        title={service.name}
        status={service.status}
        statusTone={service.status === "Operational" ? "positive" : "neutral"}
        columns={3}
        icon={service.logo ? <img src={service.logo} alt="" className="size-full object-cover" /> : <Icon className="text-[23px]">{serviceIcon(service.code)}</Icon>}
        metrics={[
          ["Service code", service.code],
          ["Owning department", service.department],
          ["Service lead", service.lead],
        ]}
        actions={<>
          {canEdit && <Button type="button" tone="inverse" size="small" onClick={() => setEditing(true)}>Edit Details</Button>}
          {canEdit && onDeleteService && <Button type="button" tone="inverseDanger" size="small" onClick={() => setShowDeleteConfirmation(true)}>Delete</Button>}
          <Button type="button" tone="inverse" size="small" onClick={() => setTab("tickets")}>View active tickets</Button>
          <Button type="button" tone="primary" size="small" onClick={() => setTab("support")}>Escalation guide</Button>
        </>}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-1.5">
          <div role="tablist" aria-label="Service information" className="flex min-w-0 gap-1 overflow-x-auto">
            {tabs.map(([id, label]) => <Button tone="plain" key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</Button>)}
          </div>
          {tab === "details" && canEdit && (editingDetails ? <div className="flex shrink-0 items-center gap-2">
            <Button size="small" type="button" onClick={() => setConfirmAction("details-cancel")}>Cancel</Button>
            <Button tone="plain" type="button" onClick={() => setConfirmAction("details-save")} className="rounded-lg bg-[#1f2041] px-3 py-1.5 text-xs font-semibold text-white">Save</Button>
          </div> : <Button tone="plain" type="button" onClick={() => {
            setDescriptionDraft(service.description);
            setTechnologiesDraft(service.technologies.join(", "));
            setEditingDetails(true);
          }} className="my-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"><Icon className="text-[15px]" aria-hidden="true">edit</Icon>Edit details</Button>)}
          {tab === "support" && canEdit && (editingSupport ? <div className="flex shrink-0 items-center gap-2">
            <Button size="small" type="button" onClick={() => setConfirmAction("support-cancel")}>Cancel</Button>
            <Button tone="plain" type="button" onClick={() => setConfirmAction("support-save")} className="rounded-lg bg-[#1f2041] px-3 py-1.5 text-xs font-semibold text-white">Save</Button>
          </div> : <Button tone="plain" type="button" onClick={() => { setSupportDraft(service); setEditingSupport(true); }} className="my-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"><Icon className="text-[15px]" aria-hidden="true">edit</Icon>Edit</Button>)}
        </div>
        <div className="p-3 pt-2 sm:p-4 sm:pt-2">
          {tab === "details" && <div className="space-y-3 text-sm">
            <div className="w-full">
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Description<Textarea readOnly={!editingDetails} className="mt-1 min-h-32 resize-y text-sm leading-6" value={editingDetails ? descriptionDraft : service.description || "No description."} onChange={(event) => setDescriptionDraft(event.target.value)} /></Label>
            </div>
            <div className="w-full">
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Technology stack</Label>
              {editingDetails ? <Input className="mt-1 text-sm" placeholder="Separate technologies with commas" value={technologiesDraft} onChange={(event) => setTechnologiesDraft(event.target.value)} /> : service.technologies.length > 0 ? <ul className="mt-2 flex flex-wrap gap-2">{service.technologies.map((technology) => <li key={technology} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{technology}</li>)}</ul> : <p className="mt-1 text-sm text-slate-500">No technologies recorded.</p>}
            </div>
            {service.uptimeTarget && <p><strong>Uptime target</strong> {service.uptimeTarget}</p>}
          </div>}
          {tab === "support" && <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">Default assignment team</dt><dd>{editingSupport ? <SelectDropdown label="Default assignment team" options={teams.map((team) => ({ value: team.id, label: team.name }))} value={supportDraft.defaultTeamId ?? ""} onChange={(defaultTeamId) => setSupportDraft({ ...supportDraft, defaultTeamId })} placeholder="Select a team" /> : <Input readOnly aria-label="Default assignment team" value={teamName(service.defaultTeamId) || "—"} />}</dd></div>
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">Escalation team</dt><dd>{editingSupport ? <SelectDropdown label="Escalation team" options={teams.map((team) => ({ value: team.id, label: team.name }))} value={supportDraft.escalationTeamId ?? ""} onChange={(escalationTeamId) => setSupportDraft({ ...supportDraft, escalationTeamId })} placeholder="Select a team" /> : <Input readOnly aria-label="Escalation team" value={teamName(service.escalationTeamId) || "—"} />}</dd></div>
              <div><dt className="mb-1 text-xs font-semibold text-slate-500">On-call contact</dt><dd>{editingSupport ? <SelectDropdown label="On-call contact" options={employees.filter((item) => item.accountStatus !== "Disabled").map((employee) => ({ value: employee.id, label: employee.name }))} value={supportDraft.onCallContactId ?? ""} onChange={(onCallContactId) => setSupportDraft({ ...supportDraft, onCallContactId })} placeholder="Select a contact" /> : <Input readOnly aria-label="On-call contact" value={employees.find((item) => item.id === service.onCallContactId)?.name || "—"} />}</dd></div>
            </dl>
            <div><Heading as="h3" variant="plain" className="mb-1 font-semibold">Escalation guidelines</Heading><Textarea readOnly={!editingSupport} aria-label="Escalation guidelines" className="min-h-20 resize-y" value={editingSupport ? supportDraft.escalationGuidelines ?? "" : service.escalationGuidelines || "No escalation guidelines recorded."} onChange={(event) => setSupportDraft({ ...supportDraft, escalationGuidelines: event.target.value })} />
              {editingSupport ? <Label variant="plain" className="mt-3 block text-xs font-semibold text-slate-500">Runbook URL<Input type="url" className="mt-1" value={supportDraft.runbookUrl ?? ""} onChange={(event) => setSupportDraft({ ...supportDraft, runbookUrl: event.target.value })} /></Label> : service.runbookUrl && /^https?:\/\//i.test(service.runbookUrl) && <ExternalLink className="mt-2 inline-block font-semibold text-teal-700 underline" href={service.runbookUrl} target="_blank" rel="noreferrer">Open runbook</ExternalLink>}
            </div>
            <div className="overflow-x-auto">
              <Heading as="h3" variant="plain" className="mb-2 font-semibold">Default SLA</Heading>
              {editingSupport && <div className="mb-3 max-w-sm"><Label variant="plain" className="block text-xs font-semibold text-slate-500">Fallback first-response target<Input className="mt-1" value={supportDraft.slaTarget} onChange={(event) => setSupportDraft({ ...supportDraft, slaTarget: event.target.value })} placeholder="Example: 30m" /></Label></div>}
              {!editingSupport && <p className="mb-2 text-xs text-slate-600">{calendar ? `${calendar.weekdays.map((day) => weekdays[day]).join(", ")} · ${calendar.opensAt}–${calendar.closesAt} · ${calendar.timeZone}` : "No support calendar configured."}</p>}
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900">
                <Icon className="mt-0.5 text-base text-sky-700" aria-hidden="true">info</Icon>
                <div><Heading as="h4" variant="plain" className="font-semibold">How SLA timers work</Heading><p className="mt-0.5 leading-5 text-sky-800">Timers start when a ticket is created, count configured support hours, and stop when the first response is recorded or the ticket is resolved.</p></div>
              </div>
              {editingSupport ? <SlaPolicyFields value={supportDraft.slaPolicy ?? { targets: {} }} onChange={(slaPolicy) => setSupportDraft({ ...supportDraft, slaPolicy })} /> : <>
              <DataTable>
                <TableHead tone="plain" className="bg-slate-50"><TableRow>{["Priority", "First response", "Resolution"].map((label) => <TableHeader density="compact" key={label}>{label}</TableHeader>)}</TableRow></TableHead>
                <TableBody className="divide-slate-200">{ticketPriorities.map((priority) => {
                  const target = service.slaPolicy?.targets[priority];
                  const response = target?.responseMinutes ?? defaultResponse;
                  return <TableRow key={priority}><TableCell density="compact">{priority}</TableCell><TableCell density="compact">{response ? `${response} min` : "—"}</TableCell><TableCell density="compact">{target?.resolutionMinutes ? `${target.resolutionMinutes} min` : "—"}</TableCell></TableRow>;
                })}</TableBody>
              </DataTable>
              </>}
            </div>
          </div>}
          {tab === "tickets" && <LinkedTickets tickets={visibleTickets} total={linkedTickets.length} search={ticketSearch} onSearch={setTicketSearch} statuses={ticketStatuses} onStatuses={setTicketStatuses} onOpenTicket={onOpenTicket} />}
          {tab === "contracts" && <div className="overflow-x-auto">
            <DataTable>
              <TableHead tone="plain" className="bg-slate-50 text-slate-500"><TableRow>
                {["Company", "Contract", "Coverage active"].map((label) => <TableHeader density="plain" key={label} className="px-3 py-2">{label}</TableHeader>)}
              </TableRow></TableHead>
              <TableBody>
                {contracts.map(({ company, contract }) => <TableRow key={contract.id}>
                  <TableCell density="narrow"><ActionLink className="font-semibold text-teal-700 hover:underline" to={`/companies/${encodeURIComponent(company.id)}?tab=contracts`}>{company.name}</ActionLink></TableCell>
                  <TableCell density="narrow">{contract.reference}</TableCell>
                  <TableCell density="narrow">{isContractActive(contract) ? "Yes" : "No"}</TableCell>
                </TableRow>)}
                {!contracts.length && <TableRow><TableCell density="plain" colSpan={3} className="px-3 py-6 text-center text-slate-500">No company contracts linked to this service.</TableCell></TableRow>}
              </TableBody>
            </DataTable>
          </div>}
          {tab === "companies" && <CompanyList companies={visibleCompanies} total={subscribedCompanies.length} allCompanies={subscribedCompanies} search={companySearch} onSearch={setCompanySearch} tiers={companyTiers} onTiers={setCompanyTiers} statuses={companyStatuses} onStatuses={setCompanyStatuses} />}
        </div>
      </section>
      {editing && <ServiceEditDialog service={service} services={services} departments={departments} employees={employees} onCancel={() => setEditing(false)} onSave={(updates) => {
        onUpdateService(updates);
        setEditing(false);
      }} />}
      {showDeleteConfirmation && onDeleteService && <DeleteDialog
        title={`Delete ${service.name}?`}
        description={`Permanent deletion removes the service and all ${serviceTicketCount} linked ${serviceTicketCount === 1 ? "ticket" : "tickets"}, including their history.`}
        verification={service.name}
        onCancel={() => setShowDeleteConfirmation(false)}
        onDelete={onDeleteService}
        deleteLabel="Delete service"
        alternative={{
          title: "Deactivate service",
          description: "Preserve the service and ticket history.",
          onClick: () => { onUpdateService({ status: "Retired" }); setShowDeleteConfirmation(false); },
        }}
      />}
      {confirmAction && <ConfirmationDialog
        title={`${confirmAction.endsWith("save") ? "Save" : "Discard"} ${confirmAction.startsWith("support") ? "support & SLA" : "service detail"} changes?`}
        description={confirmAction.endsWith("save") ? "Your changes will be applied to this service." : "Your unsaved changes will be lost."}
        cancelLabel="Keep editing"
        confirmLabel={confirmAction.endsWith("save") ? "Save changes" : "Discard changes"}
        onCancel={() => setConfirmAction(null)}
        danger={confirmAction.endsWith("cancel")}
        onConfirm={() => {
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

        }}
      />}
    </div>
  );
};

const LinkedTickets: React.FC<{ tickets: Ticket[]; total: number; search: string; onSearch: (value: string) => void; statuses: string[]; onStatuses: (values: string[]) => void; onOpenTicket?: (id: string) => void }> = ({ tickets, total, search, onSearch, statuses, onStatuses, onOpenTicket }) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3"><Heading variant="plain" className="text-base font-bold text-[#1f2041]">Linked tickets <span className="font-medium text-slate-500">({total})</span></Heading><span className="text-xs font-semibold text-slate-500"></span></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><TableSearch id="linked-ticket-search" value={search} onChange={onSearch} placeholder="Search tickets..." aria-label="Search linked tickets" className="w-full sm:w-96 lg:w-[32rem]" /><ComboboxFilter label="Status" placeholder="Search status..." options={[...new Set(tickets.map((ticket) => ticket.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} portal /></div>
    <div className="mt-3 overflow-x-auto"><DataTable className="min-w-[700px]"><TableHead tone="compact"><TableRow>{["Ticket", "Subject", "Status", "Priority", "Assignee", "Updated", "SLA"].map((heading) => <TableHeader density="plain" key={heading} className="px-2.5 py-2 font-bold">{heading}</TableHeader>)}</TableRow></TableHead><TableBody>{tickets.length ? tickets.map((ticket) => <TableRow key={ticket.id} className="hover:bg-slate-50/70"><TableCell density="plain" className="px-2.5 py-2.5"><Button tone="plain" type="button" onClick={() => onOpenTicket?.(ticket.id)} className="font-bold text-[#0d6d77] hover:underline">{ticket.code}</Button></TableCell><TableCell density="plain" className="max-w-56 truncate px-2.5 py-2.5 font-medium text-slate-700">{ticket.title}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{ticket.status}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{ticket.priority.replace(/^P\d\s*/, "")}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{ticket.assignedToName || "Unassigned"}</TableCell><TableCell density="plain" className="whitespace-nowrap px-2.5 py-2.5 text-slate-500">{ticket.timeAgo}</TableCell><TableCell density="plain" className="whitespace-nowrap px-2.5 py-2.5 text-slate-600">{ticket.slaDeadline || ticket.slaRisk}</TableCell></TableRow>) : <TableRow><TableCell density="plain" colSpan={7} className="px-2.5 py-6 text-center text-slate-500">{total ? "No tickets match these filters." : "No active tickets linked to this service."}</TableCell></TableRow>}</TableBody></DataTable></div>
  </div>
);

const CompanyList: React.FC<{ companies: Company[]; total: number; allCompanies: Company[]; search: string; onSearch: (value: string) => void; tiers: string[]; onTiers: (values: string[]) => void; statuses: string[]; onStatuses: (values: string[]) => void }> = ({ companies, total, allCompanies, search, onSearch, tiers, onTiers, statuses, onStatuses }) => (
  <div><div className="flex flex-wrap items-center justify-between gap-3"><Heading variant="plain" className="text-base font-bold text-[#1f2041]">Subscribed client companies <span className="font-medium text-slate-500">({total})</span></Heading><span className="text-xs font-semibold text-slate-500"></span></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><TableSearch id="subscribed-company-search" value={search} onChange={onSearch} placeholder="Search companies..." aria-label="Search subscribed companies" className="w-full sm:w-96 lg:w-[32rem]" /><div className="flex flex-wrap items-center gap-2"><ComboboxFilter label="Tier" placeholder="Filter tiers..." options={[...new Set(allCompanies.map((company) => company.tier))].map((item) => ({ value: item, label: item }))} selectedValues={tiers} onChange={onTiers} /><ComboboxFilter label="Status" placeholder="Filter status..." options={[...new Set(allCompanies.map((company) => company.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} /></div></div>
    <div className="mt-3 overflow-x-auto"><DataTable className="min-w-[600px]"><TableHead tone="compact"><TableRow>{["Company", "Tier", "Account manager", "Active tickets", "Status"].map((heading) => <TableHeader density="plain" key={heading} className="px-2.5 py-2 font-bold">{heading}</TableHeader>)}</TableRow></TableHead><TableBody>{companies.length ? companies.map((company) => <TableRow key={company.id} className="hover:bg-slate-50/70"><TableCell density="plain" className="px-2.5 py-2.5 font-semibold text-slate-900"><ActionLink to={`/companies/${encodeURIComponent(company.id)}`} className="hover:text-teal-700 hover:underline">{company.name}</ActionLink></TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{company.tier}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{company.accountManager}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{company.activeTickets}</TableCell><TableCell density="plain" className="px-2.5 py-2.5 text-slate-600">{company.status}</TableCell></TableRow>) : <TableRow><TableCell density="plain" colSpan={5} className="px-2.5 py-6 text-center text-slate-500">No subscribed companies found.</TableCell></TableRow>}</TableBody></DataTable></div>
  </div>
);

