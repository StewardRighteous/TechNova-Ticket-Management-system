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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {/* Total Active Tickets */}
      <button type="button" onClick={onActiveClick} className="group relative flex min-h-[76px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 border-t-[3px] border-t-indigo-500 bg-white px-3 py-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:ring-2 focus:ring-indigo-300 focus:outline-none">
        <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl shadow-slate-900/20 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">Tickets currently open and being worked on.</span>
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-indigo-50 p-1.5 text-[20px] text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">confirmation_number</span>
        <span className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-slate-900">{totalActive} <span className="text-sm font-semibold text-slate-600">Active Tickets</span></span>
      </button>

      {/* Overdue Tickets */}
      <button type="button" onClick={onOverdueClick} className="group relative flex min-h-[76px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 border-t-[3px] border-t-amber-400 bg-white px-3 py-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:ring-2 focus:ring-amber-300 focus:outline-none">
        <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl shadow-slate-900/20 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">Tickets past their due date.</span>
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-amber-50 p-1.5 text-[20px] text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">schedule</span>
        <span className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-slate-900">{overdueCount} <span className="text-sm font-semibold text-slate-600">Overdue</span></span>
      </button>

      {/* SLA risk receives one clear accent within the shared KPI card style. */}
      <button
        type="button"
        onClick={onSlaRiskClick}
        data-testid="sla-risk-kpi"
        className="group relative flex min-h-[76px] w-full cursor-pointer items-center gap-2.5 rounded-xl border border-rose-200 border-t-[3px] border-t-rose-600 bg-white px-3 py-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-rose-300 focus:outline-none"
        aria-label="View high-attention and critical incidents"
      >
        <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl shadow-slate-900/20 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">Tickets approaching or past their SLA deadline.</span>
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-rose-50 p-1.5 text-[20px] text-rose-700">warning</span>
        <span className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-rose-700">{slaAtRiskOrBreachedCount} <span className="text-sm font-semibold text-slate-600">SLA at risk</span></span>
      </button>

      {/* Average Resolution Time */}
      <button type="button" onClick={onResolvedClick} className="group relative flex min-h-[76px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 border-t-[3px] border-t-emerald-500 bg-white px-3 py-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:ring-2 focus:ring-emerald-300 focus:outline-none">
        <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl shadow-slate-900/20 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">Average time taken to resolve a ticket.</span>
        <span className="material-symbols-outlined shrink-0 rounded-lg bg-emerald-50 p-1.5 text-[20px] text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">timelapse</span>
        <span className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-slate-900">{formattedAvgResolutionTime} <span className="text-sm font-semibold text-slate-600">Avg Resolution</span></span>
      </button>
    </div>
  );
};
