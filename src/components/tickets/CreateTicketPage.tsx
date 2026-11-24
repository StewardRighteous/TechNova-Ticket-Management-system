import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { canAccessTicket } from "../../utils/rolePermissions";
import type { Attachment, CustomerContact, InboundChannel, Ticket, TicketDiagnosticData, TicketPriority } from "../../types/barrel";
import { StepAction, ConfirmationDialog, FieldHint, FormActions, Button, Heading, Icon, Input, Textarea, FormField, SelectDropdown } from "../../ui/barrel";
import { ChannelSelector } from "../../ui/groups/ChannelSelector";
import { formatSupportDeadline, isEligibleAssignee, ticketPriorities } from "../../utils/supportPolicy";

type IncidentCategory = "Technical/Bug" | "Login" | "Billing" | "Feature Request";
const DRAFT_KEY = "technova.ticket-intake-draft";
type IntakeDraft = { step?: 1 | 2; channel: InboundChannel; companyId: string; contactId: string; title: string; serviceId: string; assigneeId: string; supportSite?: string; priority: TicketPriority | ""; category: IncidentCategory; description: string; initialNote: string; diagnostics: TicketDiagnosticData; categoryValue: string; attachments: Attachment[] };

export const CreateTicketPage: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { data, activeRole, currentUser, addTicket, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const draftKey = `${DRAFT_KEY}.${currentUser?.id}`;
  const [draft] = useState<IntakeDraft>(() => { try { return JSON.parse(sessionStorage.getItem(draftKey) || "null") || {}; } catch { return {}; } });
  const [step, setStep] = useState<1 | 2>(draft.step || 1);
  const [channel, setChannel] = useState<InboundChannel>(draft.channel || "whatsapp");
  const [companyId, setCompanyId] = useState(draft.companyId || "");
  const [contactId, setContactId] = useState(draft.contactId || "");
  const [title, setTitle] = useState(draft.title || "");
  const [serviceId, setServiceId] = useState(draft.serviceId || "");
  const [assigneeId, setAssigneeId] = useState(draft.assigneeId || "");
  const [supportSite, setSupportSite] = useState(draft.supportSite || "");
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
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [attemptedCreate, setAttemptedCreate] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const hasDraftData = Boolean(channel !== "whatsapp" || category !== "Technical/Bug" || title || companyId || contactId || serviceId || assigneeId || priority || description || initialNote || attachments.length || categoryValue || diagnostics.errorMessage || diagnostics.errorCode || diagnostics.stepsToReproduce);
  useEffect(() => {
    if (hasDraftData) sessionStorage.setItem(draftKey, JSON.stringify({ step, channel, companyId, contactId, title, serviceId, assigneeId, supportSite, priority, category, description, initialNote, diagnostics, categoryValue, attachments } satisfies IntakeDraft));
  }, [draftKey, hasDraftData, step, channel, companyId, contactId, title, serviceId, assigneeId, supportSite, priority, category, description, initialNote, diagnostics, categoryValue, attachments]);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }, [step]);
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => { if (hasDraftData) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasDraftData]);
  const leaveIntake = () => {
    if (hasDraftData) setConfirmLeave(true);
    else navigate("/tickets");
  };

  const company = data.companies.find((item) => item.id === companyId);
  const service = data.services.find((item) => item.id === serviceId);
  const eligibleAssignees = data.employees.filter((item) => isEligibleAssignee(item, serviceId));
  const assignee = eligibleAssignees.find((item) => item.id === assigneeId);
  const activeLoad = new Map<string, number>();
  for (const ticket of data.tickets) {
    if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
      activeLoad.set(ticket.assignedToId, (activeLoad.get(ticket.assignedToId) ?? 0) + 1);
    }
  }
  const assigneeScore = (item: typeof eligibleAssignees[number]) =>
    Number(item.status === "Available" && (activeLoad.get(item.id) ?? 0) < item.capacityMax) * 2
      + Number(Boolean(service?.defaultTeamId && item.teamId === service.defaultTeamId));
  eligibleAssignees.sort((a, b) => assigneeScore(b) - assigneeScore(a));
  const matchingCompanies = data.companies;
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
    if (step === 1 || submitting || savedTicket) return;
    setAttemptedCreate(true);
    if (!description.trim()) return;
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
      supportSite: company.supportSites?.includes(supportSite) ? supportSite : undefined,
      tags: [category, service.name.split(" ")[0], priority.split(" ")[0]],
      attachments, diagnosticData: finalDiagnostics, systemRevision: data.companyInfo.version,
      environment: "Production Cloud Cluster", initialNote: initialNote.trim() || `Ticket intake processed via omnichannel ${channel.toUpperCase()} dispatch [Category: ${category}].`,
    });
    setSubmitting(false);
    if (!created) { addToast("Ticket could not be saved. Check your access and the selected customer details.", "error"); return; }
    sessionStorage.removeItem(draftKey);
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
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Icon className="text-[18px]">check_circle</Icon>Ticket saved successfully</p>
            <Heading as="h1" variant="plain" id="ticket-created-heading" className="mt-2 text-2xl font-bold text-slate-900">{savedTicket.code}</Heading>
            <p className="mt-1 text-sm text-slate-600">Your ticket has been added to the support queue.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{savedTicket.status}</span>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <section aria-labelledby="ticket-summary-heading">
          <Heading variant="plain" id="ticket-summary-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Ticket summary</Heading>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Heading as="h3" variant="dialog">{savedTicket.title}</Heading>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{savedTicket.description}</p>
          </div>
        </section>

        <section aria-labelledby="ticket-details-heading">
          <Heading variant="plain" id="ticket-details-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Details</Heading>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[['Company', `${savedTicket.companyName} (${savedTicket.companyCode})`], ['Customer contact', savedTicket.clientContact], ['Service', savedTicket.serviceName], ['Priority', savedTicket.priority], ['Channel', channelLabel], ['Assigned to', `${savedTicket.assignedToName} · ${savedTicket.assignedToRole}`], ...(savedTicket.firstResponseDueAt ? [['First response due', formatSupportDeadline(savedTicket.firstResponseDueAt)]] : []), ...(savedTicket.dueAt ? [['Resolution due', formatSupportDeadline(savedTicket.dueAt)]] : []), ['Channel reference', savedTicket.channelIdentifier], ['Attachments', `${savedTicket.attachments?.length || 0} image${savedTicket.attachments?.length === 1 ? "" : "s"}`]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 px-3 py-2.5"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
        </section>

        <section aria-labelledby="diagnostic-summary-heading">
          <div className="flex items-center justify-between gap-3"><Heading variant="plain" id="diagnostic-summary-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500">Diagnostics captured</Heading><span className="text-xs font-semibold text-slate-500">System revision {savedTicket.systemRevision}</span></div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{diagnosticEntries.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 px-3 py-2.5"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}</dl>
          {savedTicket.diagnosticData?.errorMessage && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"><strong>Error message:</strong> {savedTicket.diagnosticData.errorMessage}</p>}
        </section>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          {canAccessTicket(savedTicket, activeRole, currentUser?.id) && <Button tone="plain" type="button" onClick={() => navigate(`/tickets/${encodeURIComponent(savedTicket.id)}`, { state: { receipt: true } })} className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white">Open saved ticket</Button>}
          <Button tone="plain" type="button" onClick={() => navigate("/tickets")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Back to ticket queue</Button>
        </div>
      </div>
    </section></div>;
  }

  const detailsValid = Boolean(title.trim() && company && contacts.some((contact) => contact.id === contactId) && service && assignee && priority);
  return <div className="w-full bg-white">
    <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      <Heading variant="plain" ref={headingRef} tabIndex={-1} className="sr-only focus:outline-none">{step === 1 ? "Create a ticket · Ticket details" : "Ticket diagnostics"}</Heading>
      <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
        <span className="shrink-0 text-xs font-bold text-slate-700">{step} of 2</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-indigo transition-all" style={{ width: `${step === 1 ? 50 : 100}%` }} /></div>
        <span className="shrink-0 text-xs font-semibold text-slate-500">{step === 1 ? "Ticket details" : "Diagnostics"}</span>
      </div>

      {step === 1 ? <div className="grid gap-x-4 gap-y-3 lg:grid-cols-2">
        <ChannelSelector channel={channel} setChannel={setChannel} />
        <FormField label="Ticket title" required><Input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. API webhook delivery timeout" /></FormField>
        <div><SelectDropdown showLabel label="Company" value={companyId} onChange={(value) => { setCompanyId(value); setContactId(""); setSupportSite(""); }} options={matchingCompanies.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} placeholder="Select a company" required /></div>
        <SelectDropdown showLabel label="Customer contact" value={contactId} onChange={setContactId} options={contacts.map((contact) => ({ value: contact.id, label: `${contact.name} · ${contact.email}` }))} placeholder={company ? "Select a contact" : "Choose a company first"} disabled={!company} required />
        <SelectDropdown showLabel label="Priority" value={priority} onChange={(value) => setPriority(value as TicketPriority | "")} options={ticketPriorities.map((item) => ({ value: item, label: item }))} placeholder="Select priority" required info="P1 is reserved for critical incidents." />
        <SelectDropdown showLabel label="Service" value={serviceId} onChange={(value) => {
          setServiceId(value);
          if (assignee && !isEligibleAssignee(assignee, value)) setAssigneeId("");
        }} options={data.services.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select a service" required />
        <SelectDropdown showLabel label="Assign to" value={assignee?.id ?? ""} onChange={setAssigneeId} options={eligibleAssignees.map((item) => ({
          value: item.id,
          label: activeRole === "operations_manager"
            ? `${item.name} · ${item.status} · ${activeLoad.get(item.id) ?? 0}/${item.capacityMax}`
            : `${item.name} · ${item.status}`,
        }))} placeholder="Select an owner" required />
        {!!company?.supportSites?.length && <SelectDropdown showLabel label="Affected site or tenant" value={supportSite} onChange={setSupportSite} options={[
          { value: "", label: "Unspecified" }, ...company.supportSites.map((site) => ({ value: site, label: site })),
        ]} placeholder="Select a site or tenant" />}
      </div> : <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-2"><SelectDropdown showLabel label="Incident category" value={category} onChange={(value) => { setCategory(value as IncidentCategory); setCategoryValue(""); }} options={["Technical/Bug", "Login", "Billing", "Feature Request"].map((item) => ({ value: item, label: item }))} placeholder="Select a category" />
          {category === "Technical/Bug" ? <FormField label="Error message"><Input value={diagnostics.errorMessage || ""} onChange={(event) => updateDiagnostic("errorMessage", event.target.value)} /></FormField> : <FormField label={category === "Billing" ? "Invoice or transaction ID" : category === "Login" ? "Affected account or username" : "Business impact and justification"}><Input value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)} /></FormField>}</div>
        {category === "Technical/Bug" && <div className="grid gap-3 lg:grid-cols-2"><FormField label="Error code"><Input value={diagnostics.errorCode || ""} onChange={(event) => updateDiagnostic("errorCode", event.target.value)} /></FormField><FormField label="Cluster / server node"><Input value={diagnostics.clusterNode || ""} onChange={(event) => updateDiagnostic("clusterNode", event.target.value)} /></FormField><div className="lg:col-span-2"><FormField label="Steps to reproduce"><Textarea rows={2} value={diagnostics.stepsToReproduce || ""} onChange={(event) => updateDiagnostic("stepsToReproduce", event.target.value)} /></FormField></div></div>}
        <FormField label="Problem description" required><Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe symptoms, impacted users, and relevant logs" /></FormField>
        <div className="grid gap-3 lg:grid-cols-2"><div><div className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">Files (optional)<FieldHint label="file upload">Any file type, up to 5 MB per file.</FieldHint></div><Input appearance="plain" ref={attachmentInputRef} className="sr-only" type="file" multiple onChange={handleAttachments} /><Button tone="plain" type="button" onClick={() => attachmentInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Icon className="text-[18px]" aria-hidden="true">upload</Icon>Upload file</Button></div><FormField label="Internal note (optional)"><Input value={initialNote} onChange={(event) => setInitialNote(event.target.value)} /></FormField></div>
        {attachmentError && <p role="alert" className="text-sm text-amber-800">{attachmentError}</p>}
        {attachmentsLoading && <p role="status" className="text-sm text-slate-600" aria-live="polite">Reading selected images…</p>}
        {attachments.length > 0 && <ul className="space-y-1 text-xs text-slate-600">{attachments.map((item) => <li key={item.id} className="flex justify-between">{item.name}<Button tone="plain" type="button" onClick={() => setAttachments((current) => current.filter((attachment) => attachment.id !== item.id))} className="text-red-600">Remove</Button></li>)}</ul>}
      </div>}

      <FormActions className="flex-col items-end">
        {step === 1 && attemptedContinue && !detailsValid && <p className="text-right text-xs text-amber-800" role="status">Complete all fields marked * to continue.</p>}
        {step === 2 && attemptedCreate && !description.trim() && <p className="text-right text-xs text-amber-800" role="status">Add a problem description to create this ticket.</p>}
        <div className="flex w-full justify-end gap-2">
          <Button type="button" onClick={step === 1 ? leaveIntake : () => setStep(1)}>{step === 1 ? "Cancel" : "Back"}</Button>
          <StepAction
            onContinue={step === 1 ? () => {
              if (!detailsValid) { setAttemptedContinue(true); return; }
              setAttemptedContinue(false);
              setStep(2);
            } : undefined}
            continueLabel="Continue to diagnostics"
            submitLabel={submitting ? "Saving ticket…" : "Create ticket"}
            submitDisabled={submitting || attachmentsLoading || !detailsValid}
          />
        </div>
      </FormActions>
    </form>
    {confirmLeave && <ConfirmationDialog
      title="Save this ticket draft?"
      description="You can return to the new ticket form to continue later."
      cancelLabel="Keep editing"
      confirmLabel="Save draft and exit"
      onCancel={() => setConfirmLeave(false)}
      onConfirm={() => navigate("/tickets")}
    />}
  </div>;
};
