import React from 'react';
import type { CompanyInfo } from '../../types';

interface DashboardStatsRowProps {
  companyInfo: CompanyInfo;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  whatsappCount: number;
  emailCount: number;
  phoneCount: number;
}

export const DashboardStatsRow: React.FC<DashboardStatsRowProps> = ({
  companyInfo,
  p1Count,
  p2Count,
  p3Count,
  whatsappCount,
  emailCount,
  phoneCount
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Tickets Backlog */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Backlog
          </span>
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">inbox</span>
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {companyInfo.activeBacklog}
          </span>
          <span className="text-xs text-slate-500 font-medium">open tickets</span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-[15px]">trending_up</span> SLA {companyInfo.slaHealth}
          </span>
          <span className="font-mono text-slate-400">{companyInfo.version}</span>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Severity Distribution
          </span>
          <span className="text-xs font-mono font-semibold text-slate-500">{p1Count + p2Count + p3Count} Active</span>
        </div>
        <div className="grid grid-cols-3 gap-2 my-2 text-center">
          <div className="bg-red-50 p-2.5 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-red-600">P1 Urgent</span>
            <span className="text-lg font-bold text-red-700">{p1Count}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-blue-600">P2 Normal</span>
            <span className="text-lg font-bold text-blue-700">{p2Count}</span>
          </div>
          <div className="bg-slate-100 p-2.5 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-slate-600">P3 Low</span>
            <span className="text-lg font-bold text-slate-800">{p3Count}</span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
          <div className="bg-red-500 h-full" style={{ width: `${(p1Count / (p1Count + p2Count + p3Count || 1)) * 100}%` }}></div>
          <div className="bg-blue-500 h-full" style={{ width: `${(p2Count / (p1Count + p2Count + p3Count || 1)) * 100}%` }}></div>
          <div className="bg-slate-400 h-full" style={{ width: `${(p3Count / (p1Count + p2Count + p3Count || 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Inbound Omnichannel Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Inbound Channels
          </span>
          <span className="text-xs font-bold text-emerald-600">Omnichannel Active</span>
        </div>
        <div className="grid grid-cols-3 gap-2 my-2 text-center">
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex flex-col items-center">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
            <span className="text-[10px] font-semibold text-emerald-800 mt-0.5">WhatsApp</span>
            <span className="text-sm font-bold text-emerald-700">{whatsappCount}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex flex-col items-center">
            <span className="material-symbols-outlined text-[16px] text-blue-600">mail</span>
            <span className="text-[10px] font-semibold text-blue-800 mt-0.5">Email</span>
            <span className="text-sm font-bold text-blue-700">{emailCount}</span>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex flex-col items-center">
            <span className="material-symbols-outlined text-[16px] text-purple-600">call</span>
            <span className="text-[10px] font-semibold text-purple-800 mt-0.5">Phone</span>
            <span className="text-sm font-bold text-purple-700">{phoneCount}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 text-center">Auto-routed to active dispatcher queue</div>
      </div>

      {/* Capacity & Routing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workload Allocation
          </span>
          <span className="text-xs font-mono font-bold text-indigo-600">{companyInfo.allocatedWorkload} ACTIVE</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {companyInfo.assignedToEngineers}
            </span>
            <span className="text-xs text-slate-500 block">Assigned to engineers</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">{companyInfo.activeAgents} Staff</span>
            <span className="text-xs text-slate-400 block">{companyInfo.avgPerAgent} avg/agent</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Engineers On Shift: 8</span>
          <span className="text-indigo-600 font-semibold">Tier-1 & Tier-2 Live</span>
        </div>
      </div>
    </section>
  );
};
