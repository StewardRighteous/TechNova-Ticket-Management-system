import React from "react";
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

interface TicketDetailHeroProps {
  ticket: Ticket;
  employees: Employee[];
  onStatusChange: (status: TicketStatus) => void;
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

  const handleEscalate = () => {
    onStatusChange("Escalated");
    addToast(`${ticket.code} escalated to Senior Support / Dev`, "warning");
  };

  const handleRequestQa = () => {
    onStatusChange("Pending QA");
    addToast(`${ticket.code} sent for QA review`, "info");
  };

  const handleResolve = () => {
    onStatusChange("Resolved");
    addToast(`${ticket.code} marked as resolved`, "success");
  };

  const handleAddInternalNote = (body: string) => {
    addTicketTimelineNote(ticket.id, body);
    addToast("Internal note added", "success");
  };

  return (
    <div className="space-y-4">
      <HeroBanner
        ticket={ticket}
        onEscalate={handleEscalate}
        onRequestQa={handleRequestQa}
        onResolve={handleResolve}
      />

      {/* 2-column workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column — issue overview + tabbed timeline */}
        <div className="space-y-4 lg:col-span-2">
          <IssueOverviewCard ticket={ticket} />

          <TabbedTimeline
            timeline={ticket.timeline}
            internalNotes={ticket.internalNotes ?? []}
            employees={employees}
            onAddInternalNote={handleAddInternalNote}
          />

          {onUpdateTicket && (
            <TicketDetailsPanel
              ticket={ticket}
              companies={companies}
              services={services}
              onSave={(updates) => {
                onUpdateTicket(updates);
                addToast(`${ticket.code} details saved`, "success");
              }}
            />
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

        {activeRole !== "development_team" && activeRole !== "qa" && <WorkflowButton
              icon="trending_up"
              label="Escalate to Senior Support / Dev"
              description="Route this ticket to L2/L3 for deeper investigation"
              onClick={handleEscalate}
              disabled={
                ticket.status === "Escalated" ||
                ticket.status === "Resolved" ||
                ticket.status === "Closed"
              }
        />}

            <WorkflowButton
              icon="fact_check"
              label="Request QA Review"
              description="Submit for QA testing and verification"
              onClick={handleRequestQa}
              disabled={
                ticket.status === "Pending QA" ||
                ticket.status === "Resolved" ||
                ticket.status === "Closed"
              }
            />

            <WorkflowButton
              icon="check_circle"
              label="Mark Resolved"
              description="Close the investigation and mark complete"
              onClick={handleResolve}
              disabled={
                ticket.status === "Resolved" || ticket.status === "Closed"
              }
            />

            {/* Reassignment */}
            {activeRole !== "development_team" && activeRole !== "qa" && <div className="border-t border-slate-100 pt-3">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Reassign Ticket
              </label>
              <select
                value={ticket.assignedToId}
                onChange={(e) => onAssigneeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>}
          </div>
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
