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
  const statusOnlyOptions = getAllowedTicketTransitions(activeRole, ticket.status)
    .filter((status) => status !== "Escalated" && status !== "Pending QA" && status !== "Resolved");

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
      <HeroBanner ticket={ticket} />

      {/* 2-column workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column — issue overview + tabbed timeline */}
        <div className="space-y-4 lg:col-span-2">
          <section id="ticket-issue"><IssueOverviewCard ticket={ticket} /></section>

          {ticket.attachments?.length ? <section id="ticket-attachments" aria-labelledby="ticket-attachments-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 id="ticket-attachments-heading" className="text-sm font-bold text-slate-900">Attachments ({ticket.attachments.length})</h3><ul className="mt-3 flex flex-wrap gap-3">{ticket.attachments.map((attachment) => <li key={attachment.id}><a href={attachment.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 p-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"><img src={attachment.url} alt="" className="mb-2 h-24 w-32 rounded object-cover" /><span>{attachment.name}</span></a></li>)}</ul></section> : null}

          <section id="ticket-activity"><TabbedTimeline
            timeline={ticket.timeline}
            internalNotes={ticket.internalNotes ?? []}
            employees={employees}
            onAddInternalNote={handleAddInternalNote}
          /></section>

          {onUpdateTicket && (
            <section id="ticket-details"><TicketDetailsPanel
              ticket={ticket}
              companies={companies}
              services={services}
              onSave={(updates) => {
                onUpdateTicket(updates);
                addToast(`${ticket.code} details saved`, "success");
              }}
            /></section>
          )}
        </div>

        {/* Right column — ownership + workflow sidebar */}
        <div className="space-y-4">
          <OwnershipCard ticket={ticket} employees={employees} />

          {/* Workflow actions card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Workflow Actions
            </h4>

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
          </div>
          {resolutionOpen && <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm" role="dialog" aria-modal="true" aria-labelledby="resolution-heading">
            <h3 id="resolution-heading" className="text-sm font-bold text-slate-900">Resolution details</h3>
            <p className="mt-1 text-xs text-slate-600">Summarize the fix or outcome before resolving this ticket.</p>
            <textarea autoFocus required value={resolutionDetails} onChange={(event) => setResolutionDetails(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Resolution details" />
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => { setResolutionOpen(false); setResolutionDetails(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button><button type="button" disabled={!resolutionDetails.trim()} onClick={handleResolve} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Resolve ticket</button></div>
          </div>}
        </div>
      </div>
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
