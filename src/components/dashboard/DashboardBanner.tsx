import React, { useMemo } from "react";

interface DashboardBannerProps {
  userName?: string;
  totalTickets: number;
  dueToday: number;
  employeesPresent: number;
  closedTickets: number;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  userName = "Arthur Pendelton",
  totalTickets,
  dueToday,
  employeesPresent,
  closedTickets,
}) => {
  // Determine time of day greeting dynamically
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  }, []);

  const summaryMetrics = [
    {
      label: "Total tickets",
      value: totalTickets,

      iconColor: "text-indigo-500 bg-indigo-50",
    },
    {
      label: "Due today",
      value: dueToday,

      iconColor: "text-amber-500 bg-amber-50",
    },
    {
      label: "Employees present",
      value: employeesPresent,

      iconColor: "text-emerald-500 bg-emerald-50",
    },
    {
      label: "Closed tickets",
      value: closedTickets,

      iconColor: "text-blue-500 bg-blue-50",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Dynamic Greeting */}
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
            Overview Dashboard
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {greeting}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            Here is a snapshot of your system metrics and operations for today.
          </p>
        </div>

        {/* Right Corner: 4 Compact Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
          {summaryMetrics.map((metric) => {
            return (
              <div
                key={metric.label}
                className="flex min-w-[130px] flex-col justify-between rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md transition hover:bg-white/15"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-[11px] font-medium text-slate-300">
                    {metric.label}
                  </span>
                  <div className={`rounded-lg p-1.5 ${metric.iconColor}`}></div>
                </div>
                <div className="mt-2 text-xl font-bold text-white">
                  {metric.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
