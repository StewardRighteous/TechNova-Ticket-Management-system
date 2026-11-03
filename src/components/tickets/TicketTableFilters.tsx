import React from 'react';
import type { InboundChannel } from '../../types';

interface TicketTableFiltersProps {
  channelFilter: 'all' | InboundChannel;
  setChannelFilter: (c: 'all' | InboundChannel) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  onCreateNew: () => void;
}

export const TicketTableFilters: React.FC<TicketTableFiltersProps> = ({
  channelFilter,
  setChannelFilter,
  priorityFilter,
  setPriorityFilter,
  onCreateNew
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
        <button
          onClick={() => setChannelFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
            channelFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setChannelFilter('whatsapp')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'whatsapp' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp
        </button>
        <button
          onClick={() => setChannelFilter('email')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">mail</span> Email
        </button>
        <button
          onClick={() => setChannelFilter('phone')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'phone' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">call</span> Phone
        </button>
      </div>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
      >
        <option value="all">All Severities</option>
        <option value="P1">P1 Urgent</option>
        <option value="P2">P2 Normal</option>
        <option value="P3">P3 Low</option>
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
