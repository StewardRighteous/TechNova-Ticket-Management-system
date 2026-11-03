import React from 'react';
import type { Ticket } from '../../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from '../common';

interface DashboardTicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

export const DashboardTicketTable: React.FC<DashboardTicketTableProps> = ({
  tickets,
  onSelectTicket
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Top Escalated Incidents & Priority Queue
            </h2>
            <p className="text-xs text-slate-500">Live operational dispatch feed across client service agreements</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {tickets.length} Active in Feed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-6">ID & Channel</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Incident Summary</th>
              <th className="py-3 px-4">Service Line</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 group-hover:underline">
                      {t.code}
                    </span>
                    <ChannelBadge channel={t.channel} showText={false} />
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {t.companyCode}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{t.companyName}</span>
                      <span className="text-[11px] text-slate-400">{t.clientContact}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {t.serviceName}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{t.assignedToName}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">{t.assignedToRole}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(t.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 transition-all shadow-sm"
                  >
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
