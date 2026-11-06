import React, { useState } from "react";
import type { Employee, Ticket, TicketStatus } from "../../types";

interface TicketAssignmentProgressProps {
  ticket: Ticket;
  employees: Employee[];
  onAssigneeChange: (employeeId: string, note?: string) => void;
  onStatusChange: (status: TicketStatus) => void;
}

export const TicketAssignmentProgress: React.FC<
  TicketAssignmentProgressProps
> = ({ ticket, employees, onAssigneeChange, onStatusChange }) => {
  const [assigneeId, setAssigneeId] = useState(ticket.assignedToId);
  const [note, setNote] = useState("");
  const progress = [...ticket.timeline].reverse();

  const reassign = () => {
    if (!assigneeId || assigneeId === ticket.assignedToId) return;
    onAssigneeChange(assigneeId, note.trim() || undefined);
    setNote("");
  };

  return (
    <section className="grid grid-cols-[2.5fr_0.5fr] gap-2 rounded-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-md pb-3 pl-1 font-bold">History</h1>
        {progress.length ? (
          <ol className="grid grid-cols-3 space-y-3 space-x-1">
            {progress.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-xl border-2 border-slate-100 p-3 hover:shadow-md"
              >
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-indigo-500">
                  {item.fromAssigneeId || item.toAssigneeId
                    ? "assignment_ind"
                    : "task_alt"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      {item.author}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.role}
                    </p>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-indigo-500">
                    {item.action}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {item.note?.trim() || "No note left."}
                  </p>
                </div>
                <time className="text-[10px] text-slate-400">
                  {item.timestamp}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">
            No assignment progress has been recorded yet.
          </p>
        )}
      </div>

      <div className="flex flex-col space-y-0.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex flex-col gap-4 pb-1">
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-xs">
            <p className="text-xs font-semibold text-slate-600 capitalize">
              Currently assigned to
            </p>
            <p className="mt-1 font-bold text-indigo-500">
              {ticket.assignedToName}
            </p>
          </div>
          <div className="flex min-w-70 items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">
              Update Status
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
                className="mt-1 block w-70 rounded-lg border border-slate-700 bg-white px-2.5 py-2 text-xs font-bold tracking-normal text-slate-800 normal-case outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Under Review">Under Review</option>
                <option value="Pending QA">Pending QA</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
          </div>

          <label className="text-xs font-semibold text-slate-600">
            Reassign to
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} · {employee.roleTitle}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What should the next person know?"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <button
            onClick={reassign}
            disabled={assigneeId === ticket.assignedToId}
            className="self-end rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reassign
          </button>
        </div>
      </div>
    </section>
  );
};
