import React, { useEffect, useState } from "react";
import type { Company, CustomerContact, Ticket } from "../../types/barrel";

interface CompanyDetailHeroProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updates: Partial<Company>) => void;
  canEdit?: boolean;
  tickets?: Ticket[];
  onOpenTicket?: (ticketId: string) => void;
}

type ProfileTab = "contact" | "account" | "system";
type WorkspaceTab = "contacts" | "tickets" | "contracts";

const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "account", label: "Account" },
  { id: "system", label: "System" },
];

const profileFields: Record<ProfileTab, { key: keyof Company; label: string; type?: string; readOnly?: boolean }[]> = {
  contact: [
    { key: "id", label: "Company ID", readOnly: true },
    { key: "code", label: "Company code", readOnly: true },
    { key: "name", label: "Company name" },
    { key: "contactName", label: "Primary contact" },
    { key: "contactRole", label: "Contact role" },
    { key: "contactEmail", label: "Email", type: "email" },
    { key: "contactPhone", label: "Phone", type: "tel" },
  ],
  account: [
    { key: "tier", label: "Account tier" },
    { key: "accountManager", label: "Account manager" },
    { key: "status", label: "Account status" },
    { key: "preferredChannel", label: "Preferred channel" },
    { key: "activeContracts", label: "Active contracts", type: "number" },
    { key: "subscribedServices", label: "Subscribed services" },
  ],
  system: [
    { key: "activeTickets", label: "Active tickets", type: "number", readOnly: true },
    { key: "slaResponseTime", label: "SLA response time" },
  ],
};
const displayValue = (value: unknown) => Array.isArray(value) ? value.join(", ") : String(value ?? "—");

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onBack,
  onUpdateCompany,
  canEdit = true,
  tickets = [],
  onOpenTicket,
}) => {
  const [draft, setDraft] = useState<Company>(company);
  const [isEditing, setIsEditing] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>("contact");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("contacts");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContracts, setIsEditingContracts] = useState(false);
  const [contractDraft, setContractDraft] = useState({ activeContracts: company.activeContracts, slaResponseTime: company.slaResponseTime, subscribedServices: company.subscribedServices });
  const [serviceToAdd, setServiceToAdd] = useState("");
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", phone: "" });
  const [confirmAction, setConfirmAction] = useState<"save" | "cancel" | null>(null);
  useEffect(() => setDraft(company), [company]);
  useEffect(() => setContractDraft({ activeContracts: company.activeContracts, slaResponseTime: company.slaResponseTime, subscribedServices: company.subscribedServices }), [company]);

  const updateField = (key: keyof Company, value: string) => setDraft((current) => ({
    ...current,
    [key]: key === "activeContracts" || key === "activeTickets" ? Number(value)
      : key === "subscribedServices" ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : value,
  }));
  const finishAction = () => {
    if (confirmAction === "save") onUpdateCompany(draft);
    else if (confirmAction === "cancel") setDraft(company);
    setConfirmAction(null);
    setIsEditing(false);
  };
  const contacts = company.contacts?.length ? company.contacts : [{ id: "primary", name: company.contactName, email: company.contactEmail, phone: company.contactPhone }];
  const openTickets = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  const addContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contact: CustomerContact = { id: `contact-${crypto.randomUUID()}`, ...newContact };
    onUpdateCompany({ contacts: [...contacts, contact] });
    setNewContact({ name: "", role: "", email: "", phone: "" });
    setIsAddingContact(false);
  };

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-teal-200" aria-hidden="true"><span className="material-symbols-outlined block translate-x-[1px] translate-y-[1px] text-[23px] leading-none">domain</span></span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white">{company.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <span>{company.tier}</span><span aria-hidden="true">·</span>
                <span className="rounded-full bg-teal-400/20 px-2 py-0.5 font-semibold text-teal-100">{company.status}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-center">
            <button type="button" onClick={() => setWorkspaceTab("contacts")} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">View contacts</button>
            <button type="button" onClick={() => setWorkspaceTab("tickets")} className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">View ticket activity</button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
          {[
            ["Account manager", company.accountManager, "person"],
            ["Primary contact", company.contactName, "support_agent"],
            ["SLA response", company.slaResponseTime, "bolt"],
            ["Active tickets", openTickets.length, "confirmation_number"],
          ].map(([label, value, icon]) => (
            <div key={label} className="flex min-w-0 items-center gap-2 border-r border-white/10 px-3 py-2.5 last:border-r-0 sm:px-4">
              <span className="material-symbols-outlined text-[17px] text-teal-200">{icon}</span>
              <div className="min-w-0"><p className="text-[10px] text-slate-300">{label}</p><p className="truncate text-xs font-semibold text-white">{value}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 pt-1.5" role="presentation">
          <div className="flex gap-1" role="tablist" aria-label="Company workspace">{([ ["contacts", "Contacts"], ["tickets", "Active Tickets"], ["contracts", "Contracts & Services"] ] as [WorkspaceTab, string][]).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={workspaceTab === id} type="button" onClick={() => setWorkspaceTab(id)} className={`border-b-2 px-3 py-2.5 text-xs font-bold ${workspaceTab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}{id === "tickets" ? ` (${openTickets.length})` : id === "contacts" ? ` (${contacts.length})` : ""}</button>
          ))}</div>
          {workspaceTab === "contacts" && <button type="button" onClick={() => setIsAddingContact(true)} disabled={!canEdit} className="mb-1 inline-flex items-center gap-1.5 rounded-lg bg-[#119DA4] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0E858D] disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true" className="material-symbols-outlined text-base">person_add</span>Add contact</button>}
          {workspaceTab === "contracts" && canEdit && <button type="button" onClick={() => { setContractDraft({ activeContracts: company.activeContracts, slaResponseTime: company.slaResponseTime, subscribedServices: [...company.subscribedServices] }); setIsEditingContracts(true); }} className="mb-1 inline-flex items-center gap-1.5 rounded-lg bg-[#119DA4] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0E858D]"><span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>Edit contracts & services</button>}
        </div>
        <div className="p-3 sm:p-4" role="tabpanel">
          {workspaceTab === "contacts" && <>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-[#4B3F72]"><tr><th className="px-2 py-2">Name</th><th className="px-2 py-2">Role</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Phone</th></tr></thead><tbody className="divide-y divide-slate-100">{contacts.map((contact) => <tr key={contact.id}><td className="whitespace-nowrap px-2 py-2.5 font-semibold text-[#1F2041]">{contact.name}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{("role" in contact && contact.role) || company.contactRole || "—"}</td><td className="whitespace-nowrap px-2 py-2.5 text-[#19647E]">{contact.email}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{contact.phone}</td></tr>)}</tbody></table></div>
          </>}
          {workspaceTab === "tickets" && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-2 py-2">Ticket</th><th className="px-2 py-2">Subject</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Priority</th><th className="px-2 py-2">Assignee</th><th className="px-2 py-2">Updated</th></tr></thead><tbody className="divide-y divide-slate-100">{openTickets.length ? openTickets.map((ticket) => <tr key={ticket.id}><td className="whitespace-nowrap px-2 py-2.5"><button type="button" className="font-bold text-indigo-700 hover:underline" onClick={() => onOpenTicket?.(ticket.id)}>{ticket.code}</button></td><td className="px-2 py-2.5 text-slate-700">{ticket.title}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.status}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.priority}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.assignedToName || "Unassigned"}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-500">{ticket.timeAgo}</td></tr>) : <tr><td className="px-2 py-6 text-center text-slate-500" colSpan={6}>No active tickets.</td></tr>}</tbody></table></div>}
          {workspaceTab === "contracts" && <>{company.subscribedServices.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{company.subscribedServices.map((service) => <div key={service} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700" aria-hidden="true"><span className="material-symbols-outlined block translate-x-[1px] translate-y-[1px] text-[18px] leading-none">cloud</span></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{service}</p><p className="text-[10px] text-slate-500">SLA: {company.slaResponseTime} response</p></div><span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800">Active</span></div>)}</div> : <p className="py-6 text-center text-xs text-slate-500">No contracts or services are linked to this company.</p>}</>}
        </div>
      </section>

      {isAddingContact && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2041]/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddingContact(false); }}><section role="dialog" aria-modal="true" aria-labelledby="add-contact-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#4B3F72]/20 bg-white shadow-2xl"><div className="bg-gradient-to-r from-[#1F2041] via-[#4B3F72] to-[#119DA4] px-6 py-5 text-white"><h2 id="add-contact-title" className="text-lg font-bold">Add company contact</h2><p className="mt-1 text-sm text-white/80">Add a contact for {company.name}.</p></div><form onSubmit={addContact} className="space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2">{([ ["name", "Full name", "text"], ["role", "Role", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"] ] as const).map(([key, label, type]) => <label key={key} className="block text-xs font-semibold text-[#4B3F72]">{label}<input required type={type} value={newContact[key]} onChange={(event) => setNewContact((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-[#1F2041] outline-none focus:border-[#119DA4] focus:ring-2 focus:ring-[#119DA4]/20" /></label>)}</div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setIsAddingContact(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#4B3F72] hover:bg-[#f4f3f6]">Cancel</button><button type="submit" className="rounded-lg bg-[#119DA4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E858D]">Add contact</button></div></form></section></div>}

      {isEditingContracts && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2041]/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditingContracts(false); }}><section role="dialog" aria-modal="true" aria-labelledby="edit-contracts-title" className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#4B3F72]/20 bg-white shadow-2xl"><div className="bg-gradient-to-r from-[#1F2041] via-[#4B3F72] to-[#119DA4] px-6 py-5 text-white"><h2 id="edit-contracts-title" className="text-lg font-bold">Edit contracts & services</h2><p className="mt-1 text-sm text-white/80">Manage the contract details and services linked to {company.name}.</p></div><form onSubmit={(event) => { event.preventDefault(); onUpdateCompany({ activeContracts: Math.max(0, contractDraft.activeContracts), slaResponseTime: contractDraft.slaResponseTime.trim(), subscribedServices: contractDraft.subscribedServices }); setIsEditingContracts(false); }} className="space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Active contracts<input min="0" type="number" value={contractDraft.activeContracts} onChange={(event) => setContractDraft((current) => ({ ...current, activeContracts: Number(event.target.value) }))} className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-teal-600 focus:outline-none" /></label><label className="text-xs font-semibold text-slate-600">SLA response time<input required value={contractDraft.slaResponseTime} onChange={(event) => setContractDraft((current) => ({ ...current, slaResponseTime: event.target.value }))} placeholder="e.g. 15m" className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-teal-600 focus:outline-none" /></label></div><fieldset><legend className="mb-2 text-xs font-semibold text-slate-600">Linked services</legend><div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">{company.subscribedServices.map((service) => <label key={service} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={contractDraft.subscribedServices.includes(service)} onChange={(event) => setContractDraft((current) => ({ ...current, subscribedServices: event.target.checked ? [...current.subscribedServices, service] : current.subscribedServices.filter((item) => item !== service) }))} className="h-4 w-4 rounded border-slate-300 accent-teal-600" />{service}</label>)}{company.subscribedServices.length === 0 && <p className="text-sm text-slate-500">No linked services yet. Add one below.</p>}</div></fieldset><label className="block text-xs font-semibold text-slate-600">Add service<input value={serviceToAdd} onChange={(event) => setServiceToAdd(event.target.value)} placeholder="Enter a service name" className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-teal-600 focus:outline-none" /></label><div className="flex justify-between gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => { if (serviceToAdd.trim() && !contractDraft.subscribedServices.includes(serviceToAdd.trim())) setContractDraft((current) => ({ ...current, subscribedServices: [...current.subscribedServices, serviceToAdd.trim()] })); setServiceToAdd(""); }} disabled={!serviceToAdd.trim()} className="rounded-lg border border-teal-700/30 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50">Add service</button><div className="flex gap-2"><button type="button" onClick={() => setIsEditingContracts(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-lg bg-[#119DA4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E858D]">Save changes</button></div></div></form></section></div>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-sm font-bold text-slate-900">Company details</h2>
          {!isEditing && canEdit ? <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><span className="material-symbols-outlined text-[15px]">edit</span>Edit</button> : isEditing ? <div className="flex gap-2"><button type="button" onClick={() => setConfirmAction("cancel")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={() => setConfirmAction("save")} className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Save</button></div> : null}
        </div>
        <div className="flex gap-1 border-b border-slate-200 px-3" role="tablist" aria-label="Company detail categories">{profileTabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeProfileTab === tab.id} type="button" onClick={() => setActiveProfileTab(tab.id)} className={`border-b-2 px-3 py-2 text-[11px] font-semibold ${activeProfileTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab.label}</button>)}</div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {profileFields[activeProfileTab].map((field) => <label key={field.key} className="min-w-0 text-[10px] font-semibold text-slate-500">{field.label}{isEditing && !field.readOnly ? <input type={field.type || "text"} value={displayValue(draft[field.key])} onChange={(event) => updateField(field.key, event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /> : <span className="mt-1 block truncate text-xs font-medium text-slate-900">{displayValue(draft[field.key])}</span>}</label>)}
        </div>
      </section>

      {confirmAction && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-lg font-bold text-slate-900">{confirmAction === "save" ? "Save changes?" : "Discard changes?"}</h3><p className="mt-2 text-sm text-slate-500">{confirmAction === "save" ? "Your company details will be updated." : "Your unsaved changes will be lost."}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirmAction(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Go back</button><button type="button" onClick={finishAction} className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmAction === "save" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}`}>{confirmAction === "save" ? "Save changes" : "Discard"}</button></div></div></div>}
    </div>
  );
};
