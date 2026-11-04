import React from "react";

interface DashboardStatsRowProps {
  p1Count: number;
  p2Count: number;
  p3Count: number;
  whatsappCount: number;
  emailCount: number;
  phoneCount: number;
  totalTickets: number;
}

export const DashboardStatsRow: React.FC<DashboardStatsRowProps> = ({
  p1Count,
  p2Count,
  p3Count,
  whatsappCount,
  emailCount,
  phoneCount,
  totalTickets,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-900 p-5 shadow-md transition-shadow hover:shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              hub
            </span>
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              Ticket Channels
            </span>
          </div>
        </div>

        <div className="my-3 grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center rounded-xl border border-emerald-100 bg-white/90 p-3 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              chat
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-emerald-800">
              WhatsApp
            </span>
            <span className="mt-0.5 font-mono text-xl font-extrabold text-emerald-700">
              {whatsappCount}
            </span>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-blue-100 bg-white/90 p-3 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-blue-600">
              mail
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-blue-800">
              Email
            </span>
            <span className="mt-0.5 font-mono text-xl font-extrabold text-blue-700">
              {emailCount}
            </span>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-purple-100 bg-white/90 p-3 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-purple-600">
              call
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-purple-800">
              Phone
            </span>
            <span className="mt-0.5 font-mono text-xl font-extrabold text-purple-700">
              {phoneCount}
            </span>
          </div>
        </div>
      </div>
      {/* Severity Breakdown Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-900 p-5 shadow-md transition-shadow hover:shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              signal_cellular_alt
            </span>
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              Ticket Severity
            </span>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-black">
            {totalTickets} Total Tracked
          </span>
        </div>

        <div className="my-3 grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-white/90 p-3 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600"></span>
              <span className="text-[11px] font-bold text-red-700">
                P1 Urgent
              </span>
            </div>
            <span className="font-mono text-xl font-extrabold text-red-700">
              {p1Count}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-white/90 p-3 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <span className="text-[11px] font-bold text-blue-700">
                P2 Normal
              </span>
            </div>
            <span className="font-mono text-xl font-extrabold text-blue-700">
              {p2Count}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
              <span className="text-[11px] font-bold text-slate-700">
                P3 Low
              </span>
            </div>
            <span className="font-mono text-xl font-extrabold text-slate-800">
              {p3Count}
            </span>
          </div>
        </div>
      </div>

      {/* Inbound Omnichannel Breakdown Card */}
    </div>
  );
};
