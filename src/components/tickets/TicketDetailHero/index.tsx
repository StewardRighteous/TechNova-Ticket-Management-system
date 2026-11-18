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
import { TabbedTimeline } from "../TabbedTimeline";
import { OwnershipCard } from "../OwnershipCard";
import { useTicketStore } from "../../../store/barrel";
import { TicketDetailsPanel } from "../TicketDetailsPanel/barrel";
import { canTransitionTicket, getAllowedTicketTransitions } from "../../../utils/rolePermissions";

interface TicketDetailHeroProps {
  ticket: Ticket;
  employees: Employee[];
  onStatusChange: (status: TicketStatus, note?: string) => void;
  onAssigneeChange: (empId: string, note?: string) => void;
  companies?: Company[];
  services?: ServiceLine[];
  onUpdateTicket?: (updates: Partial<Ticket>) => void;
}

export const TicketDetailHero: React.FC<TicketDetailHeroProps> = ({
  ticket,
  employees,
  onStatusChange,
  onAssigneeChange,
  companies = [],
  services = [],
  onUpdateTicket,
}) => {
  const { addToast, addTicketTimelineNote, activeRole } = useTicketStore();
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [assigneeId, setAssigneeId] = useState(ticket.assignedToId);
  const [nextStatus, setNextStatus] = useState<TicketStatus | "">("");
  const [activeDetailTab, setActiveDetailTab] = useState<"issue" | "activity" | "details" | "files" | "owner">("issue");
  const statusOnlyOptions = getAllowedTicketTransitions(activeRole, ticket.status)
    .filter((status) => status !== "Escalated" && status !== "Pending QA" && status !== "Resolved");
  const stages: TicketStatus[] = ["Open", "In Progress", "Escalated", "Under Review", "Pending QA", "Resolved", "Closed"];
  const stageIndex = stages.indexOf(ticket.status);
  const previousStage = stageIndex > 0 ? stages[stageIndex - 1] : undefined;
  const action = ticket.status === "Open"
    ? { title: "New customer request", description: ticket.description, button: "Begin triage", target: "In Progress" as TicketStatus, icon: "description", tone: "indigo" }
    : ticket.status === "In Progress"
      ? { title: "Investigation in progress", description: ticket.description, button: "Request review", target: "Under Review" as TicketStatus, icon: "search", tone: "indigo" }
      : ticket.status === "Escalated"
        ? { title: "Escalated to senior support", description: ticket.description, button: "Continue investigation", target: "In Progress" as TicketStatus, icon: "warning", tone: "amber" }
        : ticket.status === "Under Review"
          ? { title: "Solution under review", description: ticket.description, button: "Request QA review", target: "Pending QA" as TicketStatus, icon: "layers", tone: "cyan" }
          : ticket.status === "Pending QA"
            ? { title: "QA validation in progress", description: ticket.description, button: "Approve resolution", target: "Resolved" as TicketStatus, icon: "science", tone: "violet" }
            : ticket.status === "Resolved"
              ? { title: "Ticket resolved", description: ticket.resolutionDetails || ticket.description, button: "Close ticket", target: "Closed" as TicketStatus, icon: "check_circle", tone: "emerald" }
              : { title: "Ticket closed", description: ticket.resolutionDetails || ticket.description, button: "Reopen ticket", target: "In Progress" as TicketStatus, icon: "flag", tone: "slate" };
  const canTakePrimaryAction = canTransitionTicket(activeRole, ticket.status, action.target);

  useEffect(() => setAssigneeId(ticket.assignedToId), [ticket.assignedToId]);

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
    setResolutionOpen(false);
    setResolutionDetails("");
    addToast(`${ticket.code} marked as resolved`, "success");
  };

  const handleAddInternalNote = (body: string) => {
    addTicketTimelineNote(ticket.id, body);
    addToast("Internal note added", "success");
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 shadow-sm">
      <HeroBanner ticket={ticket} />

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
              <span className="material-symbols-outlined hidden size-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-2xl text-blue-700 sm:flex">{action.icon}</span>
              <div className="min-w-0 flex-1">
                <h2 id="ticket-current-stage" className="text-sm font-bold text-slate-900">{action.title}</h2>
                <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-700">{action.title === "Ticket resolved" || action.title === "Ticket closed" ? action.description : `Current stage: ${ticket.status}. Use the action to move this ticket forward.`}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
              {previousStage && canTransitionTicket(activeRole, ticket.status, previousStage) && <button type="button" onClick={() => onStatusChange(previousStage)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><span aria-hidden="true">‹ </span>Back to {previousStage}</button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Escalated") && <button type="button" onClick={handleEscalate} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800">Escalate</button>}
              {ticket.status === "In Progress" && canTransitionTicket(activeRole, ticket.status, "Under Review") && <button type="button" onClick={() => onStatusChange("Under Review")} className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">Request review</button>}
              {ticket.status === "Escalated" && canTransitionTicket(activeRole, ticket.status, "In Progress") && <button type="button" onClick={() => onStatusChange("In Progress")} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700">Continue investigation</button>}
              {ticket.status === "Open" && canTakePrimaryAction && <button type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Under Review" && canTakePrimaryAction && <button type="button" onClick={() => onStatusChange(action.target)} className="rounded-md bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-800">{action.button} <span aria-hidden="true">›</span></button>}
              {(ticket.status === "Pending QA" || ticket.status === "Resolved") && canTakePrimaryAction && <button type="button" onClick={() => ticket.status === "Pending QA" ? setResolutionOpen(true) : onStatusChange(action.target)} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800">{action.button} <span aria-hidden="true">›</span></button>}
              {ticket.status === "Closed" && canTransitionTicket(activeRole, ticket.status, "In Progress") && <button type="button" onClick={() => onStatusChange("In Progress")} className="rounded-md bg-slate-700 px-4 py-2.5 text-xs font-bold text-white">{action.button} <span aria-hidden="true">›</span></button>}
              </div>
            </div>
          </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Ticket information" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {([ ["issue", "Issue"], ["activity", "Activity"], ["details", "Details"], ...(ticket.attachments?.length ? [["files", "Files"] as [string, string]] : []), ["owner", "Ownership"] ] as [string, string][]).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={activeDetailTab === key} onClick={() => setActiveDetailTab(key as typeof activeDetailTab)} className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-semibold ${activeDetailTab === key ? "border-b-2 border-blue-700 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{label}</button>)}
        </div>
        <div role="tabpanel" className="p-4 sm:p-5">
          {activeDetailTab === "issue" && <IssueOverviewCard ticket={ticket} />}
          {activeDetailTab === "activity" && <TabbedTimeline timeline={ticket.timeline} internalNotes={ticket.internalNotes ?? []} employees={employees} onAddInternalNote={handleAddInternalNote} />}
          {activeDetailTab === "details" && onUpdateTicket && <TicketDetailsPanel ticket={ticket} companies={companies} services={services} onSave={(updates) => { onUpdateTicket(updates); addToast(`${ticket.code} details saved`, "success"); }} />}
          {activeDetailTab === "files" && <ul className="flex flex-wrap gap-3">{ticket.attachments?.map((attachment) => <li key={attachment.id}><a href={attachment.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 p-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">{attachment.name}</a></li>)}</ul>}
          {activeDetailTab === "owner" && <div className="grid gap-4 lg:grid-cols-2"><OwnershipCard ticket={ticket} employees={employees} />

          {/* Workflow and administration controls live with ownership data. */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Workflow Actions</h4>

            {canTransitionTicket(activeRole, ticket.status, "Escalated") && <WorkflowButton
              icon="trending_up"
              label="Escalate to Senior Support"
              description="Assign to Senior Support and move this ticket to Escalated"
              onClick={handleEscalate}
            />}

            {canTransitionTicket(activeRole, ticket.status, "Pending QA") && <WorkflowButton
              icon="fact_check"
              label="Request QA Review"
              description="Assign to QA and move this ticket to Pending QA"
              onClick={handleRequestQa}
            />}

            {canTransitionTicket(activeRole, ticket.status, "Resolved") && <WorkflowButton
              icon="check_circle"
              label="Mark Resolved"
              description="Close the investigation and mark complete"
              onClick={() => setResolutionOpen(true)}
            />}

            {statusOnlyOptions.length > 0 && <div className="border-t border-slate-100 pt-3">
              <label htmlFor="ticket-status-transition" className="block text-xs font-semibold text-slate-700">Status only · keeps current assignee</label>
              <div className="mt-2 flex gap-2">
                <select id="ticket-status-transition" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as TicketStatus | "")} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  <option value="">Choose a status</option>
                  {statusOnlyOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" disabled={!nextStatus} onClick={() => { if (nextStatus) { onStatusChange(nextStatus); setNextStatus(""); } }} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
              </div>
            </div>}

            {/* Reassignment */}
            {(activeRole === "operations_manager" || activeRole === "management") && <div className="border-t border-slate-100 pt-3">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Reassign Ticket
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
              <button type="button" disabled={assigneeId === ticket.assignedToId} onClick={() => { onAssigneeChange(assigneeId); }} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Apply reassignment</button>
            </div>}
          </div></div>}
          {resolutionOpen && <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm" role="dialog" aria-modal="true" aria-labelledby="resolution-heading">
            <h3 id="resolution-heading" className="text-sm font-bold text-slate-900">Resolution details</h3>
            <p className="mt-1 text-xs text-slate-600">Summarize the fix or outcome before resolving this ticket.</p>
            <textarea autoFocus required value={resolutionDetails} onChange={(event) => setResolutionDetails(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Resolution details" />
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => { setResolutionOpen(false); setResolutionDetails(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button><button type="button" disabled={!resolutionDetails.trim()} onClick={handleResolve} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Resolve ticket</button></div>
          </div>}
        </div>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const WorkflowButton: React.FC<{
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, description, onClick, disabled = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`group flex w-full items-start gap-3 rounded-xl border border-slate-100 p-3 text-left transition-colors ${
      disabled
        ? "cursor-not-allowed opacity-40"
        : "hover:border-indigo-200 hover:bg-indigo-50/50"
    }`}
  >
    <span className="material-symbols-outlined mt-0.5 text-[18px] text-indigo-500">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-slate-800">{label}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
    </div>
    <span className="material-symbols-outlined mt-0.5 text-[16px] text-slate-300 transition-colors group-hover:text-indigo-500">
      arrow_forward
    </span>
  </button>
);
