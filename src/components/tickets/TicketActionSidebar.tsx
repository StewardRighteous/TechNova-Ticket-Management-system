import React from 'react';
import type { Ticket, Employee, TicketStatus } from '../../types';

interface TicketActionSidebarProps {
  ticket: Ticket;
  employees: Employee[];
  onStatusChange: (status: TicketStatus) => void;
  onAssigneeChange: (empId: string) => void;
}

export const TicketActionSidebar: React.FC<TicketActionSidebarProps> = ({
  ticket,
  employees,
  onStatusChange,
  onAssigneeChange
}) => {
  const statusOptions: TicketStatus[] = [
    'Open',
    'In Progress',
    'Escalated',
    'Under Review',
    'Pending QA',
    'Resolved',
    'Closed'
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Dispatch Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Workflow Controls
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Status</label>
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Engineer</label>
          <select
            value={ticket.assignedToId}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.roleTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SLA & Diagnostics Metadata */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          SLA Target & Diagnostics
        </h4>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">SLA Status:</span>
          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {ticket.slaRisk} ({ticket.slaDeadline})
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Environment:</span>
          <span className="font-mono text-slate-800 text-[11px]">{ticket.environment}</span>
        </div>

        {ticket.diagnosticData && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5">
            {ticket.diagnosticData.clusterNode && (
              <div className="flex justify-between">
                <span className="text-slate-400">Node:</span>
                <span className="font-mono text-slate-700 text-[11px]">{ticket.diagnosticData.clusterNode}</span>
              </div>
            )}
            {ticket.diagnosticData.affectedUsers !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Affected Users:</span>
                <span className="font-bold text-red-600">{ticket.diagnosticData.affectedUsers}</span>
              </div>
            )}
            {ticket.diagnosticData.errorRate && (
              <div className="flex justify-between">
                <span className="text-slate-400">Error Rate:</span>
                <span className="font-bold text-amber-600">{ticket.diagnosticData.errorRate}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
