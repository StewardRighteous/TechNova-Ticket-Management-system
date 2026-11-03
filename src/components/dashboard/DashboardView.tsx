import React from 'react';
import { useTicketStore } from '../../store';
import { DashboardStatsRow } from './DashboardStatsRow';
import { DashboardTicketTable } from './DashboardTicketTable';

export const DashboardView: React.FC = () => {
  const { data, setSelectedTicketId, setActiveTab } = useTicketStore();

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab('tickets');
  };

  const p1Count = data.tickets.filter((t) => t.priority.includes('P1')).length;
  const p2Count = data.tickets.filter((t) => t.priority.includes('P2')).length;
  const p3Count = data.tickets.filter((t) => t.priority.includes('P3')).length;

  const whatsappCount = data.tickets.filter((t) => t.channel === 'whatsapp').length;
  const emailCount = data.tickets.filter((t) => t.channel === 'email').length;
  const phoneCount = data.tickets.filter((t) => t.channel === 'phone').length;

  return (
    <div className="flex flex-col w-full">
      {/* Subheader Control Band */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Executive Operations Dispatch
          </h1>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {data.companyInfo.version}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SLA Health: {data.companyInfo.slaHealth} on target
          </span>
          <button
            onClick={() => setActiveTab('tickets')}
            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>View All Tickets</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Body */}
      <div className="p-8 space-y-8">
        <DashboardStatsRow
          companyInfo={data.companyInfo}
          p1Count={p1Count}
          p2Count={p2Count}
          p3Count={p3Count}
          whatsappCount={whatsappCount}
          emailCount={emailCount}
          phoneCount={phoneCount}
        />

        <DashboardTicketTable
          tickets={data.tickets}
          onSelectTicket={handleSelectTicket}
        />
      </div>
    </div>
  );
};
