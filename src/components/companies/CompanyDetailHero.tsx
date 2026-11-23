import React, { useState } from "react";
import type { Company, CustomerContact, Employee, ServiceLine, Ticket } from "../../types/barrel";
import { ComboboxFilter, TableSearch } from "../common/barrel";
import { CompanyContracts } from "./CompanyContracts";
import { DetailEditDialog } from "../common/DetailEditDialog";
import { formControlClassName, SelectDropdown } from "../common/barrel";
import { useSearchParams } from "react-router-dom";

interface CompanyDetailHeroProps {
  company: Company;
  onUpdateCompany: (updates: Partial<Company>) => void;
  onDeleteCompany?: (permanent: boolean) => void;
  canEdit?: boolean;
  tickets?: Ticket[];
  onOpenTicket?: (ticketId: string) => void;
  services?: ServiceLine[];
  companies?: Company[];
  employees?: Employee[];
  getServiceHref?: (service: ServiceLine) => string | undefined;
}

type WorkspaceTab = "contacts" | "tickets" | "contracts";

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onUpdateCompany,
  onDeleteCompany,
  canEdit = true,
  tickets = [],
  onOpenTicket,
  services = [],
  getServiceHref,
}) => {
  const [draft, setDraft] = useState<Company>(company);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [editError, setEditError] = useState("");
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const workspaceTab: WorkspaceTab = requestedTab === "tickets" || requestedTab === "contracts" ? requestedTab : "contacts";
  const setWorkspaceTab = (tab: WorkspaceTab) => setParams({ tab }, { replace: true });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactFlags, setContactFlags] = useState({ primary: false, escalation: false });
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", phone: "" });
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<CustomerContact | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [contactRoleFilter, setContactRoleFilter] = useState<string[]>([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string[]>([]);
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string[]>([]);
  const uploadCompanyLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, logo: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const contacts: CustomerContact[] = company.contacts?.length ? company.contacts : [{ id: `legacy-${company.id}`, name: company.contactName, role: company.contactRole, email: company.contactEmail, phone: company.contactPhone }];
  const primaryContact = contacts.find((contact) => contact.id === company.primaryContactId)
    ?? contacts.find((contact) => contact.email === company.contactEmail)
    ?? contacts.find((contact) => contact.name === company.contactName)
    ?? contacts[0];
  const escalationContact = contacts.find((contact) => contact.id === company.escalationContactId);
  const openTickets = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  const relatedTicketCount = tickets.length;
  const contactRoles = [...new Set(contacts.map((contact) => contact.role || "Unspecified"))];
  const filteredContacts = contacts.filter((contact) => {
    const query = contactSearch.trim().toLowerCase();
    const matchesSearch = !query || [contact.name, contact.role, contact.email, contact.phone].some((value) => value?.toLowerCase().includes(query));
    const role = contact.role || "Unspecified";
    return matchesSearch && (!contactRoleFilter.length || contactRoleFilter.includes(role));
  });
  const filteredTickets = openTickets.filter((ticket) => {
    const query = ticketSearch.trim().toLowerCase();
    const matchesSearch = !query || [ticket.code, ticket.title, ticket.assignedToName, ticket.status, ticket.priority].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (!ticketStatusFilter.length || ticketStatusFilter.includes(ticket.status)) && (!ticketPriorityFilter.length || ticketPriorityFilter.includes(ticket.priority));
  });
  const addContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contact: CustomerContact = { id: `contact-${crypto.randomUUID()}`, ...newContact };
    onUpdateCompany({
      contacts: [...contacts, contact],
      ...(contactFlags.primary ? { primaryContactId: contact.id, contactName: contact.name, contactRole: contact.role, contactEmail: contact.email, contactPhone: contact.phone } : {}),
      ...(contactFlags.escalation ? { escalationContactId: contact.id } : {}),
    });
    setNewContact({ name: "", role: "", email: "", phone: "" });
    setContactFlags({ primary: false, escalation: false });
    setIsAddingContact(false);
  };
  const editContact = (contact: CustomerContact) => {
    setEditingContact(contact);
    setNewContact({ name: contact.name, role: contact.role || "", email: contact.email, phone: contact.phone });
    setContactFlags({ primary: contact.id === primaryContact.id, escalation: contact.id === escalationContact?.id });
  };
  const saveContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingContact) return;
    const updatedContact = { ...editingContact, ...newContact };
    const remainingPrimaryId = editingContact.id === primaryContact.id && !contactFlags.primary ? contacts.find((item) => item.id !== editingContact.id)?.id : primaryContact.id;
    const remainingPrimary = contacts.find((item) => item.id === remainingPrimaryId);
    onUpdateCompany({
      contacts: contacts.map((contact) => contact.id === editingContact.id ? updatedContact : contact),
      primaryContactId: contactFlags.primary ? updatedContact.id : remainingPrimaryId,
      contactName: contactFlags.primary ? updatedContact.name : remainingPrimary?.name,
      contactRole: contactFlags.primary ? updatedContact.role || "" : remainingPrimary?.role || "",
      contactEmail: contactFlags.primary ? updatedContact.email : remainingPrimary?.email,
      contactPhone: contactFlags.primary ? updatedContact.phone : remainingPrimary?.phone,
      escalationContactId: contactFlags.escalation ? updatedContact.id : editingContact.id === escalationContact?.id ? undefined : escalationContact?.id,
    });
    setEditingContact(null);
    setNewContact({ name: "", role: "", email: "", phone: "" });
    setContactFlags({ primary: false, escalation: false });
  };
  const deleteContact = (contact: CustomerContact) => {
    if (contacts.length <= 1) return;
    setContactToDelete(contact);
  };
  const confirmDeleteContact = () => {
    if (!contactToDelete) return;
    const contact = contactToDelete;
    const remaining = contacts.filter((item) => item.id !== contact.id);
    const nextPrimary = contact.id === primaryContact.id ? remaining[0] : primaryContact;
    onUpdateCompany({
      contacts: remaining, primaryContactId: nextPrimary.id,
      contactName: nextPrimary.name, contactRole: nextPrimary.role ?? "",
      contactEmail: nextPrimary.email, contactPhone: nextPrimary.phone,
      escalationContactId: contact.id === escalationContact?.id || nextPrimary.id === escalationContact?.id ? undefined : escalationContact?.id,
    });
    setContactToDelete(null);
  };

  return (
    <div className="space-y-3">
      {contactToDelete && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setContactToDelete(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="delete-contact-title" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"><h2 id="delete-contact-title" className="text-base font-bold text-slate-900">Delete {contactToDelete.name}?</h2><p className="mt-2 text-sm text-slate-600">This contact will be removed from {company.name}.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setContactToDelete(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={confirmDeleteContact} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Delete contact</button></div></section></div>}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/70 bg-white shadow-sm" aria-hidden="true">{company.logo?.includes("#") ? <svg className="h-11 w-11" viewBox="0 0 32 32"><use href={`/${company.logo}`} /></svg> : company.logo ? <img src={company.logo} alt="" className="h-11 w-11 object-contain" /> : <span className="material-symbols-outlined text-[26px] leading-none text-teal-800">domain</span>}</span>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-white">{company.name}</h1>
                <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-xs font-semibold text-teal-100">{company.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <span>{company.tier}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-center">
            {canEdit && <button type="button" onClick={() => { setDraft(company); setEditError(""); setIsEditing(true); }} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Edit Details</button>}
            {canEdit && <button type="button" onClick={() => { setDeleteConfirmation(""); setIsDeleteDialogOpen(true); }} className="rounded-lg border border-red-300/50 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">Delete company</button>}
            <button type="button" onClick={() => setWorkspaceTab("contacts")} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">View contacts</button>
            <button type="button" onClick={() => setWorkspaceTab("tickets")} className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">View ticket activity</button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
          {[
            ["Account manager", company.accountManager, "person"],
            ["Primary contact", primaryContact.name, "support_agent"],
            ["Active tickets", openTickets.length, "confirmation_number"],
            ["Preferred support channel", company.preferredChannel, "support"],
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
          <div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Company workspace">{([ ["contacts", "Contacts"], ["tickets", "Active Tickets"], ["contracts", "Contracts & Services"] ] as [WorkspaceTab, string][]).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={workspaceTab === id} type="button" onClick={() => setWorkspaceTab(id)} className={`border-b-2 px-3 py-2.5 text-xs font-bold ${workspaceTab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}{id === "tickets" ? ` (${openTickets.length})` : id === "contacts" ? ` (${contacts.length})` : ""}</button>
          ))}</div>
        </div>
        <div className="p-3 sm:p-4" role="tabpanel">
          {workspaceTab === "contacts" && <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TableSearch id="company-contact-search" value={contactSearch} onChange={setContactSearch} placeholder="Search contacts..." aria-label="Search contacts" className="min-w-52 max-w-[480px] flex-1" />
              <div className="ml-auto flex flex-wrap items-center gap-2">
              <ComboboxFilter label="Role" options={contactRoles.map((role) => ({ value: role, label: role }))} selectedValues={contactRoleFilter} onChange={setContactRoleFilter} singleSelect placeholder="Search roles..." />
              <button type="button" onClick={() => { setNewContact({ name: "", role: "", email: "", phone: "" }); setContactFlags({ primary: false, escalation: false }); setIsAddingContact(true); }} disabled={!canEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#119DA4] px-3 text-xs font-semibold text-white transition hover:bg-[#0E858D] disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true" className="material-symbols-outlined text-base">person_add</span>Add contact</button>
              </div>
            </div>
              <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-[#4B3F72]"><tr><th className="px-2 py-2">Name</th><th className="px-2 py-2">Role</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Phone</th><th className="px-2 py-2">Primary</th><th className="px-2 py-2">Escalation</th><th scope="col" className="w-[1%] whitespace-nowrap px-2 py-2">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredContacts.length ? filteredContacts.map((contact) => <tr key={contact.id}><td className="whitespace-nowrap px-2 py-2.5 font-semibold text-[#1F2041]">{contact.name}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{contact.role || "—"}</td><td className="whitespace-nowrap px-2 py-2.5 text-[#19647E]">{contact.email}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{contact.phone}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{contact.id === primaryContact.id ? "Yes" : "—"}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{contact.id === escalationContact?.id ? "Yes" : "—"}</td><td className="whitespace-nowrap px-2 py-2.5"><div className="inline-flex items-center gap-1 align-middle"><button type="button" onClick={() => editContact(contact)} disabled={!canEdit} aria-label={`Edit ${contact.name}`} title="Edit contact" className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><span aria-hidden="true" className="material-symbols-outlined text-base">edit</span></button><button type="button" onClick={() => deleteContact(contact)} disabled={!canEdit || contacts.length <= 1} aria-label={`Delete ${contact.name}`} title={contacts.length <= 1 ? "A company must have at least one contact" : "Delete contact"} className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><span aria-hidden="true" className="material-symbols-outlined text-base">delete</span></button></div></td></tr>) : <tr><td className="px-2 py-6 text-center text-slate-500" colSpan={7}>No contacts match these filters.</td></tr>}</tbody></table></div>
          </>}
          {workspaceTab === "tickets" && <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TableSearch id="company-ticket-search" value={ticketSearch} onChange={setTicketSearch} placeholder="Search tickets..." aria-label="Search tickets" className="min-w-52 max-w-[480px] flex-1" />
              <div className="ml-auto flex flex-wrap items-center gap-2">
              <ComboboxFilter label="Status" options={[...new Set(openTickets.map((ticket) => ticket.status))].map((status) => ({ value: status, label: status }))} selectedValues={ticketStatusFilter} onChange={setTicketStatusFilter} singleSelect placeholder="Search statuses..." />
              <ComboboxFilter label="Priority" options={[...new Set(openTickets.map((ticket) => ticket.priority))].map((priority) => ({ value: priority, label: priority }))} selectedValues={ticketPriorityFilter} onChange={setTicketPriorityFilter} singleSelect placeholder="Search priorities..." />
              </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-2 py-2">Ticket</th><th className="px-2 py-2">Subject</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Priority</th><th className="px-2 py-2">Assignee</th><th className="px-2 py-2">Updated</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredTickets.length ? filteredTickets.map((ticket) => <tr key={ticket.id}><td className="whitespace-nowrap px-2 py-2.5"><button type="button" className="font-bold text-indigo-700 hover:underline" onClick={() => onOpenTicket?.(ticket.id)}>{ticket.code}</button></td><td className="px-2 py-2.5 text-slate-700">{ticket.title}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.status}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.priority}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-600">{ticket.assignedToName || "Unassigned"}</td><td className="whitespace-nowrap px-2 py-2.5 text-slate-500">{ticket.timeAgo}</td></tr>) : <tr><td className="px-2 py-6 text-center text-slate-500" colSpan={6}>No active tickets match these filters.</td></tr>}</tbody></table></div>
          </>}
          {workspaceTab === "contracts" && <CompanyContracts company={company} services={services} canEdit={canEdit} onUpdate={onUpdateCompany} getServiceHref={getServiceHref} />}
        </div>
      </section>

      {isAddingContact && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddingContact(false); }}><section role="dialog" aria-modal="true" aria-labelledby="add-contact-title" className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"><div className="flex items-start justify-between px-4 py-3"><div><h2 id="add-contact-title" className="text-base font-bold text-slate-900">Add company contact</h2></div></div><form onSubmit={addContact} className="space-y-3 p-4"><div className="grid gap-3 sm:grid-cols-2">{([ ["name", "Full name", "text"], ["role", "Role", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"] ] as const).map(([key, label, type]) => <label key={key} className="block text-xs font-semibold text-slate-600">{label}<input required type={type} value={newContact[key]} onChange={(event) => setNewContact((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label>)}</div><div className="flex flex-wrap gap-4 text-xs text-slate-700"><label className="flex items-center gap-2"><input type="checkbox" checked={contactFlags.primary} onChange={(event) => setContactFlags((current) => ({ ...current, primary: event.target.checked }))} />Primary support contact</label><label className="flex items-center gap-2"><input type="checkbox" checked={contactFlags.escalation} onChange={(event) => setContactFlags((current) => ({ ...current, escalation: event.target.checked }))} />Escalation contact</label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setIsAddingContact(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">Save</button></div></form></section></div>}

      {editingContact && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingContact(null); }}><section role="dialog" aria-modal="true" aria-labelledby="edit-contact-title" className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"><div className="flex items-start justify-between px-4 py-3"><div><h2 id="edit-contact-title" className="text-base font-bold text-slate-900">Edit company contact</h2></div></div><form onSubmit={saveContact} className="space-y-3 p-4"><div className="grid gap-3 sm:grid-cols-2">{([ ["name", "Full name", "text"], ["role", "Role", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"] ] as const).map(([key, label, type]) => <label key={key} className="block text-xs font-semibold text-slate-600">{label}<input required type={type} value={newContact[key]} onChange={(event) => setNewContact((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" /></label>)}</div><div className="flex flex-wrap gap-4 text-xs text-slate-700"><label className="flex items-center gap-2"><input type="checkbox" checked={contactFlags.primary} onChange={(event) => setContactFlags((current) => ({ ...current, primary: event.target.checked }))} />Primary support contact</label><label className="flex items-center gap-2"><input type="checkbox" checked={contactFlags.escalation} onChange={(event) => setContactFlags((current) => ({ ...current, escalation: event.target.checked }))} />Escalation contact</label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingContact(null)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">Save</button></div></form></section></div>}

      {isEditing && <DetailEditDialog title="Edit company details" onCancel={() => setIsEditing(false)} onSave={(event) => {
        event.preventDefault();
        const name = draft.name.trim();
        if (!name) { setEditError("Enter a company name."); return; }
        onUpdateCompany({
          name, tier: draft.tier, status: draft.status,
          preferredChannel: draft.preferredChannel, logo: draft.logo,
        });
        setIsEditing(false);
      }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">Company name<input className={formControlClassName} required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <label className="space-y-1.5 text-xs"><span className="block">Preferred support channel</span><SelectDropdown label="Preferred support channel" options={["email", "phone", "whatsapp"].map((value) => ({ value, label: value }))} value={draft.preferredChannel} onChange={(value) => setDraft({ ...draft, preferredChannel: value as Company["preferredChannel"] })} /></label>
          <label className="text-xs">Account tier<input className={formControlClassName} required value={draft.tier} onChange={(event) => setDraft({ ...draft, tier: event.target.value })} /></label>
          <label className="space-y-1.5 text-xs"><span className="block">Account status</span><SelectDropdown label="Account status" options={["Active", "Inactive"].map((value) => ({ value, label: value }))} value={draft.status} onChange={(value) => setDraft({ ...draft, status: value as Company["status"] })} /></label>
          <label className="block space-y-1.5 text-xs"><span>Company logo</span><span className="relative flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#c4d2e5] bg-white px-3.5 py-2 text-sm font-semibold text-[#1f2041] transition hover:border-teal-500"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload</span>Upload company logo<input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" accept="image/*" aria-label="Upload company logo" onChange={(event) => uploadCompanyLogo(event.target.files?.[0])} /></span></label>
        </div>
        <p className="text-xs text-slate-500">Internal company ID {company.id}</p>
        {editError && <p role="alert" className="text-sm text-red-700">{editError}</p>}
      </DetailEditDialog>}

      {isDeleteDialogOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDeleteDialogOpen(false); }}><section role="alertdialog" aria-modal="true" aria-labelledby="delete-company-title" aria-describedby="delete-company-description" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"><h2 id="delete-company-title" className="text-lg font-bold text-slate-900">Delete {company.name}?</h2><p id="delete-company-description" className="mt-2 text-sm leading-5 text-slate-600">Choose whether to keep this company record inactive or permanently delete it. Permanent deletion also removes {relatedTicketCount} related ticket{relatedTicketCount === 1 ? "" : "s"} and cannot be undone.</p><div className="mt-4 space-y-3"><button type="button" onClick={() => { onDeleteCompany?.(false); setIsDeleteDialogOpen(false); }} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left hover:bg-slate-50"><span className="block text-sm font-semibold text-slate-900">Set company inactive</span><span className="mt-1 block text-xs text-slate-600">Keep the company and its ticket history. It can be reactivated later.</span></button><div className="rounded-lg border border-red-200 p-3"><p className="text-sm font-semibold text-red-800">Permanently delete company and related tickets</p><label className="mt-2 block text-xs font-medium text-slate-700">Type <strong>{company.name}</strong> to confirm<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="button" disabled={deleteConfirmation !== company.name} onClick={() => onDeleteCompany?.(true)} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">Permanently delete</button></div></div></div></section></div>}
    </div>
  );
};
