import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Attachment, InboundChannel, TicketDiagnosticData, TicketPriority } from "../../types/barrel";
import { FormField, formControlClassName } from "../common/barrel";
import { ChannelSelector } from "../common/modals/ChannelSelector";

type IncidentCategory = "Technical/Bug" | "Login" | "Billing" | "Feature Request";

export const CreateTicketPage: React.FC = () => {
  const { data, addTicket, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [channel, setChannel] = useState<InboundChannel>("whatsapp");
  const [companyId, setCompanyId] = useState(data.companies[0]?.id || "");
  const [contactName, setContactName] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState(data.services[0]?.id || "");
  const [assigneeId, setAssigneeId] = useState(data.employees[0]?.id || "");
  const [priority, setPriority] = useState<TicketPriority>("P1 Urgent");
  const [category, setCategory] = useState<IncidentCategory>("Technical/Bug");
  const [description, setDescription] = useState("");
  const [initialNote, setInitialNote] = useState("");
  const [diagnostics, setDiagnostics] = useState<TicketDiagnosticData>({ clusterNode: "cloud-cluster-01", affectedUsers: 1 });
  const [categoryValue, setCategoryValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const company = data.companies.find((item) => item.id === companyId) || data.companies[0];
  const service = data.services.find((item) => item.id === serviceId) || data.services[0];
  const assignee = data.employees.find((item) => item.id === assigneeId) || data.employees[0];
  const matchingCompanies = data.companies.filter((item) =>
    `${item.name} ${item.code} ${item.contactName} ${item.contactEmail}`.toLowerCase().includes(companySearch.toLowerCase()),
  );

  const selectInput = (value: string, onChange: (value: string) => void, options: { id: string; label: string }[]) => (
    <select className={formControlClassName} value={value} onChange={(event) => onChange(event.target.value)} required>
      {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
  );

  const updateDiagnostic = (key: keyof TicketDiagnosticData, value: string | number) =>
    setDiagnostics((current) => ({ ...current, [key]: value }));

  const handleAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    Promise.all(files.map((file) => new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url: String(reader.result), mimeType: file.type, size: file.size });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then((items) => setAttachments((current) => [...current, ...items])).catch(() => undefined);
    event.target.value = "";
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company || !service || !assignee || !title.trim() || !description.trim()) return;
    const finalDiagnostics = { ...diagnostics };
    if (category === "Billing" && categoryValue) finalDiagnostics.errorCode = `INV:${categoryValue}`;
    if (category === "Login" && categoryValue) finalDiagnostics.errorCode = `AUTH:${categoryValue}`;
    if (category === "Feature Request" && categoryValue) finalDiagnostics.expectedBehavior = `Enhancement Impact: ${categoryValue}`;
    addTicket({
      code: "", title: title.trim(), description: description.trim(), companyId: company.id,
      companyName: company.name, companyCode: company.code, serviceId: service.id, serviceName: service.name,
      priority, status: "Open", channel,
      channelIdentifier: `${channel.toUpperCase()} Inbound #${Math.floor(1000 + Math.random() * 9000)}`,
      clientContact: contactName || `${company.contactName} (${company.contactRole})`, assignedToId: assignee.id,
      assignedToName: assignee.name, assignedToRole: assignee.roleTitle, currentStageRole: assignee.role,
      slaDeadline: priority.includes("P1") ? "1h remaining" : "4h remaining",
      slaRisk: priority.includes("P1") ? "At Risk" : "On Target", tags: [category, service.name.split(" ")[0], priority.split(" ")[0]],
      attachments, diagnosticData: finalDiagnostics, systemRevision: data.companyInfo.version,
      environment: "Production Cloud Cluster", initialNote: initialNote.trim() || `Ticket intake processed via omnichannel ${channel.toUpperCase()} dispatch [Category: ${category}].`,
    });
    addToast(`Ticket "${title.trim()}" created successfully.`, "success");
    navigate("/tickets");
  };

  return <div className="w-full space-y-5 p-5">
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="border-b border-slate-100 pb-4">
        <p className="text-xs font-bold tracking-wide text-indigo-600 uppercase">Step {step} of 2</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{step === 1 ? "Ticket and customer details" : "Category and diagnostics"}</h2>
        <p className="mt-1 text-sm text-slate-500">{step === 1 ? "Choose the customer, service, priority, and owner." : "Add the issue details that help the assigned team resolve it."}</p>
      </header>

      {step === 1 ? <div className="space-y-5">
        <ChannelSelector channel={channel} setChannel={setChannel} />
        <FormField label="Ticket title"><input className={formControlClassName} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. API webhook delivery timeout" /></FormField>
        <FormField label="Find a company or contact"><input className={formControlClassName} value={companySearch} onChange={(event) => setCompanySearch(event.target.value)} placeholder="Search name, email, or company code" /></FormField>
        <FormField label="Company">{selectInput(companyId, (id) => { setCompanyId(id); const selected = data.companies.find((item) => item.id === id); setContactName(selected?.contacts?.[0]?.name || selected?.contactName || ""); }, matchingCompanies.map((item) => ({ id: item.id, label: `${item.name} (${item.code})` })))}</FormField>
        {!!company?.contacts?.length && <FormField label="Customer contact"><select className={formControlClassName} value={contactName || company.contacts[0].name} onChange={(event) => setContactName(event.target.value)}>{company.contacts.map((contact) => <option key={contact.id} value={contact.name}>{contact.name} · {contact.email}</option>)}</select></FormField>}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Priority"><select className={formControlClassName} value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority)}>{["P1 Urgent", "P2 Normal", "P3 Low", "P4 Trivial"].map((item) => <option key={item}>{item}</option>)}</select></FormField>
          <FormField label="Service">{selectInput(serviceId, setServiceId, data.services.map((item) => ({ id: item.id, label: item.name })))}</FormField>
          <FormField label="Assign to">{selectInput(assigneeId, setAssigneeId, data.employees.map((item) => ({ id: item.id, label: `${item.name} · ${item.roleTitle}` })))}</FormField>
        </div>
      </div> : <div className="space-y-5">
        <FormField label="Incident category"><select className={formControlClassName} value={category} onChange={(event) => { setCategory(event.target.value as IncidentCategory); setCategoryValue(""); }}><option>Technical/Bug</option><option>Login</option><option>Billing</option><option>Feature Request</option></select></FormField>
        {category === "Technical/Bug" ? <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <FormField label="Error message"><input className={formControlClassName} value={diagnostics.errorMessage || ""} onChange={(event) => updateDiagnostic("errorMessage", event.target.value)} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Error code"><input className={formControlClassName} value={diagnostics.errorCode || ""} onChange={(event) => updateDiagnostic("errorCode", event.target.value)} /></FormField><FormField label="Cluster / server node"><input className={formControlClassName} value={diagnostics.clusterNode || ""} onChange={(event) => updateDiagnostic("clusterNode", event.target.value)} /></FormField></div>
          <FormField label="Steps to reproduce"><textarea className={formControlClassName} rows={2} value={diagnostics.stepsToReproduce || ""} onChange={(event) => updateDiagnostic("stepsToReproduce", event.target.value)} /></FormField>
        </div> : <FormField label={category === "Billing" ? "Invoice or transaction ID" : category === "Login" ? "Affected account or username" : "Business impact and justification"}><input className={formControlClassName} value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)} /></FormField>}
        <FormField label="Problem description"><textarea className={formControlClassName} required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe symptoms, impacted users, and relevant logs" /></FormField>
        <FormField label="Images (optional)"><input className="block w-full text-sm text-slate-600" type="file" accept="image/*" multiple onChange={handleAttachments} /></FormField>
        {attachments.length > 0 && <ul className="space-y-1 text-xs text-slate-600">{attachments.map((item) => <li key={item.id} className="flex justify-between">{item.name}<button type="button" onClick={() => setAttachments((current) => current.filter((attachment) => attachment.id !== item.id))} className="text-red-600">Remove</button></li>)}</ul>}
        <FormField label="Internal note (optional)"><input className={formControlClassName} value={initialNote} onChange={(event) => setInitialNote(event.target.value)} /></FormField>
      </div>}

      <footer className="flex justify-between border-t border-slate-100 pt-4">
        {step === 2 ? <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Back</button> : <button type="button" onClick={() => navigate("/tickets")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>}
        {step === 1 ? <button type="button" disabled={!title.trim() || !companyId || !serviceId || !assigneeId} onClick={() => setStep(2)} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Next: diagnostics</button> : <button type="submit" disabled={!description.trim()} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Create ticket</button>}
      </footer>
    </form>
  </div>;
};
