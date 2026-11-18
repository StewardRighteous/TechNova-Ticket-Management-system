import React, { useState } from "react";
import type { Ticket, Team, Department, InboundChannel } from "../../types/barrel";
import { computeChannelBreakdown, computeDepartmentBreakdown } from "./dashboardMetrics";

export interface VolumeBreakdownCardsProps {
  tickets: Ticket[];
  teams?: Team[];
  departments?: Department[];
}

const deptColors = ["bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
const channelThemes: Record<InboundChannel, { icon: string; bg: string; border: string; iconBg: string; iconColor: string; barColor: string }> = {
  whatsapp: { icon: "chat", bg: "bg-emerald-50/50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", barColor: "bg-emerald-500" },
  email: { icon: "mail", bg: "bg-blue-50/50", border: "border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-700", barColor: "bg-blue-500" },
  phone: { icon: "call", bg: "bg-purple-50/50", border: "border-purple-100", iconBg: "bg-purple-100", iconColor: "text-purple-700", barColor: "bg-purple-500" },
};

export const VolumeBreakdownCards: React.FC<VolumeBreakdownCardsProps> = ({ tickets, teams = [], departments = [] }) => {
  const [activeTab, setActiveTab] = useState<"department" | "channel">("department");
  const channelBreakdown = computeChannelBreakdown(tickets);
  const deptBreakdown = computeDepartmentBreakdown(tickets, teams, departments);
  const isChannel = activeTab === "channel";

  return (
    <section className="h-full min-h-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`material-symbols-outlined rounded-lg p-1.5 text-[18px] ${isChannel ? "bg-indigo-50 text-indigo-600" : "bg-sky-50 text-sky-600"}`}>{isChannel ? "hub" : "corporate_fare"}</span>
          <h2 className="truncate text-sm font-bold text-slate-900">Tickets by {isChannel ? "Intake Channel" : "Department"}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{isChannel ? `${tickets.length} total` : `${deptBreakdown.length} units`}</span>
      </div>

      <div className="mt-3 flex gap-1 border-b border-slate-100 pb-2" role="tablist" aria-label="Ticket breakdown">
        <button type="button" role="tab" aria-selected={!isChannel} onClick={() => setActiveTab("department")} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${!isChannel ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}>Department</button>
        <button type="button" role="tab" aria-selected={isChannel} onClick={() => setActiveTab("channel")} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${isChannel ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}>Intake channel</button>
      </div>

      {isChannel ? (
        <div role="tabpanel" className="space-y-4 pt-4">
          {channelBreakdown.map((item) => <div key={item.channel} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold text-slate-800">{item.label}</span>
              <span className="shrink-0"><strong className="font-mono text-slate-900">{item.count}</strong><span className="ml-2 text-[10px] text-slate-400">({item.percentage}%)</span></span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${channelThemes[item.channel].barColor} transition-all`} style={{ width: `${item.percentage}%` }} /></div>
          </div>)}
        </div>
      ) : (
        <div role="tabpanel" className="space-y-4 pt-4">
          {deptBreakdown.map((item, idx) => <div key={item.departmentId} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold text-slate-800">{item.name}</span>
              <span className="shrink-0"><strong className="font-mono text-slate-900">{item.count}</strong><span className="ml-2 text-[10px] text-slate-400">({item.percentage}%)</span></span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${deptColors[idx % deptColors.length]} transition-all`} style={{ width: `${item.percentage}%` }} /></div>
          </div>)}
          {deptBreakdown.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No department distribution data available.</p>}
        </div>
      )}
    </section>
  );
};
