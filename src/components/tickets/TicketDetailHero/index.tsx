import React, { useEffect, useState } from "react";
import type {
  Company,
  Employee,
  ServiceLine,
  Ticket,
  TicketStatus,
} from "../../../types/barrel";
import { HeroBanner } from "../HeroBanner";
import { IssueOverviewCard } from "../IssueOverviewCard";
import { TicketHistoryPanel } from "../TicketHistoryPanel";
import { TicketNotesPanel } from "../TicketNotesPanel";
import { useTicketStore } from "../../../store/barrel";
import { canTransitionTicket, ROLE_PERMISSIONS } from "../../../utils/rolePermissions";
import type { Attachment } from "../../../types/barrel";

interface TicketDetailHeroProps {
  ticket: Ticket;
  employees: Employee[];
  onStatusChange: (status: TicketStatus, note?: string) => void;
  onAssigneeChange: (empId: string, note?: string) => void;
  companies?: Company[];
  services?: ServiceLine[];
  onUpdateTicket?: (updates: Partial<Ticket>) => void;
  onDelete?: () => void;
  onViewEmployee?: (employeeId: string) => void;
  onViewCompany?: (companyId: string) => void;
  onOpenClientNotification?: () => void;
}

export const TicketDetailHero: React.FC<TicketDetailHeroProps> = ({
  ticket,
  employees,
  onStatusChange,
  onAssigneeChange,
  companies,
  onUpdateTicket,
  onDelete,
  onViewEmployee,
  onViewCompany,
  onOpenClientNotification,
}) => {
  const { addToast, addTicketTimelineNote, notifyTicketClient, activeRole } = useTicketStore();
  const canDeleteTicket = Boolean(onDelete && ROLE_PERMISSIONS[activeRole].canManageTeam);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const clientNotifiedVia = ticket.clientNotifiedVia;
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"issue" | "history" | "notes" | "files" | "client" | "resolution" | "notify">("issue");
  const [notificationNotes, setNotificationNotes] = useState(ticket.clientNotificationNotes ?? "");
  const company = companies?.find((item) => item.id === ticket.companyId);
  const contact = company?.contacts?.find((item) => item.id === ticket.contactId);
  const clientEmail = contact?.email || (ticket.channel === "email" ? ticket.channelIdentifier : company?.contactEmail) || "";
  const clientPhone = contact?.phone || (ticket.channel === "phone" || ticket.channel === "whatsapp" ? ticket.channelIdentifier : company?.contactPhone) || "";
  const stages: TicketStatus[] = ["Open", "In Progress", "Escalated", "Under Review", "Pending QA", "Resolved", "Closed"];
  const stageIndex = stages.indexOf(ticket.status);
  const previousStage = stageIndex > 0 ? stages[stageIndex - 1] : undefined;
  const action = ticket.status === "Open"
    ? { title: "New customer request", description: ticket.description, button: "Begin triage", target: "In Progress" as TicketStatus, icon: "description", tone: "indigo" }
    : ticket.status === "In Progress"
      ? { title: "Investigation in progress", description: ticket.description, button: "Request review", target: "Under Review" as TicketStatus, icon: "search", tone: "indigo" }
      : ticket.status === "Escalated"
        ? { title: "Escalated to senior support", description: ticket.description, button: "Send to review", target: "Under Review" as TicketStatus, icon: "warning", tone: "amber" }
        : ticket.status === "Under Review"
          ? { title: "Solution under review", description: ticket.description, button: "Request QA review", target: "Pending QA" as TicketStatus, icon: "layers", tone: "cyan" }
          : ticket.status === "Pending QA"
            ? { title: "QA validation in progress", description: ticket.description, button: "Approve resolution", target: "Resolved" as TicketStatus, icon: "science", tone: "violet" }
            : ticket.status === "Resolved"
              ? { title: "Ticket resolved", description: ticket.resolutionDetails || ticket.description, button: "Close ticket", target: "Closed" as TicketStatus, icon: "check_circle", tone: "emerald" }
              : { title: "Ticket closed", description: ticket.resolutionDetails || ticket.description, button: "Reopen ticket", target: "In Progress" as TicketStatus, icon: "flag", tone: "slate" };
  const canTakePrimaryAction = canTransitionTicket(activeRole, ticket.status, action.target);
  const canCloseTicket = Boolean(clientNotifiedVia) && canTakePrimaryAction;
  const isQaStage = ticket.status === "Pending QA";
  const isResolvedStage = ticket.status === "Resolved";
  const detailTabs = [
    ["issue", "Issue"], ["history", "History"], ["notes", "Notes"], ["files", "Files"], ["client", "Client"],
    ...(isQaStage ? [["resolution", "Resolution"]] : []),
    ...(isResolvedStage ? [["notify", "Notify"]] : []),
  ] as [typeof activeDetailTab, string][];

  useEffect(() => {
    if (activeDetailTab === "resolution" && !isQaStage) setActiveDetailTab(isResolvedStage ? "notify" : "issue");
    if (activeDetailTab === "notify" && !isResolvedStage) setActiveDetailTab(isQaStage ? "resolution" : "issue");
  }, [activeDetailTab, isQaStage, isResolvedStage]);

  const handleEscalate = () => {
    onStatusChange("Escalated");
    addToast(`${ticket.code} routed to Senior Support`, "warning");
  };

  const handleRequestQa = () => {
    onStatusChange("Pending QA");
    addToast(`${ticket.code} sent for QA review`, "info");
  };

  const handleResolve = () => {
    onStatusChange("Resolved", resolutionDetails.trim());
    setResolutionDetails("");
    addToast(`${ticket.code} marked as resolved`, "success");
  };

  const handleNotify = (channel: "email" | "whatsapp" | "phone") => {
    notifyTicketClient(ticket.id, channel, notificationNotes);
    addToast(`${ticket.code} notification recorded via ${channel === "whatsapp" ? "WhatsApp" : channel}`, "success");
  };

  const handleOpenResolution = () => {
    setActiveDetailTab("resolution");
  };

  const handleAddInternalNote = (body: string) => {
    addTicketTimelineNote(ticket.id, body);
    addToast("Internal note added", "success");
  };

  const handleAddFiles = (files: Attachment[]) => {
    if (!onUpdateTicket || !files.length) return;
    onUpdateTicket({ attachments: [...(ticket.attachments ?? []), ...files] });
    addToast(`${files.length} file${files.length === 1 ? "" : "s"} added to ${ticket.code}`, "success");
  };

  const handleRemoveFile = (attachmentId: string) => {
    if (!onUpdateTicket) return;
    onUpdateTicket({ attachments: (ticket.attachments ?? []).filter((attachment) => attachment.id !== attachmentId) });
    addToast("File removed", "success");
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 shadow-sm">
      <HeroBanner ticket={ticket} onDelete={canDeleteTicket ? () => setDeleteConfirmationOpen(true) : undefined} />

      <section aria-label="Ticket progress" className="px-4 pt-3 sm:px-5">
        <ol className="grid grid-cols-7 rounded-xl border border-white/80 bg-white/85 px-2 py-3 shadow-sm sm:px-4">
          {stages.map((stage, index) => {
            const complete = index < stageIndex || ticket.status === "Closed";
            const current = index === stageIndex;
            const currentTone = ticket.status === "Escalated" ? "amber" : ticket.status === "Under Review" ? "cyan" : ticket.status === "Pending QA" ? "violet" : ticket.status === "Resolved" || ticket.status === "Closed" ? "emerald" : "blue";
            const toneClasses = {
              blue: "border-blue-700 bg-blue-700 text-blue-800 ring-blue-100",
              amber: "border-amber-600 bg-amber-500 text-amber-800 ring-amber-100",
              cyan: "border-cyan-600 bg-cyan-500 text-cyan-800 ring-cyan-100",
              violet: "border-violet-700 bg-violet-600 text-violet-800 ring-violet-100",
              emerald: "border-emerald-700 bg-emerald-600 text-emerald-800 ring-emerald-100",
            }[currentTone];
            const priorComplete = index < stageIndex || ticket.status === "Closed";
            const connectorColor = index <= stageIndex || ticket.status === "Closed"
              ? priorComplete ? "bg-emerald-500" : currentTone === "amber" ? "bg-amber-500" : currentTone === "cyan" ? "bg-cyan-500" : currentTone === "violet" ? "bg-violet-600" : currentTone === "emerald" ? "bg-emerald-600" : "bg-blue-700"
              : "bg-slate-300";
            return <li key={stage} className="relative flex flex-col items-center text-center">
              {index > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-3 h-0.5 w-full ${connectorColor}`} />}
              <span className={`relative z-10 flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${current ? `${toneClasses.split(" ")[0]} ${toneClasses.split(" ")[1]} text-white ring-2 ${toneClasses.split(" ")[3]}` : priorComplete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400 bg-white text-slate-500"}`}>{complete ? "✓" : index + 1}</span>
              <span className={`mt-1.5 whitespace-nowrap text-[9px] font-semibold sm:text-[10px] ${current ? toneClasses.split(" ")[2] : priorComplete ? "text-emerald-800" : "text-slate-500"}`}>{stage}</span>
            </li>;
          })}
        </ol>
      </section>

      <section aria-labelledby="ticket-current-stage" className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            <div className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:p-4 ${action.tone === "amber" ? "border-amber-200 bg-amber-50" : action.tone === "cyan" ? "border-cyan-200 bg-cyan-50" : action.tone === "violet" ? "border-violet-200 bg-violet-50" : action.tone === "emerald" ? "border-emerald-200 bg-emerald-50" : action.tone === "slate" ? "border-slate-300 bg-slate-50" : "border-indigo-200 bg-indigo-50"}`}>
              <span className="hidden size-10 shrink-0 self-center items-center justify-center rounded-lg bg-white/80 text-blue-700 sm:flex" aria-hidden="true"><span className="material-symbols-outlined block text-2xl leading-none">{action.icon}</span></span>
              <div className="min-w-0 flex-1">
                <h2 id="ticket-current-stage" className="text-sm font-bold text-slate-900">{action.title}</h2>
                <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-700">{action.title === "Ticket resolved" || action.title === "Ticket closed" ? action.description : `Current stage: ${ticket.status}. Use the action to move this ticket forward.`}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
              {previousStage && canTransitionTicket(activeRole, ticket.status, previousStage) && <button type="button" onClick={() => onStatusChange(previousStage)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><span aria-hidden="true">‹ </span>Back to {previousStage}</button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Escalated") && <button type="button" onClick={handleEscalate} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800">Escalate</button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Under Review") && <button type="button" onClick={() => onStatusChange("Under Review")} className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">Request review</button>}
              {ticket.status === "Escalated" && canTakePrimaryAction && <button type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Open" && canTakePrimaryAction && <button type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Under Review" && canTakePrimaryAction && <button type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-800">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Pending QA" && canTakePrimaryAction && <button type="button" onClick={handleOpenResolution} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Resolved" && <button type="button" disabled={!canCloseTicket} onClick={() => onStatusChange(action.target)} title={!clientNotifiedVia ? "Notify the client before closing this ticket" : undefined} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Closed" && canTransitionTicket(activeRole, ticket.status, "In Progress") && <button type="button" onClick={() => onStatusChange("In Progress")} className="rounded-md bg-slate-700 px-4 py-2.5 text-xs font-bold text-white">{action.button} <span aria-hidden="true">›</span></button>}
              </div>
            </div>
          </section>
      </div>

      {deleteConfirmationOpen && canDeleteTicket && onDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-ticket-heading">
          <h2 id="delete-ticket-heading" className="text-base font-bold text-slate-900">Delete ticket?</h2>
          <p className="mt-1.5 text-sm text-slate-600">This will permanently remove {ticket.code} and its ticket history. This action cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" autoFocus onClick={() => setDeleteConfirmationOpen(false)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={onDelete} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">Delete ticket</button>
          </div>
        </div>
      </div>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Ticket information" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {detailTabs.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={activeDetailTab === key} onClick={() => setActiveDetailTab(key)} className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-semibold ${activeDetailTab === key ? "border-b-2 border-blue-700 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{label}{key === "files" && ticket.attachments?.length ? <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{ticket.attachments.length}</span> : null}</button>)}
        </div>
        <div role="tabpanel">
          {activeDetailTab === "issue" && <IssueOverviewCard ticket={ticket} />}
          {activeDetailTab === "history" && <TicketHistoryPanel ticket={ticket} employees={employees} canManageTeam={ROLE_PERMISSIONS[activeRole].canManageTeam} canEscalate={canTransitionTicket(activeRole, ticket.status, "Escalated")} onEscalate={handleEscalate} canRequestQa={canTransitionTicket(activeRole, ticket.status, "Pending QA")} onRequestQa={handleRequestQa} canResolve={canTransitionTicket(activeRole, ticket.status, "Resolved")} onMarkResolved={handleOpenResolution} onAssigneeChange={onAssigneeChange} onStatusChange={onStatusChange} onViewEmployee={onViewEmployee} />}
          {activeDetailTab === "notes" && <TicketNotesPanel notes={ticket.internalNotes ?? []} employees={employees} onAddNote={handleAddInternalNote} />}
          {activeDetailTab === "files" && <FilesPanel attachments={ticket.attachments ?? []} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} canAddFiles={Boolean(onUpdateTicket)} />}
          {activeDetailTab === "client" && <ClientPanel ticket={ticket} company={company} clientEmail={clientEmail} clientPhone={clientPhone} onViewCompany={onViewCompany} onOpenNotification={onOpenClientNotification} />}
          {activeDetailTab === "resolution" && isQaStage && <ResolutionPanel ticket={ticket} resolutionDetails={resolutionDetails} setResolutionDetails={setResolutionDetails} onResolve={handleResolve} />}
          {activeDetailTab === "notify" && isResolvedStage && <NotifyPanel ticket={ticket} attachments={ticket.attachments ?? []} notificationNotes={notificationNotes} setNotificationNotes={setNotificationNotes} onNotify={handleNotify} canClose={canCloseTicket} onClose={() => onStatusChange("Closed")} clientEmail={clientEmail} clientPhone={clientPhone} />}
        </div>
      </section>
    </div>
  );
};

const FilesPanel: React.FC<{
  attachments: Attachment[];
  onAddFiles: (files: Attachment[]) => void;
  onRemoveFile: (attachmentId: string) => void;
  canAddFiles: boolean;
}> = ({ attachments, onAddFiles, onRemoveFile, canAddFiles }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const accepted = files.filter((file) => file.size <= 5 * 1024 * 1024);
    const rejected = files.filter((file) => file.size > 5 * 1024 * 1024);
    setError(rejected.length ? `${rejected.map((file) => file.name).join(", ")} ${rejected.length === 1 ? "was" : "were"} skipped. Files must be 5 MB or smaller.` : "");
    event.target.value = "";
    if (!accepted.length) return;
    setLoading(true);
    Promise.all(accepted.map((file) => new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url: String(reader.result), mimeType: file.type || "application/octet-stream", size: file.size });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then(onAddFiles).catch(() => setError("A file could not be read. Check the file and try again.")).finally(() => setLoading(false));
  };

  return <section className="p-5" aria-labelledby="ticket-files-heading">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 id="ticket-files-heading" className="text-sm font-bold text-slate-900">Attached files</h3>
        <p className="mt-1 text-xs text-slate-500">Files submitted with or added to this ticket.</p>
      </div>
      {canAddFiles && <div className="flex flex-col items-end gap-1">
        <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
          <span className="material-symbols-outlined text-base" aria-hidden="true">upload_file</span>{loading ? "Reading files…" : "Add files"}
          <input type="file" multiple className="sr-only" onChange={handleFiles} disabled={loading} aria-label="Add files" />
        </label>
        <p className="text-[11px] text-slate-400">Any file type, up to 5 MB per file.</p>
      </div>}
    </div>
    {error && <p role="alert" className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
    {attachments.length ? <ul className="grid gap-3 sm:grid-cols-2">{attachments.map((attachment) => <li key={attachment.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"><a href={attachment.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 text-xs font-semibold text-indigo-700 hover:text-indigo-900"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">attach_file</span><span className="min-w-0 truncate">{attachment.name}</span></a>{canAddFiles && <button type="button" onClick={() => onRemoveFile(attachment.id)} className="inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500" aria-label={`Remove ${attachment.name}`} title="Remove file"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span></button>}</li>)}</ul> : <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">No attached files.</p>}
  </section>;
};

const ResolutionPanel: React.FC<{
  ticket: Ticket;
  resolutionDetails: string;
  setResolutionDetails: (value: string) => void;
  onResolve: () => void;
}> = ({ ticket, resolutionDetails, setResolutionDetails, onResolve }) => {
  const resolved = ticket.status === "Resolved" || ticket.status === "Closed";
  const detailValue = ticket.resolutionDetails || resolutionDetails;
  return <div className="space-y-4">
    <section className="p-5" aria-labelledby="resolution-heading">
      <h3 id="resolution-heading" className="text-sm font-bold text-slate-900">Resolution details</h3>
      <p className="mt-1 text-xs text-slate-600">Summarize the fix or outcome before resolving this ticket.</p>
      <textarea autoFocus={!resolved} required={!resolved} readOnly={resolved} value={detailValue} onChange={(event) => setResolutionDetails(event.target.value)} rows={4} className="mt-3 w-full rounded-md border border-slate-200 p-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50" aria-label="Resolution details" />
      {!resolved && <div className="mt-3 flex justify-end"><button type="button" disabled={!resolutionDetails.trim()} onClick={onResolve} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Resolve ticket</button></div>}
    </section>
  </div>;
};

const NotifyPanel: React.FC<{
  ticket: Ticket;
  attachments: Attachment[];
  notificationNotes: string;
  setNotificationNotes: (value: string) => void;
  onNotify: (channel: "email" | "whatsapp" | "phone") => void;
  canClose: boolean;
  onClose: () => void;
  clientEmail: string;
  clientPhone: string;
}> = ({ ticket, attachments, notificationNotes, setNotificationNotes, onNotify, canClose, onClose, clientEmail, clientPhone }) => {
  const phoneHref = clientPhone.replace(/[^\d+]/g, "");
  const message = [
    `Ticket ${ticket.code}: ${ticket.title}`,
    ticket.resolutionDetails ? `Resolution: ${ticket.resolutionDetails}` : "",
    notificationNotes.trim() ? `Additional notes: ${notificationNotes.trim()}` : "",
  ].filter(Boolean).join("\n\n");
  const whatsappHref = phoneHref ? `https://wa.me/${phoneHref.replace(/^\+/, "")}?text=${encodeURIComponent(message)}` : undefined;
  const emailHref = clientEmail ? `mailto:${clientEmail}?subject=${encodeURIComponent(`Resolution for ${ticket.code}`)}&body=${encodeURIComponent(message)}` : undefined;

  return <div className="space-y-4 p-5" aria-labelledby="notify-heading">
    <section>
      <h3 id="notify-heading" className="text-sm font-bold text-slate-900">Notify client</h3>
      <p className="mt-1 text-xs text-slate-600">Review the resolution and files, add any extra notes, then notify the client before closing.</p>
    </section>
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="notify-resolution-heading">
      <h4 id="notify-resolution-heading" className="text-xs font-bold uppercase tracking-wide text-slate-500">Resolution</h4>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{ticket.resolutionDetails || "No resolution details recorded."}</p>
    </section>
    <section aria-labelledby="notify-files-heading">
      <h4 id="notify-files-heading" className="text-xs font-bold uppercase tracking-wide text-slate-500">Files</h4>
      {attachments.length ? <ul className="mt-2 grid gap-2 sm:grid-cols-2">{attachments.map((attachment) => <li key={attachment.id}><a href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><span className="material-symbols-outlined text-base" aria-hidden="true">attach_file</span><span className="truncate">{attachment.name}</span></a></li>)}</ul> : <p className="mt-2 text-xs text-slate-400">No files attached.</p>}
    </section>
    <label className="block text-xs font-bold text-slate-700" htmlFor="notification-notes">Extra notes
      <textarea id="notification-notes" value={notificationNotes} onChange={(event) => setNotificationNotes(event.target.value)} rows={3} placeholder="Add context to include in the client message…" className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
    </label>
    <div className="flex flex-wrap gap-2">
      <a href={emailHref} onClick={() => onNotify("email")} className="rounded-md bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800"><span className="material-symbols-outlined mr-1 align-middle text-base">mail</span>Email</a>
      <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => onNotify("whatsapp")} className="rounded-md bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"><span className="material-symbols-outlined mr-1 align-middle text-base">chat</span>WhatsApp</a>
      <a href={phoneHref ? `tel:${phoneHref}` : undefined} onClick={() => onNotify("phone")} className="rounded-md bg-violet-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-violet-800"><span className="material-symbols-outlined mr-1 align-middle text-base">phone</span>Phone</a>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <p role="status" className="text-xs font-semibold text-slate-600">{ticket.clientNotifiedVia ? `Notified via ${ticket.clientNotifiedVia === "whatsapp" ? "WhatsApp" : ticket.clientNotifiedVia}.` : "Notify the client to enable closing."}</p>
      <button type="button" disabled={!canClose} onClick={onClose} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300">Close ticket</button>
    </div>
  </div>;
};

const ClientPanel: React.FC<{
  ticket: Ticket;
  company?: Company;
  clientEmail: string;
  clientPhone: string;
  onViewCompany?: (companyId: string) => void;
  onOpenNotification?: () => void;
}> = ({ ticket, company, clientEmail, clientPhone, onViewCompany, onOpenNotification }) => {
  const contact = company?.contacts?.find((item) => item.id === ticket.contactId);
  const details = [
    ["Company", company?.name || ticket.companyName],
    ["Company code", company?.code || ticket.companyCode],
    ["Client", contact?.name || ticket.clientContact],
    ["Role", contact?.role || company?.contactRole || "—"],
    ["Email", clientEmail || "Not available"],
    ["Phone", clientPhone || "Not available"],
  ];
  const resolved = ticket.status === "Resolved" || ticket.status === "Closed";
  return <div className="space-y-4">
    <section className="p-5" aria-labelledby="client-details-heading">
      <h3 id="client-details-heading" className="text-sm font-bold text-slate-900">Client details</h3>
      <p className="mt-1 text-xs text-slate-600">Contact information linked to this ticket.</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {details.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{label === "Company" && onViewCompany ? <button type="button" onClick={() => onViewCompany(ticket.companyId)} className="text-left text-indigo-700 hover:text-indigo-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{value}</button> : value}</dd></div>)}
      </dl>
    </section>
    {resolved && <section className="rounded-xl border border-blue-200 bg-blue-50 p-4" aria-labelledby="client-notification-heading"><h3 id="client-notification-heading" className="text-sm font-bold text-slate-900">Client notification</h3><p className="mt-1 text-xs text-slate-600">Notify the client about the resolution before closing this ticket.</p><button type="button" onClick={onOpenNotification} className="mt-3 rounded-md bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800">Open notification page <span aria-hidden="true">›</span></button></section>}
  </div>;
};
