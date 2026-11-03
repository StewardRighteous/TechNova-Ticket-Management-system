import React from 'react';
import type { CompanyInfo } from '../../types';

interface DashboardHeroProps {
  companyInfo: CompanyInfo;
  onExploreTickets: () => void;
  onNewTicket: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  companyInfo,
  onExploreTickets,
  onNewTicket,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Live Operations Dispatch
            </span>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {companyInfo.version}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {companyInfo.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {companyInfo.tagline}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExploreTickets}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>All Tickets</span>
          </button>
          <button
            onClick={onNewTicket}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 shadow-inner">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">SLA Adherence</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">{companyInfo.slaHealth}</span>
          <span className="text-[11px] text-slate-400">On Target Resolution</span>
        </div>
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 shadow-inner">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active Backlog</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono mt-0.5 block">{companyInfo.activeBacklog}</span>
          <span className="text-[11px] text-slate-400">Open Incidents</span>
        </div>
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 shadow-inner">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Workload Level</span>
          <span className="text-xl font-extrabold text-indigo-300 font-mono mt-0.5 block">{companyInfo.allocatedWorkload}</span>
          <span className="text-[11px] text-slate-400">Active Routing Rate</span>
        </div>
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 shadow-inner">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Engineers On Shift</span>
          <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{companyInfo.activeAgents}</span>
          <span className="text-[11px] text-slate-400">{companyInfo.avgPerAgent} avg / specialist</span>
        </div>
      </div>
    </div>
  );
};
