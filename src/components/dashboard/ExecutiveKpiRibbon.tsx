import React from "react";

export interface ExecutiveKpiRibbonProps {
  totalActive: number;
  overdueCount: number;
  slaAtRiskOrBreachedCount: number;
  formattedAvgResolutionTime: string;
  onActiveClick?: () => void;
  onOverdueClick?: () => void;
  onSlaRiskClick?: () => void;
  onResolvedClick?: () => void;
}

export const ExecutiveKpiRibbon: React.FC<ExecutiveKpiRibbonProps> = ({
  totalActive,
  overdueCount,
  slaAtRiskOrBreachedCount,
  formattedAvgResolutionTime,
  onActiveClick,
  onOverdueClick,
  onSlaRiskClick,
  onResolvedClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Active Tickets */}
      <button type="button" onClick={onActiveClick} className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 border-t-[3px] border-t-indigo-500 bg-white px-4 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:ring-2 focus:ring-indigo-300 focus:outline-none">
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-indigo-50 p-2 text-[20px] text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">confirmation_number</span>
        <span className="min-w-0 flex-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Active Tickets</span>
        <span className="shrink-0 text-3xl font-extrabold tracking-tight text-slate-900">{totalActive}</span>
      </button>

      {/* Overdue Tickets */}
      <button type="button" onClick={onOverdueClick} className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 border-t-[3px] border-t-amber-400 bg-white px-4 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:ring-2 focus:ring-amber-300 focus:outline-none">
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-amber-50 p-2 text-[20px] text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">schedule</span>
        <span className="min-w-0 flex-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Overdue</span>
        <span className="shrink-0 text-3xl font-extrabold tracking-tight text-slate-900">{overdueCount}</span>
      </button>

      {/* SLA risk receives one clear accent within the shared KPI card style. */}
      <button
        type="button"
        onClick={onSlaRiskClick}
        data-testid="sla-risk-kpi"
        className="group flex min-h-[92px] w-full items-center gap-3 rounded-2xl border border-rose-200 border-t-[3px] border-t-rose-600 bg-white px-4 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-rose-300 focus:outline-none"
        aria-label="View high-attention and critical incidents"
      >
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-rose-50 p-2 text-[20px] text-rose-700">warning</span>
        <span className="min-w-0 flex-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">SLA at risk</span>
        <span className="shrink-0 text-3xl font-extrabold tracking-tight text-rose-700">{slaAtRiskOrBreachedCount}</span>
      </button>

      {/* Average Resolution Time */}
      <button type="button" onClick={onResolvedClick} className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 border-t-[3px] border-t-emerald-500 bg-white px-4 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:ring-2 focus:ring-emerald-300 focus:outline-none">
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-emerald-50 p-2 text-[20px] text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">timelapse</span>
        <span className="min-w-0 flex-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Avg resolution time</span>
        <span className="shrink-0 text-3xl font-extrabold tracking-tight text-slate-900">{formattedAvgResolutionTime}</span>
      </button>
    </div>
  );
};
