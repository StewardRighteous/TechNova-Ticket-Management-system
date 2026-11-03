import React from 'react';
import type { Ticket } from '../../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from '../common';

interface TicketBannerProps {
  ticket: Ticket;
}

export const TicketBanner: React.FC<TicketBannerProps> = ({ ticket }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xl font-extrabold text-indigo-400">{ticket.code}</span>
          <ChannelBadge channel={ticket.channel} />
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        <div className="text-xs font-mono text-slate-400">
          {ticket.channelIdentifier} • Logged {ticket.timeAgo}
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {ticket.title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {ticket.description}
          </p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 min-w-[220px] text-xs space-y-2">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Quick Status</div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Client:</span>
            <span className="font-bold text-white">{ticket.companyName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">SLA:</span>
            <span className="font-bold text-amber-400">{ticket.slaDeadline}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Engineer:</span>
            <span className="font-bold text-indigo-300">{ticket.assignedToName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
