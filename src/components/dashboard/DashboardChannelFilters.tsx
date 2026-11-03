import React from 'react';
import type { InboundChannel } from '../../types';

interface DashboardChannelFiltersProps {
  channelFilter: 'all' | InboundChannel;
  setChannelFilter: (c: 'all' | InboundChannel) => void;
  onExploreAll: () => void;
}

export const DashboardChannelFilters: React.FC<DashboardChannelFiltersProps> = ({
  channelFilter,
  setChannelFilter,
  onExploreAll
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
        <button
          onClick={() => setChannelFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
            channelFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setChannelFilter('whatsapp')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'whatsapp' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">chat</span> WhatsApp
        </button>
        <button
          onClick={() => setChannelFilter('email')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">mail</span> Email
        </button>
        <button
          onClick={() => setChannelFilter('phone')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            channelFilter === 'phone' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">call</span> Phone
        </button>
      </div>

      <button
        onClick={onExploreAll}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
      >
        <span>Open Registry</span>
        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
      </button>
    </div>
  );
};
