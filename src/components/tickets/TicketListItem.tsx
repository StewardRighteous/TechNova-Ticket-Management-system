import React from "react";
import type { Ticket } from "../../types";
import { ChannelBadge, PriorityBadge, StatusBadge } from "../common";

interface TicketListItemProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: () => void;
}

export const TicketListItem: React.FC<TicketListItemProps> = ({
  ticket,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer flex-col gap-2.5 rounded-xl border p-4 transition-all ${
        isSelected
          ? "border-indigo-400 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-700">
            {ticket.code}
          </span>
          <ChannelBadge channel={ticket.channel} showText={false} />
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          {ticket.timeAgo}
        </span>
      </div>

      <div>
        <h4 className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-indigo-600">
          {ticket.title}
        </h4>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
          {ticket.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        <span className="max-w-25 truncate font-medium text-slate-600">
          {ticket.assignedToName}
        </span>
      </div>
    </div>
  );
};
