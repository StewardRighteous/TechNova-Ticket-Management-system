import React from "react";
import type { Ticket } from "../../types";

interface TicketBannerProps {
  ticket: Ticket;
}

export const TicketBanner: React.FC<TicketBannerProps> = ({ ticket }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-2 md:flex-row md:items-center">
        <div className="flex-1">
          <h1 className="text-lg leading-snug font-bold tracking-tight text-white sm:text-2xl">
            {ticket.title}
          </h1>
        </div>
      </div>
      <div className="mt-2 grid w-full grid-cols-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Client</span>
          <span className="text-sm font-bold text-slate-300 capitalize">
            {ticket.companyName}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Assigned To</span>
          <span className="text-sm font-bold text-slate-300 capitalize">
            {ticket.assignedToName}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Deadline</span>
          <span className="text-sm font-bold text-slate-300 capitalize">
            {ticket.slaDeadline}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Priority</span>
          <span className="text-sm font-bold text-slate-300 capitalize">
            {ticket.priority.slice(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
