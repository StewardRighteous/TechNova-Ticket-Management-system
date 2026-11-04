import React, { useState } from 'react';
import type { Employee, Ticket } from '../../types';

interface TicketAssignmentProgressProps {
  ticket: Ticket;
  employees: Employee[];
  onAssigneeChange: (employeeId: string, note?: string) => void;
}

export const TicketAssignmentProgress: React.FC<TicketAssignmentProgressProps> = ({ ticket, employees, onAssigneeChange }) => {
  const [assigneeId, setAssigneeId] = useState(ticket.assignedToId);
  const [note, setNote] = useState('');
  const progress = [...ticket.timeline].reverse();

  const reassign = () => {
    if (!assigneeId || assigneeId === ticket.assignedToId) return;
    onAssigneeChange(assigneeId, note.trim() || undefined);
    setNote('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Assignment progress</h2>
          <p className="mt-1 text-xs text-slate-500">See who handled the ticket, what changed, and the notes they left.</p>
        </div>
        <div className="rounded-xl bg-indigo-50 px-4 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">Currently assigned to</p>
          <p className="mt-1 font-bold text-indigo-900">{ticket.assignedToName}</p>
          <p className="text-indigo-700">{ticket.assignedToRole}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
        <label className="text-xs font-semibold text-slate-600">Reassign to<select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.roleTitle}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Handoff note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should the next person know?" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500" /></label>
        <button onClick={reassign} disabled={assigneeId === ticket.assignedToId} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Reassign</button>
      </div>

      {progress.length ? <ol className="space-y-3">
        {progress.map((item) => <li key={item.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
          <span className="mt-0.5 material-symbols-outlined text-[18px] text-indigo-500">{item.fromAssigneeId || item.toAssigneeId ? 'assignment_ind' : 'task_alt'}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-xs font-bold text-slate-800">{item.author} <span className="font-medium text-slate-500">· {item.role}</span></p>
              <time className="text-[10px] text-slate-400">{item.timestamp}</time>
            </div>
            <p className="mt-1 text-xs font-semibold text-indigo-700">{item.action}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.note?.trim() || 'No note left.'}</p>
          </div>
        </li>)}
      </ol> : <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">No assignment progress has been recorded yet.</p>}
    </section>
  );
};
