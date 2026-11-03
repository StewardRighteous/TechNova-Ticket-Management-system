import React from 'react';
import { useTicketStore } from '../../store';

export const SettingsView: React.FC = () => {
  const { data } = useTicketStore();

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Configurations & SLA Rules</h1>
        <p className="text-xs text-slate-500">
          Global dispatch parameters for TechNova Solutions Pvt. Ltd
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Omnichannel Routing Engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp Gateway
              </div>
              <p className="mt-1 text-slate-600">Webhook connected to TechNova WhatsApp Business API</p>
              <div className="mt-2 text-[10px] text-emerald-700 font-mono font-semibold">Status: Active (Latency 45ms)</div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <span className="material-symbols-outlined text-[18px]">mail</span> Support Email Ingress
              </div>
              <p className="mt-1 text-slate-600">IMAP/SMTP parsing for support@technova.com</p>
              <div className="mt-2 text-[10px] text-blue-700 font-mono font-semibold">Status: Polling every 60s</div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-2 font-bold text-purple-800">
                <span className="material-symbols-outlined text-[18px]">call</span> Phone Hotline IVR
              </div>
              <p className="mt-1 text-slate-600">Twilio SIP trunk routing to tier-1 dispatch roster</p>
              <div className="mt-2 text-[10px] text-purple-700 font-mono font-semibold">Status: 24/7 Hotline Live</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            SLA Escalation Matrix
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-red-600">P1 Urgent (Critical Outage)</span>
                <p className="text-slate-500 text-[11px]">Auto-escalates to Senior Support after 15m without triage</p>
              </div>
              <span className="font-mono font-bold text-slate-800">Response: 15m • Resolution: 4h</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-blue-600">P2 Normal (Major Defect)</span>
                <p className="text-slate-500 text-[11px]">Routes to Lead Software Engineer / QA</p>
              </div>
              <span className="font-mono font-bold text-slate-800">Response: 1h • Resolution: 24h</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-600">P3 Low (Minor Inquiry)</span>
                <p className="text-slate-500 text-[11px]">Handled by Support Agents during scheduled shift</p>
              </div>
              <span className="font-mono font-bold text-slate-800">Response: 4h • Resolution: 72h</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-400 font-mono">
          System Revision: {data.companyInfo.version} • Workspace: {data.companyInfo.name}
        </div>
      </div>
    </div>
  );
};
