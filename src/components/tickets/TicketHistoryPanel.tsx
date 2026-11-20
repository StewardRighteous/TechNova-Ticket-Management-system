import React, { useState } from "react";
import type { Employee, Ticket, TicketStatus } from "../../types/barrel";
import { StaffAvatar } from "../common/StaffAvatar";

interface TicketHistoryPanelProps {
  ticket: Ticket;
  employees: Employee[];
  canManageTeam: boolean;
  canEscalate: boolean;
  onEscalate: () => void;
  canRequestQa: boolean;
  onRequestQa: () => void;
  canResolve: boolean;
  onMarkResolved: () => void;
  onAssigneeChange: (employeeId: string, note?: string) => void;
  onStatusChange: (status: TicketStatus) => void;
  onViewEmployee?: (employeeId: string) => void;
}

export const TicketHistoryPanel: React.FC<TicketHistoryPanelProps> = ({
  ticket,
  employees,
  canManageTeam,
  canEscalate,
  onEscalate,
  canRequestQa,
  onRequestQa,
  canResolve,
  onMarkResolved,
  onAssigneeChange,
  onStatusChange,
  onViewEmployee,
}) => {
  const [assigneeId, setAssigneeId] = useState(ticket.assignedToId);
  const [note, setNote] = useState("");
  const history = [...ticket.timeline].reverse();
  const assignedEmployee = employees.find((employee) => employee.id === ticket.assignedToId);

  const reassign = () => {
    if (!canManageTeam || !assigneeId || assigneeId === ticket.assignedToId) return;
    onAssigneeChange(assigneeId, note.trim() || undefined);
    setNote("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="ticket-history-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 id="ticket-history-heading" className="text-sm font-bold text-slate-900">Assignment &amp; workflow history</h3>
            <p className="mt-1 text-xs text-slate-500">See who handled the ticket and what changed.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{history.length} events</span>
        </div>
        {history.length ? (
          <ol className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                {(() => {
                  const author = employees.find((employee) => employee.id === item.performedById || employee.name === item.author);
                  return author ? (
                    <button
                      type="button"
                      onClick={() => onViewEmployee?.(author.id)}
                      aria-label={`View ${author.name} details`}
                      className="mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white transition hover:ring-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <StaffAvatar src={author.avatar} alt={`${author.name} profile`} sizeClassName="h-10 w-10" fallbackClassName="text-[18px]" />
                    </button>
                  ) : (
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600" aria-hidden="true">
                      {item.author.slice(0, 1).toUpperCase()}
                    </span>
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-xs font-bold text-slate-800">{item.author}</p>
                    <time className="text-[10px] text-slate-400">{formatTimestamp(item.timestamp)}</time>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-indigo-600">{item.action}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.note || "No note left."}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">No history recorded yet.</p>}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="ticket-history-actions-heading">
        <div>
          <h3 id="ticket-history-actions-heading" className="text-sm font-bold text-slate-900">Escalate or reassign</h3>
          <p className="mt-1 text-xs text-slate-500">Route the ticket to the right person or team.</p>
        </div>
        <button type="button" onClick={() => assignedEmployee && onViewEmployee?.(assignedEmployee.id)} disabled={!assignedEmployee || !onViewEmployee} className="flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-left transition enabled:hover:bg-indigo-100 disabled:cursor-default" aria-label={assignedEmployee ? `View ${assignedEmployee.name} employee details` : undefined}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
            <StaffAvatar src={assignedEmployee?.avatar || "person"} alt={`${ticket.assignedToName} profile`} sizeClassName="h-11 w-11" fallbackClassName="text-[21px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Currently assigned to</span>
            <span className="mt-1 block truncate text-sm font-bold text-indigo-700">{ticket.assignedToName}</span>
            <span className="block text-[11px] text-slate-500">{ticket.assignedToRole}</span>
          </span>
          {assignedEmployee && onViewEmployee && <span className="material-symbols-outlined shrink-0 text-[19px] text-indigo-500" aria-hidden="true">chevron_right</span>}
        </button>
        {canEscalate && <button type="button" onClick={onEscalate} className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-left hover:bg-amber-100">
          <span><span className="block text-xs font-bold text-amber-900">Escalate to Senior Support</span><span className="mt-0.5 block text-[11px] text-amber-700">Move this ticket into escalation.</span></span>
          <span className="material-symbols-outlined text-[18px] text-amber-700">trending_up</span>
        </button>}
        {canRequestQa && <button type="button" onClick={onRequestQa} className="flex w-full items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-3 text-left hover:bg-cyan-100">
          <span><span className="block text-xs font-bold text-cyan-900">Request QA Review</span><span className="mt-0.5 block text-[11px] text-cyan-700">Send the ticket to quality validation.</span></span>
          <span className="material-symbols-outlined text-[18px] text-cyan-700">fact_check</span>
        </button>}
        {canResolve && <button type="button" onClick={onMarkResolved} className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-left hover:bg-emerald-100">
          <span><span className="block text-xs font-bold text-emerald-900">Mark Resolved</span><span className="mt-0.5 block text-[11px] text-emerald-700">Record the resolution and close the investigation.</span></span>
          <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
        </button>}
        {canManageTeam && <div className="border-t border-slate-100 pt-4">
          <label htmlFor="history-reassign" className="block text-xs font-bold text-slate-700">Reassign ticket</label>
          <select id="history-reassign" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.roleTitle}</option>)}
          </select>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a handoff note (optional)" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="button" onClick={reassign} disabled={assigneeId === ticket.assignedToId} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Apply reassignment</button>
        </div>}
        <div className="border-t border-slate-100 pt-4">
          <label htmlFor="history-status" className="block text-xs font-bold text-slate-700">Update status</label>
          <select id="history-status" value={ticket.status} onChange={(event) => onStatusChange(event.target.value as TicketStatus)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            {(["Open", "In Progress", "Escalated", "Under Review", "Pending QA", "Resolved", "Closed"] as TicketStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </section>
    </div>
  );
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}
