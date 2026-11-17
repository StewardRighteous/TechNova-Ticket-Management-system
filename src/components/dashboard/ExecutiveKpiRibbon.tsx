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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Total Active Tickets */}
      <button type="button" onClick={onActiveClick} className="group flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:ring-2 focus:ring-indigo-300 focus:outline-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Active Tickets
          </span>
          <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-2 text-[20px] text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
            confirmation_number
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {totalActive}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            <span>Unresolved tickets in active statuses</span>
          </div>
        </div>
      </button>

      {/* Overdue Tickets */}
      <button type="button" onClick={onOverdueClick} className="group flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-amber-400 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:ring-2 focus:ring-amber-300 focus:outline-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Overdue
          </span>
          <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-[20px] text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">
            schedule
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {overdueCount}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span>Active tickets past due date</span>
          </div>
        </div>
      </button>

      {/* SLA risk receives one clear accent within the shared KPI card style. */}
      <button
        type="button"
        onClick={onSlaRiskClick}
        data-testid="sla-risk-kpi"
        className="flex w-full flex-col justify-between rounded-xl border border-rose-500 border-t-4 border-t-rose-600 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-rose-300 focus:outline-none"
        aria-label="View high-attention and critical incidents"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-rose-700 uppercase">
            SLA Breached / At Risk
          </span>
          <span aria-hidden="true" className="material-symbols-outlined rounded-lg bg-rose-50 p-2 text-[20px] text-rose-700">
            warning
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tracking-tight text-rose-700">
              {slaAtRiskOrBreachedCount}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600/90">
            <span className="size-1.5 rounded-full bg-rose-600" />
            <span>Active requests with SLA risk</span>
          </div>
        </div>
      </button>

      {/* Average Resolution Time */}
      <button type="button" onClick={onResolvedClick} className="group flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:ring-2 focus:ring-emerald-300 focus:outline-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Avg Resolution Time
          </span>
          <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-[20px] text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
            timelapse
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {formattedAvgResolutionTime}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Resolution time for resolved and closed</span>
          </div>
        </div>
      </button>
    </div>
  );
};
