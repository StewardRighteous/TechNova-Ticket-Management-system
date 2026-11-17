import React from "react";
import type { Employee, Ticket } from "../../types";

interface OwnershipCardProps {
  ticket: Ticket;
  employees: Employee[];
}

export const OwnershipCard: React.FC<OwnershipCardProps> = ({
  ticket,
  employees,
}) => {
  const assignee = employees.find((e) => e.id === ticket.assignedToId);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        Ownership
      </h4>

      {/* Assignee */}
      <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {assignee
            ? assignee.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
            : "??"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {ticket.assignedToName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {ticket.assignedToRole}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 space-y-2.5">
        <MetaRow label="Department" value="Support" />
        <MetaRow label="Status" value={assignee?.status ?? "Available"} />
        <MetaRow label="Active Tickets" value={String(assignee?.activeTicketsCount ?? "—")} />
        <MetaRow label="Service Line" value={ticket.serviceName} />
        <MetaRow label="Client" value={ticket.companyName} />
        <MetaRow label="Contact" value={ticket.clientContact} />
      </div>

      {/* SLA & Diagnostics */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          SLA & Diagnostics
        </h4>
        <MetaRow label="SLA Status" value={`${ticket.slaRisk} (${ticket.slaDeadline})`} />
        <MetaRow label="Environment" value={ticket.environment} />
        {ticket.diagnosticData?.browser && (
          <MetaRow label="Browser" value={ticket.diagnosticData.browser} />
        )}
        {ticket.diagnosticData?.operatingSystem && (
          <MetaRow label="OS" value={ticket.diagnosticData.operatingSystem} />
        )}
        {ticket.diagnosticData?.clusterNode && (
          <MetaRow label="Node" value={ticket.diagnosticData.clusterNode} />
        )}
        {ticket.diagnosticData?.affectedUsers !== undefined && (
          <MetaRow
            label="Affected Users"
            value={String(ticket.diagnosticData.affectedUsers)}
            highlight
          />
        )}
        {ticket.diagnosticData?.errorRate && (
          <MetaRow label="Error Rate" value={ticket.diagnosticData.errorRate} />
        )}
      </div>
    </div>
  );
};

const MetaRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-400">{label}</span>
    <span
      className={`font-mono text-[11px] ${highlight ? "font-bold text-red-600" : "text-slate-700"}`}
    >
      {value}
    </span>
  </div>
);
