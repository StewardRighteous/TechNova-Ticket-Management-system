import React, { useMemo, useState } from "react";
import type { Company, Department, Employee, ServiceLine, Team, Ticket } from "../../types/barrel";
import { CategoryBadge, PriorityBadge, TableValue, ClearTableFiltersButton, ExternalLink, DeleteDialog, DetailBanner, DetailEditForm, DetailFieldGroup, FormField, ActionLink, Button, PaginatedDataTable, Heading, Icon, Input, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, ComboboxFilter, SelectDropdown, TableSearch } from "../../ui/barrel";

import { useSearchParams } from "react-router-dom";
import { matchesService } from "../../utils/matchesService";
import { durationMinutes, isContractActive, ticketPriorities, weekdays } from "../../utils/supportPolicy";
import { ServiceGeneralForm } from "./ServiceGeneralForm";
import { RelatedTicketsTable } from "../shared/RelatedTicketsTable";
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
}
type Tab = "general" | "details" | "support" | "tickets" | "companies" | "contracts";
const tabs: [Tab, string][] = [["general", "General"], ["details", "Service details"], ["support", "Support & SLA"], ["tickets", "Linked tickets"], ["companies", "Subscribed companies"], ["contracts", "Contracts"]];
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
}) => {
  const [params, setParams] = useSearchParams();
  const tab = tabs.find(([id]) => id === params.get("tab"))?.[0] ?? "general";
  const setTab = (next: Tab) => setParams({ tab: next }, { replace: true });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [supportChanges, setSupportChanges] = useState<Partial<ServiceLine>>({});
  const supportDraft = { ...service, ...supportChanges };
  const updateSupport = (changes: Partial<ServiceLine>) => setSupportChanges((current) => ({ ...current, ...changes }));
  const cancelSupportSection = (keys: (keyof ServiceLine)[]) => setSupportChanges((current) => {
    const next = { ...current };
    keys.forEach((key) => { delete next[key]; });
    return next;
  });
  const saveSupportSection = (keys: (keyof ServiceLine)[]) => {
    const updates = Object.fromEntries(keys.map((key) => [key, supportDraft[key]])) as Partial<ServiceLine>;
    if (keys.includes("escalationGuidelines") && updates.escalationGuidelines !== undefined) updates.escalationGuidelines = updates.escalationGuidelines.trim();
    if (keys.includes("runbookUrl") && updates.runbookUrl !== undefined) updates.runbookUrl = updates.runbookUrl.trim();
    if (keys.includes("slaTarget") && updates.slaTarget !== undefined) updates.slaTarget = updates.slaTarget.trim();
    onUpdateService(updates);
    cancelSupportSection(keys);
    return true;
  };
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [technologiesDraft, setTechnologiesDraft] = useState<string | null>(null);
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
          {canEdit && onDeleteService && <Button type="button" tone="inverseDanger" size="small" onClick={() => setShowDeleteConfirmation(true)}>Delete</Button>}
          <Button type="button" tone="inverse" size="small" onClick={() => setTab("tickets")}>View active tickets</Button>
          <Button type="button" tone="primary" size="small" onClick={() => setTab("support")}>Escalation guide</Button>
        </>}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-3 pt-1.5">
          <div role="tablist" aria-label="Service information" className="flex min-w-0 gap-1 overflow-x-auto">
            {tabs.map(([id, label]) => <Button tone="plain" key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}{id === "tickets" ? ` (${linkedTickets.length})` : ""}</Button>)}
          </div>
        </div>
        <div className="p-3 sm:p-4" role="tabpanel">
          <div hidden={tab !== "general"}>
            <ServiceGeneralForm service={service} services={services} departments={departments} employees={employees} canEdit={canEdit} onSave={onUpdateService} />
          </div>
          <div hidden={tab !== "details"}>
            <DetailEditForm title="Service details" titleIcon="description" canEdit={canEdit} layout="grouped"
              onCancel={() => { setDescriptionDraft(null); setTechnologiesDraft(null); }}
              onSave={() => {
                onUpdateService({
                  description: (descriptionDraft ?? service.description).trim(),
                  technologies: technologiesDraft === null ? service.technologies : [...new Set(technologiesDraft.split(",").map((technology) => technology.trim()).filter(Boolean))],
                });
                setDescriptionDraft(null);
                setTechnologiesDraft(null);
                return true;
              }}
            >
              {(editing) => <>
                <FormField label="Description" density="compact" className="col-span-full">
                  <Textarea appearance="compact" readOnly={!editing} rows={3} className="field-sizing-content resize-none"
                    value={editing ? descriptionDraft ?? service.description : service.description || "N/A"}
                    onChange={(event) => setDescriptionDraft(event.target.value)} />
                </FormField>
                {service.uptimeTarget && <FormField label="Uptime target" density="compact">
                  <Input appearance="compact" value={service.uptimeTarget} readOnly />
                </FormField>}
                <DetailFieldGroup title="Technology stack">
                  {editing ? <FormField label="Technologies" density="compact" className="col-span-full">
                    <Input appearance="compact" placeholder="Separate technologies with commas" value={technologiesDraft ?? service.technologies.join(", ")} onChange={(event) => setTechnologiesDraft(event.target.value)} />
                  </FormField> : service.technologies.length > 0 ? (
                    <ul className="col-span-full flex flex-wrap gap-2">{service.technologies.map((technology) => (
                      <li key={technology} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{technology}</li>
                    ))}</ul>
                  ) : <p className="text-xs text-slate-600">N/A</p>}
                </DetailFieldGroup>
              </>}
            </DetailEditForm>
          </div>
          <div hidden={tab !== "support"}>
            <div className="divide-y divide-slate-200 [&>form]:py-3 [&>form:first-child]:pt-0 [&>form:last-child]:pb-0">
                <DetailEditForm title="Assignment and escalation" titleIcon="groups" canEdit={canEdit} layout="grid"
                  onCancel={() => cancelSupportSection(["defaultTeamId", "escalationTeamId", "onCallContactId"])}
                  onSave={() => saveSupportSection(["defaultTeamId", "escalationTeamId", "onCallContactId"])}
                >
                  {(editing) => <>
                  {editing ? <>
                    <SelectDropdown showLabel density="compact" label="Default assignment team" options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={supportDraft.defaultTeamId ?? ""} onChange={(defaultTeamId) => updateSupport({ defaultTeamId })} placeholder="Select a team" />
                    <SelectDropdown showLabel density="compact" label="Escalation team" options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={supportDraft.escalationTeamId ?? ""} onChange={(escalationTeamId) => updateSupport({ escalationTeamId })} placeholder="Select a team" />
                    <SelectDropdown showLabel density="compact" label="On-call contact" options={employees.filter((item) => item.accountStatus !== "Disabled").map(({ id, name }) => ({ value: id, label: name }))} value={supportDraft.onCallContactId ?? ""} onChange={(onCallContactId) => updateSupport({ onCallContactId })} placeholder="Select a contact" />
                  </> : <>
                    <FormField label="Default assignment team" density="compact"><Input appearance="compact" readOnly value={teamName(service.defaultTeamId) || "N/A"} /></FormField>
                    <FormField label="Escalation team" density="compact"><Input appearance="compact" readOnly value={teamName(service.escalationTeamId) || "N/A"} /></FormField>
                    <FormField label="On-call contact" density="compact"><Input appearance="compact" readOnly value={employees.find(({ id }) => id === service.onCallContactId)?.name || "N/A"} /></FormField>
                  </>}
                  </>}
                </DetailEditForm>
                <DetailEditForm title="Escalation instructions" titleIcon="campaign" canEdit={canEdit} layout="grid"
                  onCancel={() => cancelSupportSection(["escalationGuidelines", "runbookUrl"])}
                  onSave={() => saveSupportSection(["escalationGuidelines", "runbookUrl"])}
                >
                  {(editing) => <>
                  <FormField label="Guidelines" density="compact" className="col-span-full">
                    <Textarea appearance="compact" readOnly={!editing} rows={2} className="field-sizing-content resize-none"
                      value={editing ? supportDraft.escalationGuidelines ?? "" : service.escalationGuidelines || "N/A"}
                      onChange={(event) => updateSupport({ escalationGuidelines: event.target.value })} />
                  </FormField>
                  {editing ? <FormField label="Runbook URL" density="compact" className="col-span-full">
                    <Input appearance="compact" type="url" value={supportDraft.runbookUrl ?? ""} onChange={(event) => updateSupport({ runbookUrl: event.target.value })} />
                  </FormField> : service.runbookUrl && /^https?:\/\//i.test(service.runbookUrl) && (
                    <div className="col-span-full">
                      <ExternalLink className="text-xs font-semibold text-teal-700 underline" href={service.runbookUrl} target="_blank" rel="noreferrer">Open runbook</ExternalLink>
                    </div>
                  )}
                  </>}
                </DetailEditForm>
                <DetailEditForm title="Default SLA" titleIcon="timer" canEdit={canEdit} layout="grid"
                  onCancel={() => cancelSupportSection(["slaTarget", "slaPolicy"])}
                  onSave={() => saveSupportSection(["slaTarget", "slaPolicy"])}
                >
                  {(editing) => <>
                  {editing ? <FormField label="Fallback first-response target" density="compact">
                    <Input appearance="compact" value={supportDraft.slaTarget} onChange={(event) => updateSupport({ slaTarget: event.target.value })} placeholder="Example: 30m" />
                  </FormField> : <FormField label="Support calendar" density="compact" className="col-span-full">
                    <Input appearance="compact" readOnly value={calendar ? calendar.weekdays.map((day) => weekdays[day]).join(", ") + " · " + calendar.opensAt + "–" + calendar.closesAt + " · " + calendar.timeZone : "N/A"} />
                  </FormField>}
                  <div className="col-span-full">
                    {editing ? <SlaPolicyFields value={supportDraft.slaPolicy ?? { targets: {} }} onChange={(slaPolicy) => updateSupport({ slaPolicy })} /> : (
                      <PaginatedDataTable rows={ticketPriorities}>
                        {(pageRows) => <>
                          <TableHead tone="plain" className="bg-slate-50"><TableRow>{["Priority", "First response", "Resolution"].map((label) => <TableHeader density="compact" key={label}>{label}</TableHeader>)}</TableRow></TableHead>
                          <TableBody className="divide-slate-200">{pageRows.map((priority) => {
                            const target = service.slaPolicy?.targets[priority];
                            const response = target?.responseMinutes ?? defaultResponse;
                            return <TableRow key={priority}><TableCell density="compact"><PriorityBadge priority={priority} showCode /></TableCell><TableCell density="compact"><TableValue icon="schedule">{response ? response + " min" : undefined}</TableValue></TableCell><TableCell density="compact"><TableValue icon="timer">{target?.resolutionMinutes ? target.resolutionMinutes + " min" : undefined}</TableValue></TableCell></TableRow>;
                          })}</TableBody>
                        </>}
                      </PaginatedDataTable>
                    )}
                  </div>
                  <div className="col-span-full flex gap-2 text-xs text-slate-600">
                    <Icon aria-hidden="true" className="text-base text-teal-700">info</Icon>
                    <p>Timers start when a ticket is created, count configured support hours, and stop when the first response is recorded or the ticket is resolved.</p>
                  </div>
                  </>}
                </DetailEditForm>
            </div>
          </div>
          {tab === "tickets" && <LinkedTickets tickets={visibleTickets} total={linkedTickets.length} search={ticketSearch} onSearch={setTicketSearch} statuses={ticketStatuses} onStatuses={setTicketStatuses} />}
          {tab === "contracts" && (
            <PaginatedDataTable rows={contracts} scroll>
              {(pageRows) => <>
                <TableHead tone="plain" className="bg-slate-50 text-slate-500"><TableRow>
                  {["Company", "Contract", "Coverage active"].map((label) => <TableHeader density="narrow" key={label}>{label}</TableHeader>)}
                </TableRow></TableHead>
                <TableBody>
                  {pageRows.map(({ company, contract }) => <TableRow key={contract.id}>
                    <TableCell density="narrow"><ActionLink className="font-semibold text-teal-700 hover:underline" to={`/companies/${encodeURIComponent(company.id)}?tab=contracts`}>{company.name}</ActionLink></TableCell>
                    <TableCell density="narrow">{contract.reference}</TableCell>
                    <TableCell density="narrow"><CategoryBadge variant="flag" category={isContractActive(contract) ? "Yes" : "No"} /></TableCell>
                  </TableRow>)}
                  {!contracts.length && <TableRow><TableCell density="plain" colSpan={3} className="px-3 py-6 text-center text-slate-500">No company contracts linked to this service.</TableCell></TableRow>}
                </TableBody>
              </>}
            </PaginatedDataTable>
          )}
          {tab === "companies" && <CompanyList companies={visibleCompanies} total={subscribedCompanies.length} allCompanies={subscribedCompanies} search={companySearch} onSearch={setCompanySearch} tiers={companyTiers} onTiers={setCompanyTiers} statuses={companyStatuses} onStatuses={setCompanyStatuses} />}
        </div>
      </section>
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
    </div>
  );
};

