import { useId, type ReactNode } from "react";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";

const statusColors = {
  info: "bg-blue-700/80 text-white",
  warning: "bg-amber-300/20 text-amber-100",
  review: "bg-cyan-600/80 text-white",
  pending: "bg-violet-700/80 text-white",
  positive: "bg-teal-400/20 text-teal-100",
  neutral: "bg-white/15 text-slate-200",
};

export type BannerStatusTone = keyof typeof statusColors;

interface DetailBannerProps {
  title: string;
  status: string;
  statusTone?: BannerStatusTone;
  subtitle?: ReactNode;
  icon: ReactNode;
  iconAppearance?: "tile" | "plain";
  actions?: ReactNode;
  metrics: readonly (readonly [label: string, value: ReactNode, icon?: string])[];
  columns?: 3 | 4;
}

export function DetailBanner({
  title,
  status,
  statusTone = "positive",
  subtitle,
  icon,
  iconAppearance = "tile",
  actions,
  metrics,
  columns = 4,
}: DetailBannerProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex size-12 shrink-0 items-center justify-center overflow-hidden text-teal-200 ${iconAppearance === "tile" ? "rounded-lg bg-white/10" : ""}`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Heading as="h1" id={titleId} variant="inverse">
                {title}
              </Heading>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[statusTone]}`}
              >
                {status}
              </span>
            </div>
            {subtitle && <p className="mt-1 text-xs text-slate-200">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{actions}</div>
        )}
      </div>
      <dl
        className={`grid grid-cols-2 border-t border-white/15 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}
      >
        {metrics.map(([label, value, metricIcon]) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-2.5 border-white/10 px-4 py-2.5 sm:border-r sm:px-5 sm:last:border-r-0"
          >
            {metricIcon && (
              <Icon aria-hidden="true" className="shrink-0 text-[20px] text-teal-200">
                {metricIcon}
              </Icon>
            )}
            <div className="min-w-0">
              <dt className="text-[10px] text-slate-300">{label}</dt>
              <dd className="truncate text-xs font-semibold">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
