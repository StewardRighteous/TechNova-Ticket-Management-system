import React from "react";
import type { Ticket, Team, Department, InboundChannel } from "../../types";
import {
  computeChannelBreakdown,
  computeDepartmentBreakdown,
} from "./dashboardMetrics";

export interface VolumeBreakdownCardsProps {
  tickets: Ticket[];
  teams?: Team[];
  departments?: Department[];
}

const channelIcons: Record<InboundChannel, string> = {
  whatsapp: "chat",
  email: "mail",
  phone: "call",
};

const channelColorThemes: Record<
  InboundChannel,
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    barColor: string;
    textColor: string;
  }
> = {
  whatsapp: {
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-900",
  },
  email: {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    barColor: "bg-blue-500",
    textColor: "text-blue-900",
  },
  phone: {
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    barColor: "bg-purple-500",
    textColor: "text-purple-900",
  },
};

const deptColors = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
];

export const VolumeBreakdownCards: React.FC<VolumeBreakdownCardsProps> = ({
  tickets,
  teams = [],
  departments = [],
}) => {
  const channelBreakdown = computeChannelBreakdown(tickets);
  const deptBreakdown = computeDepartmentBreakdown(tickets, teams, departments);

  const totalTickets = tickets.length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Channel Volume Breakdown Card */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
                hub
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Tickets by Intake Channel
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {totalTickets} total
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {channelBreakdown.map((item) => {
              const theme = channelColorThemes[item.channel];
              return (
                <div
                  key={item.channel}
                  className={`flex flex-col items-center justify-between rounded-xl border ${theme.border} ${theme.bg} p-3 text-center transition hover:shadow-xs`}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconColor}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {channelIcons[item.channel]}
                    </span>
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-800">
                    {item.label}
                  </span>
                  <p className="mt-1 font-mono text-2xl font-extrabold text-slate-900">
                    {item.count}
                  </p>
                  <span className="text-[10px] font-medium text-slate-500">
                    {item.percentage}% volume
                  </span>
                </div>
              );
            })}
          </div>

          {/* Visual Channel Share Bar */}
          <div className="mt-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              {channelBreakdown.map((item) => {
                const theme = channelColorThemes[item.channel];
                return (
                  <div
                    key={item.channel}
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full ${theme.barColor} transition-all`}
                    title={`${item.label}: ${item.percentage}%`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Department Volume Breakdown Card */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined rounded-lg bg-sky-50 p-1.5 text-[18px] text-sky-600">
                corporate_fare
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Tickets by Department
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {deptBreakdown.length} units
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {deptBreakdown.map((item, idx) => {
              const barColor = deptColors[idx % deptColors.length];
              return (
                <div key={item.departmentId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {deptBreakdown.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-400">
                No department distribution data available.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
