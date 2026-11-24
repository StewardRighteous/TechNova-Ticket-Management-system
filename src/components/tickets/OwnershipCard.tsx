import { Heading } from "../../ui/barrel";
import React from "react";
import type { Employee, Ticket } from "../../types/barrel";

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
      <Heading as="h4" variant="plain" className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        Ownership
      </Heading>

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

    </div>
  );
};
