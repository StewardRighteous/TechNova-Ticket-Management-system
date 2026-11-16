import React from "react";

export interface ExecutiveKpiRibbonProps {
  totalActive: number;
  overdueCount: number;
  slaAtRiskOrBreachedCount: number;
  formattedAvgResolutionTime: string;
}

export const ExecutiveKpiRibbon: React.FC<ExecutiveKpiRibbonProps> = ({
  totalActive,
  overdueCount,
  slaAtRiskOrBreachedCount,
  formattedAvgResolutionTime,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Total Active Tickets */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Active Tickets
          </span>
          <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-2 text-[20px] text-indigo-600">
            confirmation_number
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {totalActive}
          </p>
          <p className="mt-1 text-xs text-slate-400">In flight & unresolved</p>
        </div>
      </div>

      {/* Overdue Tickets */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Overdue
          </span>
          <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-[20px] text-amber-600">
            schedule
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {overdueCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Past target SLA date</p>
        </div>
      </div>

      {/* SLA Breached / At Risk count - highlighted in crimson */}
      <div
        data-testid="sla-risk-kpi"
        className="flex flex-col justify-between rounded-2xl border-2 border-rose-500 bg-gradient-to-br from-rose-50/80 via-white to-red-50/50 p-5 shadow-xs transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-rose-700 uppercase">
            SLA Breached / At Risk
          </span>
          <span className="material-symbols-outlined rounded-lg bg-rose-100 p-2 text-[20px] text-rose-600">
            warning
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tracking-tight text-rose-700">
              {slaAtRiskOrBreachedCount}
            </p>
            {slaAtRiskOrBreachedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                Attention
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-rose-600/90">Requires executive escalation</p>
        </div>
      </div>

      {/* Average Resolution Time */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Avg Resolution Time
          </span>
          <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-[20px] text-emerald-600">
            timelapse
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {formattedAvgResolutionTime}
          </p>
          <p className="mt-1 text-xs text-slate-400">Mean duration to resolve</p>
        </div>
      </div>
    </div>
  );
};
