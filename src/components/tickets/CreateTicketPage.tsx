import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Attachment, CustomerContact, InboundChannel, Ticket, TicketDiagnosticData, TicketPriority } from "../../types/barrel";
import { FormField, formControlClassName } from "../common/barrel";
import { ChannelSelector } from "../common/modals/ChannelSelector";

type IncidentCategory = "Technical/Bug" | "Login" | "Billing" | "Feature Request";
const DRAFT_KEY = "technova.ticket-intake-draft";
type IntakeDraft = { step?: 1 | 2; channel: InboundChannel; companyId: string; contactId: string; companySearch: string; title: string; serviceId: string; assigneeId: string; priority: TicketPriority | ""; category: IncidentCategory; description: string; initialNote: string; diagnostics: TicketDiagnosticData; categoryValue: string; attachments: Attachment[] };

interface TicketComboboxProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const TicketCombobox: React.FC<TicketComboboxProps> = ({ label, value, options, placeholder, onChange, disabled = false, required = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [listboxPosition, setListboxPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 320 });
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  const updateListboxPosition = () => {
    const button = buttonRef.current;
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bounds.bottom - 12;
    const spaceAbove = bounds.top - 12;
    const opensAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(320, opensAbove ? spaceAbove : spaceBelow));
    setListboxPosition({
      top: opensAbove ? Math.max(12, bounds.top - maxHeight - 4) : bounds.bottom + 4,
      left: bounds.left,
      width: bounds.width,
      maxHeight,
    });
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !listboxRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateListboxPosition();
    const reposition = () => updateListboxPosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  return <div ref={containerRef} className="relative min-w-0">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
    <input type="hidden" value={value} required={required} disabled={disabled} aria-label={label} />
    <button ref={buttonRef} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setQuery(""); }} className={`${formControlClassName} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}>
      <span className={selectedLabel ? "truncate" : "truncate text-slate-400"}>{selectedLabel || placeholder}</span>
      <span aria-hidden="true" className="material-symbols-outlined ml-2 shrink-0 text-[18px] text-slate-500">{open ? "expand_less" : "expand_more"}</span>
    </button>
    {open && createPortal(<div ref={listboxRef} role="listbox" aria-label={label} className="fixed z-[100] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl" style={{ top: listboxPosition.top, left: listboxPosition.left, width: listboxPosition.width, maxHeight: listboxPosition.maxHeight }}>
      <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} className="mb-1.5 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20" />
      <div className="overflow-y-auto" style={{ maxHeight: Math.max(80, listboxPosition.maxHeight - 58) }}>
        {filteredOptions.length ? filteredOptions.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); setQuery(""); }} className={`flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm transition-colors ${option.value === value ? "bg-slate-100 font-semibold text-brand-indigo" : "text-slate-700 hover:bg-slate-50"}`}>{option.label}</button>) : <p className="px-2.5 py-2 text-sm text-slate-500">No matching options</p>}
      </div>
    </div>, document.body)}
  </div>;
};

export const CreateTicketPage: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { data, addTicket, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [draft] = useState<IntakeDraft>(() => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") || {}; } catch { return {}; } });
  const [step, setStep] = useState<1 | 2>(draft.step || 1);
  const [channel, setChannel] = useState<InboundChannel>(draft.channel || "whatsapp");
  const [companyId, setCompanyId] = useState(draft.companyId || "");
  const [contactId, setContactId] = useState(draft.contactId || "");
  const [companySearch, setCompanySearch] = useState(draft.companySearch || "");
  const [title, setTitle] = useState(draft.title || "");
  const [serviceId, setServiceId] = useState(draft.serviceId || "");
  const [assigneeId, setAssigneeId] = useState(draft.assigneeId || "");
  const [priority, setPriority] = useState<TicketPriority | "">(draft.priority || "");
  const [category, setCategory] = useState<IncidentCategory>(draft.category || "Technical/Bug");
  const [description, setDescription] = useState(draft.description || "");
  const [initialNote, setInitialNote] = useState(draft.initialNote || "");
  const [diagnostics, setDiagnostics] = useState<TicketDiagnosticData>(draft.diagnostics || { clusterNode: "cloud-cluster-01", affectedUsers: 1 });
  const [categoryValue, setCategoryValue] = useState(draft.categoryValue || "");
  const [attachments, setAttachments] = useState<Attachment[]>(draft.attachments || []);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [savedTicket, setSavedTicket] = useState<Ticket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasDraftData = Boolean(channel !== "whatsapp" || category !== "Technical/Bug" || title || companyId || contactId || companySearch || serviceId || assigneeId || priority || description || initialNote || attachments.length || categoryValue || diagnostics.errorMessage || diagnostics.errorCode || diagnostics.stepsToReproduce);
  useEffect(() => {
    if (hasDraftData) sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, channel, companyId, contactId, companySearch, title, serviceId, assigneeId, priority, category, description, initialNote, diagnostics, categoryValue, attachments } satisfies IntakeDraft));
  }, [hasDraftData, step, channel, companyId, contactId, companySearch, title, serviceId, assigneeId, priority, category, description, initialNote, diagnostics, categoryValue, attachments]);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }, [step]);
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => { if (hasDraftData) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasDraftData]);
  const leaveIntake = () => { if (!hasDraftData || window.confirm("Save this ticket draft to continue later? Choose Cancel to stay on this form.")) navigate("/tickets"); };

  const company = data.companies.find((item) => item.id === companyId);
  const service = data.services.find((item) => item.id === serviceId);
  const assignee = data.employees.find((item) => item.id === assigneeId);
  const matchingCompanies = data.companies.filter((item) =>
    `${item.name} ${item.code} ${item.contactName} ${item.contactEmail} ${(item.contacts || []).map((contact) => `${contact.name} ${contact.email}`).join(" ")}`.toLowerCase().includes(companySearch.trim().toLowerCase()),
  );
  const contacts: CustomerContact[] = company?.contacts?.length ? company.contacts : company ? [{ id: `legacy-${company.id}`, name: company.contactName, email: company.contactEmail, phone: company.contactPhone }] : [];

  const updateDiagnostic = (key: keyof TicketDiagnosticData, value: string | number) =>
    setDiagnostics((current) => ({ ...current, [key]: value }));

  const handleAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const rejected = files.filter((file) => file.size > 5 * 1024 * 1024);
    setAttachmentError(rejected.length ? `${rejected.map((file) => file.name).join(", ")} ${rejected.length === 1 ? "was" : "were"} skipped. Attach files up to 5 MB each.` : "");
    const accepted = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (!accepted.length) { event.target.value = ""; return; }
    setAttachmentsLoading(true);
    Promise.all(accepted.map((file) => new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url: String(reader.result), mimeType: file.type, size: file.size });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then((items) => setAttachments((current) => [...current, ...items])).catch(() => setAttachmentError("A file could not be read. Check the file and try attaching it again.")).finally(() => setAttachmentsLoading(false));
    event.target.value = "";
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || savedTicket) return;
    const selectedContact = contacts.find((contact) => contact.id === contactId);
    if (!company || !selectedContact || !service || !assignee || !priority || !title.trim() || !description.trim()) return;
    const finalDiagnostics = { ...diagnostics };
    if (category === "Billing" && categoryValue) finalDiagnostics.errorCode = `INV:${categoryValue}`;
    if (category === "Login" && categoryValue) finalDiagnostics.errorCode = `AUTH:${categoryValue}`;
    if (category === "Feature Request" && categoryValue) finalDiagnostics.expectedBehavior = `Enhancement Impact: ${categoryValue}`;
    setSubmitting(true);
    const created = addTicket({
      code: "", title: title.trim(), description: description.trim(), companyId: company.id,
      companyName: company.name, companyCode: company.code, serviceId: service.id, serviceName: service.name,
      priority, status: "Open", channel, contactId: selectedContact.id,
      channelIdentifier: `${channel.toUpperCase()} Inbound #${Math.floor(1000 + Math.random() * 9000)}`,
      clientContact: selectedContact.name, assignedToId: assignee.id,
      assignedToName: assignee.name, assignedToRole: assignee.roleTitle, currentStageRole: assignee.role,
      slaDeadline: priority.includes("P1") ? "1h remaining" : "4h remaining",
      slaRisk: priority.includes("P1") ? "At Risk" : "On Target", tags: [category, service.name.split(" ")[0], priority.split(" ")[0]],
      attachments, diagnosticData: finalDiagnostics, systemRevision: data.companyInfo.version,
      environment: "Production Cloud Cluster", initialNote: initialNote.trim() || `Ticket intake processed via omnichannel ${channel.toUpperCase()} dispatch [Category: ${category}].`,
    });
    setSubmitting(false);
    if (!created) { addToast("Ticket could not be saved. Check your access and the selected customer details.", "error"); return; }
    sessionStorage.removeItem(DRAFT_KEY);
    setSavedTicket(created);
    onCreated?.();
    addToast(`${created.code} created successfully.`, "success");
  };

  if (savedTicket) {
    const channelLabel = savedTicket.channel === "whatsapp" ? "WhatsApp" : savedTicket.channel === "email" ? "Email" : "Phone";
    const diagnosticEntries = [
      ["Category", savedTicket.tags[0] || "Technical/Bug"],
      ["Environment", savedTicket.environment],
      ["Cluster / node", savedTicket.diagnosticData?.clusterNode || "Not provided"],
      ["Affected users", savedTicket.diagnosticData?.affectedUsers ? String(savedTicket.diagnosticData.affectedUsers) : "Not provided"],
    ];
    return <div className="ticket-success-page flex min-h-[calc(100vh-5rem)] items-start justify-center bg-slate-50 p-5 sm:p-8"><section className="ticket-success-card w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="ticket-created-heading">
      <header className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><span className="material-symbols-outlined text-[18px]">check_circle</span>Ticket saved successfully</p>
            <h1 id="ticket-created-heading" className="mt-2 text-2xl font-bold text-slate-900">{savedTicket.code}</h1>
            <p className="mt-1 text-sm text-slate-600">Your ticket has been added to the support queue.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{savedTicket.status}</span>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <section aria-labelledby="ticket-summary-heading">
          <h2 id="ticket-summary-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Ticket summary</h2>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-900">{savedTicket.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{savedTicket.description}</p>
          </div>
        </section>

        <section aria-labelledby="ticket-details-heading">
          <h2 id="ticket-details-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Details</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[['Company', `${savedTicket.companyName} (${savedTicket.companyCode})`], ['Customer contact', savedTicket.clientContact], ['Service', savedTicket.serviceName], ['Priority', savedTicket.priority], ['Channel', channelLabel], ['Assigned to', `${savedTicket.assignedToName} · ${savedTicket.assignedToRole}`], ['SLA', `${savedTicket.slaDeadline} · ${savedTicket.slaRisk}`], ['Channel reference', savedTicket.channelIdentifier], ['Attachments', `${savedTicket.attachments?.length || 0} image${savedTicket.attachments?.length === 1 ? "" : "s"}`]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 px-3 py-2.5"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
        </section>

        <section aria-labelledby="diagnostic-summary-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="diagnostic-summary-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Diagnostics captured</h2><span className="text-xs font-semibold text-slate-500">System revision {savedTicket.systemRevision}</span></div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{diagnosticEntries.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 px-3 py-2.5"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}</dl>
          {savedTicket.diagnosticData?.errorMessage && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"><strong>Error message:</strong> {savedTicket.diagnosticData.errorMessage}</p>}
        </section>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => navigate(`/tickets/${encodeURIComponent(savedTicket.id)}`, { state: { receipt: true } })} className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white">Open saved ticket</button>
          <button type="button" onClick={() => navigate("/tickets")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Back to ticket queue</button>
        </div>
      </div>
    </section></div>;
  }

  const detailsValid = Boolean(title.trim() && company && contacts.some((contact) => contact.id === contactId) && service && assignee && priority);
  return <div className="w-full bg-white">
    <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      <h2 ref={headingRef} tabIndex={-1} className="sr-only focus:outline-none">{step === 1 ? "Create a ticket · Ticket details" : "Ticket diagnostics"}</h2>
      <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
        <span className="shrink-0 text-xs font-bold text-slate-700">{step} of 2</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-indigo transition-all" style={{ width: `${step === 1 ? 50 : 100}%` }} /></div>
        <span className="shrink-0 text-xs font-semibold text-slate-500">{step === 1 ? "Ticket details" : "Diagnostics"}</span>
      </div>

      {step === 1 ? <div className="grid gap-x-4 gap-y-3 lg:grid-cols-2">
        <ChannelSelector channel={channel} setChannel={setChannel} />
        <FormField label="Ticket title · required"><input className={formControlClassName} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. API webhook delivery timeout" /></FormField>
        <div><TicketCombobox label="Company · required" value={companyId} onChange={(value) => { setCompanyId(value); setContactId(""); }} options={matchingCompanies.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} placeholder="Select a company" required />{companySearch.trim() && matchingCompanies.length === 0 && <p className="mt-1 text-sm text-amber-700" role="status">No matching company or contact. Try another name, email, or company code.</p>}<details className="group mt-2"><summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-brand-indigo underline decoration-slate-300 underline-offset-4">Find by name, email, or code <span aria-hidden="true">⌄</span></summary><div className="mt-2"><FormField label="Search company or contact"><input className={formControlClassName} value={companySearch} onChange={(event) => { setCompanySearch(event.target.value); setCompanyId(""); setContactId(""); }} placeholder="Name, email, or company code" /></FormField></div></details></div>
        <TicketCombobox label="Customer contact · required" value={contactId} onChange={setContactId} options={contacts.map((contact) => ({ value: contact.id, label: `${contact.name} · ${contact.email}` }))} placeholder={company ? "Select a contact" : "Choose a company first"} disabled={!company} required />
        <div><TicketCombobox label="Priority · required" value={priority} onChange={(value) => setPriority(value as TicketPriority | "")} options={["P1 Urgent", "P2 Normal", "P3 Low", "P4 Trivial"].map((item) => ({ value: item, label: item }))} placeholder="Select priority" required /><p className="mt-1 text-xs text-slate-500">P1 is reserved for critical incidents.</p></div>
        <TicketCombobox label="Service · required" value={serviceId} onChange={setServiceId} options={data.services.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select a service" required />
        <div><TicketCombobox label="Assign to · required" value={assigneeId} onChange={setAssigneeId} options={data.employees.map((item) => ({ value: item.id, label: `${item.name} · ${item.roleTitle}` }))} placeholder="Select an owner" required />{assignee && <p className="mt-1 text-xs text-slate-600">Assigned to <strong>{assignee.name}</strong> ({assignee.roleTitle}).</p>}</div>
      </div> : <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-2"><TicketCombobox label="Incident category" value={category} onChange={(value) => { setCategory(value as IncidentCategory); setCategoryValue(""); }} options={["Technical/Bug", "Login", "Billing", "Feature Request"].map((item) => ({ value: item, label: item }))} placeholder="Select a category" />
          {category === "Technical/Bug" ? <FormField label="Error message"><input className={formControlClassName} value={diagnostics.errorMessage || ""} onChange={(event) => updateDiagnostic("errorMessage", event.target.value)} /></FormField> : <FormField label={category === "Billing" ? "Invoice or transaction ID" : category === "Login" ? "Affected account or username" : "Business impact and justification"}><input className={formControlClassName} value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)} /></FormField>}</div>
        {category === "Technical/Bug" && <div className="grid gap-3 lg:grid-cols-2"><FormField label="Error code"><input className={formControlClassName} value={diagnostics.errorCode || ""} onChange={(event) => updateDiagnostic("errorCode", event.target.value)} /></FormField><FormField label="Cluster / server node"><input className={formControlClassName} value={diagnostics.clusterNode || ""} onChange={(event) => updateDiagnostic("clusterNode", event.target.value)} /></FormField><div className="lg:col-span-2"><FormField label="Steps to reproduce"><textarea className={formControlClassName} rows={2} value={diagnostics.stepsToReproduce || ""} onChange={(event) => updateDiagnostic("stepsToReproduce", event.target.value)} /></FormField></div></div>}
        <FormField label="Problem description · required"><textarea className={formControlClassName} required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe symptoms, impacted users, and relevant logs" /></FormField>
        <div className="grid gap-3 lg:grid-cols-2"><FormField label="Files (optional)"><input className="block w-full text-sm text-slate-600" type="file" multiple onChange={handleAttachments} /><p className="mt-1 text-xs text-slate-500">Any file type, up to 5 MB per file.</p></FormField><FormField label="Internal note (optional)"><input className={formControlClassName} value={initialNote} onChange={(event) => setInitialNote(event.target.value)} /></FormField></div>
        {attachmentError && <p role="alert" className="text-sm text-amber-800">{attachmentError}</p>}
        {attachmentsLoading && <p role="status" className="text-sm text-slate-600" aria-live="polite">Reading selected images…</p>}
        {attachments.length > 0 && <ul className="space-y-1 text-xs text-slate-600">{attachments.map((item) => <li key={item.id} className="flex justify-between">{item.name}<button type="button" onClick={() => setAttachments((current) => current.filter((attachment) => attachment.id !== item.id))} className="text-red-600">Remove</button></li>)}</ul>}
      </div>}

      <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
        <button type="button" onClick={step === 1 ? leaveIntake : () => setStep(1)} className="rounded-lg border border-brand-indigo px-4 py-2 text-sm font-semibold text-brand-indigo">{step === 1 ? "Cancel" : "Back"}</button>
        <div className="flex flex-col items-end gap-2">
          {step === 1 && !detailsValid && <p className="text-right text-xs text-amber-800" role="status">Complete the title, company, contact, priority, service, and owner to continue.</p>}
          {step === 2 && !description.trim() && <p className="text-right text-xs text-amber-800" role="status">Add a problem description to create this ticket.</p>}
          {step === 1 ? <button type="button" disabled={!detailsValid} onClick={() => setStep(2)} className="rounded-lg bg-brand-indigo px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Continue to diagnostics <span aria-hidden="true">→</span></button> : <button type="submit" disabled={submitting || attachmentsLoading || !description.trim() || !detailsValid} className="rounded-lg bg-brand-indigo px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Saving ticket…" : "Create ticket"}</button>}
        </div>
      </footer>
    </form>
  </div>;
};
