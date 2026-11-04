import React from "react";
import type { Ticket, TicketStatus } from "../../types";
import { ChannelBadge, PriorityBadge } from "../common";

interface TicketBannerProps {
  ticket: Ticket;
  onStatusChange: (status: TicketStatus) => void;
}

export const TicketBanner: React.FC<TicketBannerProps> = ({
  ticket,
  onStatusChange,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
        <div className="flex-1">
          <h1 className="text-xl leading-snug font-bold tracking-tight text-white sm:text-2xl">
            {ticket.title}
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            {ticket.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col justify-start gap-7 md:flex-row md:items-start">
        <div className="min-w-70 space-y-2 rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-xs">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Ticket Details
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Ticket No:</span>
            <span className="font-bold text-slate-300">{ticket.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Channel:</span>
            <span className="font-bold text-slate-300 capitalize">
              {ticket.channel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Priority:</span>
            <span className="font-bold text-slate-300">{ticket.priority}</span>
          </div>
        </div>
        <div className="min-w-70 space-y-2 rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-xs">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Ticket Status
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Client:</span>
            <span className="font-bold text-white">{ticket.companyName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned:</span>
            <span className="font-bold text-indigo-300">
              {ticket.assignedToName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Deadline:</span>
            <span className="font-bold text-amber-400">
              {ticket.slaDeadline}
            </span>
          </div>
        </div>
        <div className="flex min-w-70 items-center gap-3">
          <label className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
            Update Status
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
              className="mt-1 block w-70 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold tracking-normal text-white normal-case outline-none focus:ring-2 focus:ring-indigo-400"
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
      </div>
    </div>
  );
};
