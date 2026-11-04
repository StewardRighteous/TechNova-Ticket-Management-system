import React from 'react';
import type { InboundChannel, TicketPriority, TicketStatus } from '../../types';

type PriorityFilter = 'all' | Extract<TicketPriority, 'P1 Urgent' | 'P2 Normal' | 'P3 Low'>;

interface TicketTableFiltersProps {
  channelFilter: 'all' | InboundChannel;
  setChannelFilter: (c: 'all' | InboundChannel) => void;
  priorityFilter: PriorityFilter;
  setPriorityFilter: (p: PriorityFilter) => void;
  statusFilter: 'all' | TicketStatus;
  setStatusFilter: (status: 'all' | TicketStatus) => void;
  onCreateNew: () => void;
}

export const TicketTableFilters: React.FC<TicketTableFiltersProps> = ({
  channelFilter,
  setChannelFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  onCreateNew
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
      >
        <option value="all">All Priorities</option>
        <option value="P1 Urgent">P1 Urgent</option>
        <option value="P2 Normal">P2 Normal</option>
        <option value="P3 Low">P3 Low</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as 'all' | TicketStatus)}
        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
        aria-label="Filter by status"
      >
        <option value="all">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Escalated">Escalated</option>
        <option value="Under Review">Under Review</option>
        <option value="Pending QA">Pending QA</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      <select
        value={channelFilter}
        onChange={(e) => setChannelFilter(e.target.value as 'all' | InboundChannel)}
        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
        aria-label="Filter by channel"
      >
        <option value="all">All Channels</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
      </select>

      <button
        onClick={onCreateNew}
        className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800 shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">add</span> New
      </button>
    </div>
  );
};
