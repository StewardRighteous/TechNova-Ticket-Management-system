import { ExternalLink, DeleteDialog, Button, Heading, Icon, Input, Label, Textarea } from "../../../ui/barrel";
import React, { useState } from "react";
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
import { formatSupportDeadline, ticketSlaRisk } from "../../../utils/supportPolicy";

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
}) => {
  const { addToast, addTicketTimelineNote, notifyTicketClient, recordFirstResponse, activeRole } = useTicketStore();
  const canDeleteTicket = Boolean(onDelete && ROLE_PERMISSIONS[activeRole].canManageTeam);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const clientNotifiedVia = ticket.clientNotifiedVia;
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [tabSelection, setTabSelection] = useState<{ status: TicketStatus; tab: "issue" | "history" | "notes" | "files" | "client" | "resolution" | "notify" }>({ status: ticket.status, tab: "issue" });
  const defaultTabByStatus: Record<TicketStatus, typeof tabSelection.tab> = {
    Open: "issue",
    "In Progress": "history",
    Escalated: "notes",
    "Under Review": "client",
    "Pending QA": "resolution",
    Resolved: "notify",
    Closed: "notify",
  };
  const activeDetailTab = tabSelection.status === ticket.status ? tabSelection.tab : defaultTabByStatus[ticket.status];
  const [messageDraft, setMessageDraft] = useState<string | null>(null);
  const fileNames = ticket.attachments?.map((file) => file.name).join(", ");
  const clientMessage = messageDraft ?? (ticket.clientNotifiedVia && ticket.clientNotificationNotes) ?? [
    `Ticket ${ticket.code}: ${ticket.title}`,
    ticket.resolutionDetails,
    fileNames && `Files: ${fileNames}`,
  ].filter(Boolean).join("\n\n");
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
        ? { title: "Ticket escalated", description: ticket.description, button: "Send to review", target: "Under Review" as TicketStatus, icon: "warning", tone: "amber" }
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
  const isClosedStage = ticket.status === "Closed";
  const detailTabs = [
    ["issue", "Issue"], ["history", "History"], ["notes", "Notes"], ["files", "Files"], ["client", "Client"],
    ...(isQaStage ? [["resolution", "Resolution"]] : []),
    ...(isResolvedStage || isClosedStage ? [["notify", "Notify"]] : []),
  ] as [typeof activeDetailTab, string][];

  const handleEscalate = () => {
    onStatusChange("Escalated");
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
    notifyTicketClient(ticket.id, channel, clientMessage);
    addToast(`${ticket.code} notification recorded via ${channel === "whatsapp" ? "WhatsApp" : channel}`, "success");
  };

  const handleOpenResolution = () => {
    setTabSelection({ status: ticket.status, tab: "resolution" });
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
      <HeroBanner ticket={ticket} onDelete={canDeleteTicket ? () => setDeleteConfirmationOpen(true) : undefined} />
      {ticket.slaPolicyApplied && <section aria-label="Ticket SLA" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-xs">
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          <div><dt className="font-semibold text-slate-600">SLA status</dt><dd>{ticketSlaRisk(ticket)}</dd></div>
          {ticket.firstResponseDueAt && <div><dt className="font-semibold text-slate-600">First response due</dt><dd><time dateTime={ticket.firstResponseDueAt}>{formatSupportDeadline(ticket.firstResponseDueAt)}</time></dd></div>}
          {ticket.firstRespondedAt && <div><dt className="font-semibold text-slate-600">First response recorded</dt><dd><time dateTime={ticket.firstRespondedAt}>{formatSupportDeadline(ticket.firstRespondedAt)}</time></dd></div>}
          {ticket.dueAt && <div><dt className="font-semibold text-slate-600">Resolution due</dt><dd><time dateTime={ticket.dueAt}>{formatSupportDeadline(ticket.dueAt)}</time></dd></div>}
        </dl>
        {ticket.firstResponseDueAt && !ticket.firstRespondedAt && !isClosedStage && <Button tone="plain" type="button" onClick={() => recordFirstResponse(ticket.id)} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold">Record first response sent</Button>}
      </section>}

      <section aria-label="Ticket progress" className="py-1">
        <ol className="grid grid-cols-7">
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
              <span className={`mt-1.5 text-[9px] font-semibold sm:text-[10px] ${current ? toneClasses.split(" ")[2] : priorComplete ? "text-emerald-800" : "text-slate-500"}`}>{stage}</span>
            </li>;
          })}
        </ol>
      </section>

      <section aria-labelledby="ticket-current-stage">
            <div className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:p-4 ${action.tone === "amber" ? "border-amber-200 bg-amber-50" : action.tone === "cyan" ? "border-cyan-200 bg-cyan-50" : action.tone === "violet" ? "border-violet-200 bg-violet-50" : action.tone === "emerald" ? "border-emerald-200 bg-emerald-50" : action.tone === "slate" ? "border-slate-300 bg-slate-50" : "border-indigo-200 bg-indigo-50"}`}>
              <span className="hidden size-10 shrink-0 self-center items-center justify-center rounded-lg bg-white/80 text-blue-700 sm:flex" aria-hidden="true"><Icon className="block text-2xl leading-none">{action.icon}</Icon></span>
              <div className="min-w-0 flex-1">
                <Heading variant="subsection" id="ticket-current-stage">{action.title}</Heading>
                <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-700">{action.title === "Ticket resolved" || action.title === "Ticket closed" ? action.description : `Current stage: ${ticket.status}. Use the action to move this ticket forward.`}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
              {previousStage && canTransitionTicket(activeRole, ticket.status, previousStage) && <Button tone="plain" type="button" onClick={() => onStatusChange(previousStage)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><span aria-hidden="true">‹ </span>Back to {previousStage}</Button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Escalated") && <Button tone="plain" type="button" onClick={handleEscalate} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800">Escalate</Button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Under Review") && <Button tone="plain" type="button" onClick={() => onStatusChange("Under Review")} className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">Request review</Button>}
              {ticket.status === "Escalated" && canTakePrimaryAction && <Button tone="plain" type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700">{action.button} <span aria-hidden="true">›</span></Button>}
              {ticket.status === "Open" && canTakePrimaryAction && <Button tone="plain" type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">{action.button} <span aria-hidden="true">›</span></Button>}
              {ticket.status === "Under Review" && canTakePrimaryAction && <Button tone="plain" type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-800">{action.button} <span aria-hidden="true">›</span></Button>}
              {ticket.status === "Pending QA" && canTakePrimaryAction && <Button tone="plain" type="button" onClick={handleOpenResolution} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800">{action.button} <span aria-hidden="true">›</span></Button>}
              {ticket.status === "Resolved" && <Button tone="plain" type="button" disabled={!canCloseTicket} onClick={() => onStatusChange(action.target)} title={!clientNotifiedVia ? "Notify the client before closing this ticket" : undefined} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300">{action.button} <span aria-hidden="true">›</span></Button>}
              {ticket.status === "Closed" && canTransitionTicket(activeRole, ticket.status, "In Progress") && <Button tone="plain" type="button" onClick={() => onStatusChange("In Progress")} className="rounded-md bg-slate-700 px-4 py-2.5 text-xs font-bold text-white">{action.button} <span aria-hidden="true">›</span></Button>}
              </div>
            </div>
      </section>

      {deleteConfirmationOpen && canDeleteTicket && onDelete && <DeleteDialog
        title="Delete ticket?"
        description={`This will permanently remove ${ticket.code} and its ticket history. This action cannot be undone.`}
        verification={ticket.code}
        onCancel={() => setDeleteConfirmationOpen(false)}
        onDelete={onDelete}
        deleteLabel="Delete ticket"
      />}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Ticket information" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {detailTabs.map(([key, label]) => <Button tone="plain" key={key} type="button" role="tab" aria-selected={activeDetailTab === key} onClick={() => setTabSelection({ status: ticket.status, tab: key })} className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-semibold ${activeDetailTab === key ? "border-b-2 border-blue-700 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{label}{key === "files" && ticket.attachments?.length ? <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{ticket.attachments.length}</span> : null}</Button>)}
        </div>
        <div role="tabpanel">
          {activeDetailTab === "issue" && <IssueOverviewCard ticket={ticket} />}
          {activeDetailTab === "history" && <TicketHistoryPanel ticket={ticket} employees={employees} canManageTeam={ROLE_PERMISSIONS[activeRole].canManageTeam} canEscalate={canTransitionTicket(activeRole, ticket.status, "Escalated")} onEscalate={handleEscalate} canRequestQa={canTransitionTicket(activeRole, ticket.status, "Pending QA")} onRequestQa={handleRequestQa} canResolve={canTransitionTicket(activeRole, ticket.status, "Resolved")} onMarkResolved={handleOpenResolution} onAssigneeChange={onAssigneeChange} onStatusChange={onStatusChange} onViewEmployee={onViewEmployee} />}
          {activeDetailTab === "notes" && <TicketNotesPanel notes={ticket.internalNotes ?? []} employees={employees} onAddNote={handleAddInternalNote} />}
          {activeDetailTab === "files" && <FilesPanel attachments={ticket.attachments ?? []} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} canAddFiles={Boolean(onUpdateTicket)} />}
          {activeDetailTab === "client" && <ClientPanel ticket={ticket} company={company} clientEmail={clientEmail} clientPhone={clientPhone} onViewCompany={onViewCompany} />}
          {activeDetailTab === "resolution" && isQaStage && <ResolutionPanel ticket={ticket} resolutionDetails={resolutionDetails} setResolutionDetails={setResolutionDetails} onResolve={handleResolve} />}
          {activeDetailTab === "notify" && (isResolvedStage || isClosedStage) && <NotifyPanel ticket={ticket} message={clientMessage} onMessageChange={setMessageDraft} onNotify={handleNotify} clientEmail={clientEmail} clientPhone={clientPhone} primaryChannel={company?.preferredChannel} closed={isClosedStage} />}
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
        <Heading as="h3" variant="subsection" id="ticket-files-heading">Attached files</Heading>
        <p className="mt-1 text-xs text-slate-500">Files submitted with or added to this ticket.</p>
      </div>
      {canAddFiles && <div className="flex flex-col items-end gap-1">
        <Label variant="plain" className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
          <Icon className="text-base" aria-hidden="true">upload_file</Icon>{loading ? "Reading files…" : "Add files"}
          <Input appearance="plain" type="file" multiple className="sr-only" onChange={handleFiles} disabled={loading} aria-label="Add files" />
        </Label>
        <p className="text-[11px] text-slate-400">Any file type, up to 5 MB per file.</p>
      </div>}
    </div>
    {error && <p role="alert" className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
    {attachments.length ? <ul className="grid gap-3 sm:grid-cols-2">{attachments.map((attachment) => <li key={attachment.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"><ExternalLink href={attachment.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 text-xs font-semibold text-indigo-700 hover:text-indigo-900"><Icon className="text-[20px]" aria-hidden="true">attach_file</Icon><span className="min-w-0 truncate">{attachment.name}</span></ExternalLink>{canAddFiles && <Button tone="plain" type="button" onClick={() => onRemoveFile(attachment.id)} className="inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500" aria-label={`Remove ${attachment.name}`} title="Remove file"><Icon className="text-[18px]" aria-hidden="true">delete</Icon></Button>}</li>)}</ul> : <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">No attached files.</p>}
  </section>;
};

const ResolutionPanel: React.FC<{
  ticket: Ticket;
  resolutionDetails: string;
  setResolutionDetails: (value: string) => void;
  onResolve: () => void;
}> = ({ ticket, resolutionDetails, setResolutionDetails, onResolve }) => {
  const resolved = ticket.status === "Resolved" || ticket.status === "Closed";
  const detailValue = resolved ? ticket.resolutionDetails ?? "" : resolutionDetails;
  return <div className="space-y-4">
    <section className="p-5" aria-labelledby="resolution-heading">
      <Heading as="h3" variant="subsection" id="resolution-heading">Resolution details</Heading>
      <p className="mt-1 text-xs text-slate-600">Summarize the fix or outcome before resolving this ticket.</p>
      <Textarea appearance="plain" autoFocus={!resolved} required={!resolved} readOnly={resolved} value={detailValue} placeholder="Describe the fix and how you verified it…" onChange={(event) => setResolutionDetails(event.target.value)} rows={4} className="mt-3 w-full rounded-md border border-slate-200 p-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50" aria-label="Resolution details" />
      {!resolved && <div className="mt-3 flex justify-end"><Button tone="plain" type="button" disabled={!resolutionDetails.trim()} onClick={onResolve} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Resolve ticket</Button></div>}
    </section>
  </div>;
};

const NotifyPanel: React.FC<{
  ticket: Ticket;
  message: string;
  onMessageChange: (message: string) => void;
  onNotify: (channel: "email" | "whatsapp" | "phone") => void;
  clientEmail: string;
  clientPhone: string;
  primaryChannel?: "email" | "whatsapp" | "phone";
  closed: boolean;
}> = ({ ticket, message, onMessageChange, onNotify, clientEmail, clientPhone, primaryChannel, closed }) => {
  const phoneHref = clientPhone.replace(/[^\d+]/g, "");
  const whatsappHref = phoneHref ? `https://wa.me/${phoneHref.replace(/^\+/, "")}?text=${encodeURIComponent(message)}` : undefined;
  const emailHref = clientEmail ? `mailto:${clientEmail}?subject=${encodeURIComponent(`Resolution for ${ticket.code}`)}&body=${encodeURIComponent(message)}` : undefined;

  const channels = [
    { id: "email", label: "Email", icon: "mail", href: emailHref },
    { id: "whatsapp", label: "WhatsApp", icon: "chat", href: whatsappHref },
    { id: "phone", label: "Phone", icon: "phone", href: phoneHref ? `tel:${phoneHref}` : undefined },
  ] as const;

  return <section className="p-5" aria-labelledby="notify-heading">
    <Heading as="h3" variant="subsection" id="notify-heading">Notify client</Heading>
    {closed && <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Ticket closed. Client notification recorded via {channels.find((channel) => channel.id === ticket.clientNotifiedVia)?.label || "the selected channel"}.</div>}
    <div className={`mt-3 grid gap-3 ${closed ? "grid-cols-1" : "sm:grid-cols-[1fr_auto]"}`}>
      <Textarea appearance="plain" aria-label="Client message" value={message} readOnly={closed} onChange={(event) => onMessageChange(event.target.value)}
        rows={6} placeholder="Write a message to the client..." className="min-w-0 rounded-lg border border-slate-300 p-3 text-sm leading-relaxed read-only:bg-slate-50 focus:border-indigo-600 focus:outline-indigo-600" />
      {!closed && <div className="flex flex-wrap items-start justify-start gap-2 sm:flex-col sm:items-stretch">
        {channels.map(({ id, label, icon, href }) => {
          const enabled = Boolean(href && message.trim());
          return <ExternalLink key={id} href={enabled ? href : undefined} aria-disabled={!enabled}
            target={id === "whatsapp" ? "_blank" : undefined} rel={id === "whatsapp" ? "noreferrer" : undefined}
            onClick={() => { if (enabled) onNotify(id); }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold aria-disabled:cursor-not-allowed aria-disabled:bg-slate-300 ${id === primaryChannel ? "bg-indigo-700 text-white hover:bg-indigo-800 aria-disabled:bg-indigo-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 aria-disabled:text-slate-400"}`}>
            <Icon aria-hidden="true" className="text-base">{icon}</Icon>{label}
          </ExternalLink>;
        })}
      </div>}
    </div>
    {!closed && <p role="status" className="mt-3 text-xs text-slate-600">{ticket.clientNotifiedVia ? `Notification recorded via ${channels.find((channel) => channel.id === ticket.clientNotifiedVia)?.label}.` : "Notify the client before closing the ticket."}</p>}
  </section>;
};

const ClientPanel: React.FC<{
  ticket: Ticket;
  company?: Company;
  clientEmail: string;
  clientPhone: string;
  onViewCompany?: (companyId: string) => void;
}> = ({ ticket, company, clientEmail, clientPhone, onViewCompany }) => {
  const contact = company?.contacts?.find((item) => item.id === ticket.contactId);
  const details = [
    ["Company", company?.name || ticket.companyName],
    ["Company code", company?.code || ticket.companyCode],
    ["Client", contact?.name || ticket.clientContact],
    ["Role", contact?.role || company?.contactRole || "—"],
    ["Email", clientEmail || "Not available"],
    ["Phone", clientPhone || "Not available"],
    ...(ticket.supportSite ? [["Affected site or tenant", ticket.supportSite]] : []),
  ];
  return <div className="space-y-4">
    <section className="p-5" aria-labelledby="client-details-heading">
      <Heading as="h3" variant="subsection" id="client-details-heading">Client details</Heading>
      <p className="mt-1 text-xs text-slate-600">Contact information linked to this ticket.</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {details.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{label === "Company" && onViewCompany ? <Button tone="plain" type="button" onClick={() => onViewCompany(ticket.companyId)} className="text-left text-indigo-700 hover:text-indigo-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{value}</Button> : value}</dd></div>)}
      </dl>
    </section>
  </div>;
};