const LinkedTickets: React.FC<{ tickets: Ticket[]; total: number; search: string; onSearch: (value: string) => void; statuses: string[]; onStatuses: (values: string[]) => void }> = ({ tickets, total, search, onSearch, statuses, onStatuses }) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-2"><TableSearch id="linked-ticket-search" value={search} onChange={onSearch} placeholder="Search tickets..." aria-label="Search linked tickets" className="w-full sm:w-96 lg:w-[32rem]" /><ComboboxFilter hideClear label="Status" placeholder="Search status..." options={[...new Set(tickets.map((ticket) => ticket.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} portal />{statuses.length > 0 && <ClearTableFiltersButton onClear={() => onStatuses([])} />}</div>
    <div className="mt-3">
      <RelatedTicketsTable tickets={tickets} emptyMessage={total ? "No tickets match these filters." : "No active tickets linked to this service."} />
    </div>
  </div>
);

const CompanyList: React.FC<{ companies: Company[]; total: number; allCompanies: Company[]; search: string; onSearch: (value: string) => void; tiers: string[]; onTiers: (values: string[]) => void; statuses: string[]; onStatuses: (values: string[]) => void }> = ({ companies, total, allCompanies, search, onSearch, tiers, onTiers, statuses, onStatuses }) => (
  <div><div className="flex flex-wrap items-center justify-between gap-3"><Heading variant="plain" className="text-base font-bold text-[#1f2041]">Subscribed client companies <span className="font-medium text-slate-500">({total})</span></Heading><span className="text-xs font-semibold text-slate-500"></span></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><TableSearch id="subscribed-company-search" value={search} onChange={onSearch} placeholder="Search companies..." aria-label="Search subscribed companies" className="w-full sm:w-96 lg:w-[32rem]" /><div className="flex flex-wrap items-center gap-2"><ComboboxFilter hideClear label="Tier" placeholder="Filter tiers..." options={[...new Set(allCompanies.map((company) => company.tier))].map((item) => ({ value: item, label: item }))} selectedValues={tiers} onChange={onTiers} /><ComboboxFilter hideClear label="Status" placeholder="Filter status..." options={[...new Set(allCompanies.map((company) => company.status))].map((item) => ({ value: item, label: item }))} selectedValues={statuses} onChange={onStatuses} />{(tiers.length > 0 || statuses.length > 0) && <ClearTableFiltersButton onClear={() => { onTiers([]); onStatuses([]); }} />}</div></div>
    <div className="mt-3"><PaginatedDataTable rows={companies} scroll className="min-w-[600px]">{(pageRows) => <><TableHead tone="compact"><TableRow>{["Company", "Tier", "Account manager", "Active tickets", "Status"].map((heading) => <TableHeader density="snug" key={heading}>{heading}</TableHeader>)}</TableRow></TableHead><TableBody>{companies.length ? pageRows.map((company) => <TableRow key={company.id} className="hover:bg-slate-50/70"><TableCell density="snug" className="font-semibold text-slate-900"><ActionLink to={`/companies/${encodeURIComponent(company.id)}`} className="hover:text-teal-700 hover:underline">{company.name}</ActionLink></TableCell><TableCell density="snug" className="text-slate-600"><CategoryBadge variant="tier" category={company.tier} /></TableCell><TableCell density="snug" className="text-slate-600"><TableValue icon="person">{company.accountManager}</TableValue></TableCell><TableCell density="snug" className="text-slate-600"><TableValue icon="confirmation_number">{company.activeTickets}</TableValue></TableCell><TableCell density="snug" className="text-slate-600"><CategoryBadge variant="status" category={company.status} /></TableCell></TableRow>) : <TableRow><TableCell density="plain" colSpan={5} className="px-2.5 py-6 text-center text-slate-500">No subscribed companies found.</TableCell></TableRow>}</TableBody></>}</PaginatedDataTable></div>
  </div>
);

