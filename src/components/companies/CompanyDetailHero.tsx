import React, { useState } from "react";
import type { Company, CustomerContact, Employee, ServiceLine, Ticket } from "../../types/barrel";
import { CategoryBadge, TableValue, ClearTableFiltersButton, CheckboxField, ConfirmationDialog, DeleteDialog, DetailBanner, DetailEditDialog, FormField, Button, PaginatedDataTable, Icon, Input, LogoMark, TableBody, TableCell, TableHead, TableHeader, TableRow, ComboboxFilter, TableSearch } from "../../ui/barrel";
import { RelatedTicketsTable } from "../shared/RelatedTicketsTable";
import { CompanyContracts } from "./CompanyContracts";
import { CompanyGeneralForm } from "./CompanyGeneralForm";
import { useSearchParams } from "react-router-dom";

interface CompanyDetailHeroProps {
  company: Company;
  onUpdateCompany: (updates: Partial<Company>) => void;
  onDeleteCompany?: (permanent: boolean) => void;
  canEdit?: boolean;
  tickets?: Ticket[];
  services?: ServiceLine[];
  companies?: Company[];
  employees?: Employee[];
  getServiceHref?: (service: ServiceLine) => string | undefined;
}

type WorkspaceTab = "general" | "contacts" | "tickets" | "contracts";

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onUpdateCompany,
  onDeleteCompany,
  canEdit = true,
  tickets = [],
  services = [],
  companies = [],
  getServiceHref,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const workspaceTab: WorkspaceTab = requestedTab === "contacts" || requestedTab === "tickets" || requestedTab === "contracts" ? requestedTab : "general";
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
      {contactToDelete && <ConfirmationDialog
        title={`Delete ${contactToDelete.name}?`}
        description={`This contact will be removed from ${company.name}.`}
        onCancel={() => setContactToDelete(null)}
        onConfirm={confirmDeleteContact}
        confirmLabel="Delete contact"
        danger
      />}
      <DetailBanner
        title={company.name}
        status={company.status}
        statusTone={company.status === "Active" ? "positive" : "neutral"}
        subtitle={company.tier}
        icon={company.logo ? <LogoMark src={company.logo} /> : <Icon className="text-[26px]">domain</Icon>}
        metrics={[
          ["Account manager", company.accountManager, "person"],
          ["Primary contact", primaryContact.name, "support_agent"],
          ["Active tickets", openTickets.length, "confirmation_number"],
          ["Preferred support channel", company.preferredChannel, "support"],
        ]}
        actions={<>
          {canEdit && onDeleteCompany && <Button type="button" tone="inverseDanger" size="small" onClick={() => setIsDeleteDialogOpen(true)}>Delete company</Button>}
          <Button type="button" tone="inverse" size="small" onClick={() => setWorkspaceTab("contacts")}>View contacts</Button>
          <Button type="button" tone="primary" size="small" onClick={() => setWorkspaceTab("tickets")}>View ticket activity</Button>
        </>}
      />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 pt-1.5" role="presentation">
          <div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Company workspace">{([ ["general", "General"], ["contacts", "Contacts"], ["tickets", "Active Tickets"], ["contracts", "Contracts & Services"] ] as [WorkspaceTab, string][]).map(([id, label]) => (
            <Button tone="plain" key={id} role="tab" aria-selected={workspaceTab === id} type="button" onClick={() => setWorkspaceTab(id)} className={`border-b-2 px-3 py-2.5 text-xs font-bold ${workspaceTab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}{id === "tickets" ? ` (${openTickets.length})` : id === "contacts" ? ` (${contacts.length})` : ""}</Button>
          ))}</div>
        </div>
        <div className="p-3 sm:p-4" role="tabpanel">
          <div hidden={workspaceTab !== "general"}>
            <CompanyGeneralForm company={company} companies={companies} canEdit={canEdit} onSave={onUpdateCompany} />
          </div>
          {workspaceTab === "contacts" && <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TableSearch id="company-contact-search" value={contactSearch} onChange={setContactSearch} placeholder="Search contacts..." aria-label="Search contacts" className="min-w-52 max-w-[480px] flex-1" />
              <div className="ml-auto flex flex-wrap items-center gap-2">
              <ComboboxFilter hideClear label="Role" options={contactRoles.map((role) => ({ value: role, label: role }))} selectedValues={contactRoleFilter} onChange={setContactRoleFilter} singleSelect placeholder="Search roles..." />
              {contactRoleFilter.length > 0 && <ClearTableFiltersButton onClear={() => setContactRoleFilter([])} />}
              <Button tone="plain" type="button" onClick={() => { setNewContact({ name: "", role: "", email: "", phone: "" }); setContactFlags({ primary: false, escalation: false }); setIsAddingContact(true); }} disabled={!canEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#119DA4] px-3 text-xs font-semibold text-white transition hover:bg-[#0E858D] disabled:cursor-not-allowed disabled:opacity-50"><Icon aria-hidden="true" className="text-base">person_add</Icon>Add contact</Button>
              </div>
            </div>
              <PaginatedDataTable rows={filteredContacts} scroll>{(pageRows) => <><TableHead tone="compact"><TableRow><TableHeader density="compact">Name</TableHeader><TableHeader density="compact">Role</TableHeader><TableHeader density="compact">Email</TableHeader><TableHeader density="compact">Phone</TableHeader><TableHeader density="compact">Primary</TableHeader><TableHeader density="compact">Escalation</TableHeader><TableHeader density="compact" scope="col" className="w-[1%] whitespace-nowrap">Actions</TableHeader></TableRow></TableHead><TableBody>{filteredContacts.length ? pageRows.map((contact) => { const isPrimary = contact.id === primaryContact.id; return <TableRow key={contact.id}><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 font-semibold text-[#1F2041]">{contact.name}</TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 text-slate-600"><TableValue icon="badge">{contact.role}</TableValue></TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 text-[#19647E]"><TableValue icon="mail">{contact.email}</TableValue></TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 text-slate-600"><TableValue icon="call">{contact.phone}</TableValue></TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 text-slate-600"><CategoryBadge variant="flag" category={isPrimary ? "Yes" : "No"} /></TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5 text-slate-600"><CategoryBadge variant="flag" category={contact.id === escalationContact?.id ? "Yes" : "No"} /></TableCell><TableCell density="plain" className="whitespace-nowrap px-2 py-2.5"><div className="inline-flex items-center gap-1 align-middle"><Button tone="plain" type="button" onClick={() => editContact(contact)} disabled={!canEdit} aria-label={`Edit ${contact.name}`} title="Edit contact" className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><Icon aria-hidden="true" className="text-base">edit</Icon></Button><Button tone="plain" type="button" onClick={() => deleteContact(contact)} disabled={!canEdit || contacts.length <= 1} aria-label={`Delete ${contact.name}`} title={contacts.length <= 1 ? "A company must have at least one contact" : "Delete contact"} className="inline-flex size-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Icon aria-hidden="true" className="text-base">delete</Icon></Button></div></TableCell></TableRow>; }) : <TableRow><TableCell density="plain" className="px-2 py-6 text-center text-slate-500" colSpan={7}>No contacts match these filters.</TableCell></TableRow>}</TableBody></>}</PaginatedDataTable>
          </>}
          {workspaceTab === "tickets" && <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TableSearch id="company-ticket-search" value={ticketSearch} onChange={setTicketSearch} placeholder="Search tickets..." aria-label="Search tickets" className="min-w-52 max-w-[480px] flex-1" />
              <div className="ml-auto flex flex-wrap items-center gap-2">
              <ComboboxFilter hideClear label="Status" options={[...new Set(openTickets.map((ticket) => ticket.status))].map((status) => ({ value: status, label: status }))} selectedValues={ticketStatusFilter} onChange={setTicketStatusFilter} singleSelect placeholder="Search statuses..." />
              <ComboboxFilter hideClear label="Priority" options={[...new Set(openTickets.map((ticket) => ticket.priority))].map((priority) => ({ value: priority, label: priority }))} selectedValues={ticketPriorityFilter} onChange={setTicketPriorityFilter} singleSelect placeholder="Search priorities..." />
              {(ticketStatusFilter.length > 0 || ticketPriorityFilter.length > 0) && <ClearTableFiltersButton onClear={() => { setTicketStatusFilter([]); setTicketPriorityFilter([]); }} />}
              </div>
            </div>
            <RelatedTicketsTable tickets={filteredTickets} emptyMessage="No active tickets match these filters." />
          </>}
          {workspaceTab === "contracts" && <CompanyContracts company={company} services={services} canEdit={canEdit} onUpdate={onUpdateCompany} getServiceHref={getServiceHref} />}
        </div>
      </section>

      {(isAddingContact || editingContact) && <DetailEditDialog
        title={isAddingContact ? "Add company contact" : "Edit company contact"}
        onCancel={() => { setIsAddingContact(false); setEditingContact(null); }}
        onSave={isAddingContact ? addContact : saveContact}
        width="small"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["name", "Full name", "text"], ["role", "Role", "text"],
            ["email", "Email", "email"], ["phone", "Phone", "tel"],
          ] as const).map(([key, label, type]) => (
            <FormField key={key} label={label}>
              <Input required type={type} value={newContact[key]} onChange={(event) => setNewContact((current) => ({ ...current, [key]: event.target.value }))} />
            </FormField>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <CheckboxField checked={contactFlags.primary} onChange={(event) => setContactFlags((current) => ({ ...current, primary: event.target.checked }))} label="Primary support contact" />
          <CheckboxField checked={contactFlags.escalation} onChange={(event) => setContactFlags((current) => ({ ...current, escalation: event.target.checked }))} label="Escalation contact" />
        </div>
      </DetailEditDialog>}

      {isDeleteDialogOpen && onDeleteCompany && <DeleteDialog
        title={`Delete ${company.name}?`}
        description={`Permanent deletion also removes ${relatedTicketCount} related ticket${relatedTicketCount === 1 ? "" : "s"} and cannot be undone.`}
        verification={company.name}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onDelete={() => onDeleteCompany(true)}
        alternative={{
          title: "Set company inactive",
          description: "Keep the company and its ticket history. It can be reactivated later.",
          onClick: () => { onDeleteCompany(false); setIsDeleteDialogOpen(false); },
        }}
      />}
    </div>
  );
};
