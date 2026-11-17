import React from 'react';
import type { Company } from '../../types/barrel';
import { ChannelBadge } from '../common/barrel';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
              {company.code}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{company.name}</h3>
              <span className="text-[11px] text-slate-500 font-medium">{company.tier}</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {company.status}
          </span>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Primary Contact:</span>
            <span className="font-semibold text-slate-800">{company.contactName} ({company.contactRole})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Direct Comms:</span>
            <div className="flex items-center gap-1.5">
              <ChannelBadge channel={company.preferredChannel} showText={false} />
              <span className="font-mono text-slate-700 text-[11px]">{company.contactEmail}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Account Lead:</span>
            <span className="font-medium text-indigo-600">{company.accountManager}</span>
          </div>
        </div>

        {/* Subscribed Services Tags */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Contracted Services
          </span>
          <div className="flex flex-wrap gap-1.5">
            {company.subscribedServices.map((srv, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {srv}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="mt-6 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">SLA Target</span>
          <span className="font-bold text-indigo-700 font-mono">{company.slaResponseTime}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Active Tickets</span>
          <span className="font-bold text-slate-800 font-mono">{company.activeTickets}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Contracts</span>
          <span className="font-bold text-slate-800 font-mono">{company.activeContracts}</span>
        </div>
      </div>
    </div>
  );
};
