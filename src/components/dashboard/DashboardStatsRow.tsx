import React from 'react';

interface DashboardStatsRowProps {
  p1Count: number;
  p2Count: number;
  p3Count: number;
  whatsappCount: number;
  emailCount: number;
  phoneCount: number;
  totalTickets: number;
}

export const DashboardStatsRow: React.FC<DashboardStatsRowProps> = ({
  p1Count,
  p2Count,
  p3Count,
  whatsappCount,
  emailCount,
  phoneCount,
  totalTickets,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Severity Breakdown Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">signal_cellular_alt</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Severity Distribution</span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {totalTickets} Total Tracked
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 my-3 text-center">
          <div className="bg-red-50/80 p-3 rounded-xl border border-red-100 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[11px] font-bold text-red-700">P1 Urgent</span>
            </div>
            <span className="text-xl font-extrabold text-red-700 font-mono">{p1Count}</span>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span className="text-[11px] font-bold text-blue-700">P2 Normal</span>
            </div>
            <span className="text-xl font-extrabold text-blue-700 font-mono">{p2Count}</span>
          </div>

          <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span className="text-[11px] font-bold text-slate-700">P3 Low</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 font-mono">{p3Count}</span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
          <div className="bg-red-500 h-full transition-all" style={{ width: `${(p1Count / (totalTickets || 1)) * 100}%` }}></div>
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(p2Count / (totalTickets || 1)) * 100}%` }}></div>
          <div className="bg-slate-400 h-full transition-all" style={{ width: `${(p3Count / (totalTickets || 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Inbound Omnichannel Breakdown Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">hub</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inbound Channels</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Omnichannel Sync Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 my-3 text-center">
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
            <span className="text-[11px] font-bold text-emerald-800 mt-0.5">WhatsApp</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{whatsappCount}</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-[18px] text-blue-600">mail</span>
            <span className="text-[11px] font-bold text-blue-800 mt-0.5">Email</span>
            <span className="text-xl font-extrabold text-blue-700 font-mono mt-0.5">{emailCount}</span>
          </div>

          <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-[18px] text-purple-600">call</span>
            <span className="text-[11px] font-bold text-purple-800 mt-0.5">Phone</span>
            <span className="text-xl font-extrabold text-purple-700 font-mono mt-0.5">{phoneCount}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center font-medium">
          Automatically routed to available Tier-1 support specialists
        </div>
      </div>
    </div>
  );
};
