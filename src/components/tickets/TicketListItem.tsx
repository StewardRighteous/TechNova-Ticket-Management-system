import React from 'react';
import type { Ticket } from '../../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from '../common';

interface TicketListItemProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: () => void;
}

export const TicketListItem: React.FC<TicketListItemProps> = ({
  ticket,
  isSelected,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
        isSelected
          ? 'bg-indigo-50/50 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-indigo-700">{ticket.code}</span>
          <ChannelBadge channel={ticket.channel} showText={false} />
        </div>
        <span className="text-[11px] font-mono text-slate-400">{ticket.timeAgo}</span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600">
          {ticket.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ticket.description}</p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        <span className="font-medium text-slate-600 truncate max-w-[100px]">{ticket.assignedToName}</span>
      </div>
    </div>
  );
};
