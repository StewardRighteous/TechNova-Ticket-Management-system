import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Attachment, CustomerContact, InboundChannel, TicketDiagnosticData, TicketPriority } from "../../types/barrel";
import { FormField, formControlClassName } from "../common/barrel";
import { ChannelSelector } from "../common/modals/ChannelSelector";

type IncidentCategory = "Technical/Bug" | "Login" | "Billing" | "Feature Request";
const DRAFT_KEY = "technova.ticket-intake-draft";
type IntakeDraft = { step: 1 | 2; channel: InboundChannel; companyId: string; contactId: string; companySearch: string; title: string; serviceId: string; assigneeId: string; priority: TicketPriority | ""; category: IncidentCategory; description: string; initialNote: string; diagnostics: TicketDiagnosticData; categoryValue: string; attachments: Attachment[] };

export const CreateTicketPage: React.FC = () => {
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
  const [savedTicket, setSavedTicket] = useState<{ id: string; code: string; title: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasDraftData = Boolean(channel !== "whatsapp" || category !== "Technical/Bug" || title || companyId || contactId || companySearch || serviceId || assigneeId || priority || description || initialNote || attachments.length || categoryValue || diagnostics.errorMessage || diagnostics.errorCode || diagnostics.stepsToReproduce);
  const intakeDraft: IntakeDraft = { step, channel, companyId, contactId, companySearch, title, serviceId, assigneeId, priority, category, description, initialNote, diagnostics, categoryValue, attachments };

  useEffect(() => { if (hasDraftData) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(intakeDraft)); }, [hasDraftData, step, channel, companyId, contactId, companySearch, title, serviceId, assigneeId, priority, category, description, initialNote, diagnostics, categoryValue, attachments]);
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
    const rejected = files.filter((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    setAttachmentError(rejected.length ? `${rejected.map((file) => file.name).join(", ")} ${rejected.length === 1 ? "was" : "were"} skipped. Attach images up to 5 MB each.` : "");
    const accepted = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
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
    setSavedTicket({ id: created.id, code: created.code, title: created.title });
    addToast(`${created.code} created successfully.`, "success");
  };

  if (savedTicket) return <section className="m-5 max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm" aria-labelledby="ticket-created-heading">
    <p className="text-sm font-semibold text-emerald-700">Ticket saved</p>
    <h1 id="ticket-created-heading" className="mt-2 text-2xl font-bold text-slate-900">{savedTicket.code}</h1>
    <p className="mt-2 text-sm text-slate-700">“{savedTicket.title}” is in the ticket queue.</p>
    <div className="mt-6 flex gap-3">
      <button type="button" onClick={() => navigate(`/tickets/${encodeURIComponent(savedTicket.id)}`, { state: { receipt: true } })} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Open saved ticket</button>
      <button type="button" onClick={() => navigate("/tickets")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Back to ticket queue</button>
    </div>
  </section>;

  return <div className="w-full space-y-5 p-5">
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="border-b border-slate-100 pb-4">
        <p className="text-xs font-bold tracking-wide text-indigo-600 uppercase">Step {step} of 2</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-bold text-slate-900 focus:outline-none">{step === 1 ? "Ticket and customer details" : "Category and diagnostics"}</h2>
        <p className="mt-1 text-sm text-slate-500">{step === 1 ? "Choose the customer, service, priority, and owner." : "Add the issue details that help the assigned team resolve it."}</p>
      </header>

      {step === 1 ? <div className="space-y-5">
        <ChannelSelector channel={channel} setChannel={setChannel} />
        <FormField label="Ticket title · required"><input className={formControlClassName} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. API webhook delivery timeout" /></FormField>
        <FormField label="Find a company or contact"><input className={formControlClassName} value={companySearch} onChange={(event) => { setCompanySearch(event.target.value); setCompanyId(""); setContactId(""); }} placeholder="Search name, email, or company code" /></FormField>
        <FormField label="Company · required"><select className={formControlClassName} value={companyId} onChange={(event) => { setCompanyId(event.target.value); setContactId(""); }} required><option value="">Select a company</option>{matchingCompanies.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select>{companySearch.trim() && matchingCompanies.length === 0 && <p className="mt-1 text-sm text-amber-700" role="status">No matching company or contact. Try another name, email, or company code.</p>}</FormField>
        <FormField label="Customer contact · required"><select className={formControlClassName} value={contactId} onChange={(event) => setContactId(event.target.value)} required disabled={!company}><option value="">{company ? "Select a contact" : "Choose a company first"}</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>)}</select></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Priority · required"><select className={formControlClassName} value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority | "")} required><option value="">Select priority</option>{["P1 Urgent", "P2 Normal", "P3 Low", "P4 Trivial"].map((item) => <option key={item}>{item}</option>)}</select><p className="mt-1 text-xs text-slate-500">Choose urgency based on customer impact; P1 is reserved for critical incidents.</p></FormField>
          <FormField label="Service · required"><select className={formControlClassName} value={serviceId} onChange={(event) => setServiceId(event.target.value)} required><option value="">Select a service</option>{data.services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
          <FormField label="Assign to · required"><select className={formControlClassName} value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} required><option value="">Select an owner</option>{data.employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.roleTitle}</option>)}</select>{assignee && <p className="mt-1 text-xs text-slate-600">This ticket will be assigned to <strong>{assignee.name}</strong> ({assignee.roleTitle}).</p>}</FormField>
        </div>
      </div> : <div className="space-y-5">
        <FormField label="Incident category"><select className={formControlClassName} value={category} onChange={(event) => { setCategory(event.target.value as IncidentCategory); setCategoryValue(""); }}><option>Technical/Bug</option><option>Login</option><option>Billing</option><option>Feature Request</option></select></FormField>
        {category === "Technical/Bug" ? <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <FormField label="Error message"><input className={formControlClassName} value={diagnostics.errorMessage || ""} onChange={(event) => updateDiagnostic("errorMessage", event.target.value)} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Error code"><input className={formControlClassName} value={diagnostics.errorCode || ""} onChange={(event) => updateDiagnostic("errorCode", event.target.value)} /></FormField><FormField label="Cluster / server node"><input className={formControlClassName} value={diagnostics.clusterNode || ""} onChange={(event) => updateDiagnostic("clusterNode", event.target.value)} /></FormField></div>
          <FormField label="Steps to reproduce"><textarea className={formControlClassName} rows={2} value={diagnostics.stepsToReproduce || ""} onChange={(event) => updateDiagnostic("stepsToReproduce", event.target.value)} /></FormField>
        </div> : <FormField label={category === "Billing" ? "Invoice or transaction ID" : category === "Login" ? "Affected account or username" : "Business impact and justification"}><input className={formControlClassName} value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)} /></FormField>}
        <FormField label="Problem description · required"><textarea className={formControlClassName} required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe symptoms, impacted users, and relevant logs" /></FormField>
        <FormField label="Images (optional)"><input className="block w-full text-sm text-slate-600" type="file" accept="image/*" multiple onChange={handleAttachments} /><p className="mt-1 text-xs text-slate-500">Images only, up to 5 MB per file.</p></FormField>
        {attachmentError && <p role="alert" className="text-sm text-amber-800">{attachmentError}</p>}
        {attachmentsLoading && <p role="status" className="text-sm text-slate-600" aria-live="polite">Reading selected images…</p>}
        {attachments.length > 0 && <ul className="space-y-1 text-xs text-slate-600">{attachments.map((item) => <li key={item.id} className="flex justify-between">{item.name}<button type="button" onClick={() => setAttachments((current) => current.filter((attachment) => attachment.id !== item.id))} className="text-red-600">Remove</button></li>)}</ul>}
        <FormField label="Internal note (optional)"><input className={formControlClassName} value={initialNote} onChange={(event) => setInitialNote(event.target.value)} /></FormField>
      </div>}

      <footer className="flex justify-between border-t border-slate-100 pt-4">
        {step === 2 ? <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Back</button> : <button type="button" onClick={leaveIntake} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>}
        <div className="flex flex-col items-end gap-2">
          {step === 1 && (!title.trim() || !company || !contacts.some((contact) => contact.id === contactId) || !service || !assignee || !priority) && <p className="text-right text-xs text-amber-800" role="status">Complete the title, company, contact, priority, service, and owner to continue.</p>}
          {step === 2 && !description.trim() && <p className="text-right text-xs text-amber-800" role="status">Add a problem description to create this ticket.</p>}
          {step === 1 ? <button type="button" disabled={!title.trim() || !company || !contacts.some((contact) => contact.id === contactId) || !service || !assignee || !priority} onClick={() => setStep(2)} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Next: diagnostics</button> : <button type="submit" disabled={submitting || attachmentsLoading || !description.trim() || !company || !contacts.some((contact) => contact.id === contactId) || !service || !assignee || !priority} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Saving ticket…" : "Create ticket"}</button>}
        </div>
      </footer>
    </form>
  </div>;
};
