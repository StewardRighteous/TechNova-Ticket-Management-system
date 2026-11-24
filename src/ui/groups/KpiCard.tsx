import { useId } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

const tones = {
  indigo: {
    border: "border-t-indigo-500 hover:border-indigo-300",
    icon: "bg-indigo-50 text-indigo-600",
  },
  amber: { border: "border-t-amber-400 hover:border-amber-300", icon: "bg-amber-50 text-amber-600" },
  rose: { border: "border-t-rose-600 hover:border-rose-300", icon: "bg-rose-50 text-rose-700" },
  emerald: {
    border: "border-t-emerald-500 hover:border-emerald-300",
    icon: "bg-emerald-50 text-emerald-600",
  },
};

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: string;
  description: string;
  tone: keyof typeof tones;
  onClick?: () => void;
  "aria-label"?: string;
  "data-testid"?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  description,
  tone,
  onClick,
  ...attributes
}: KpiCardProps) {
  const descriptionId = useId();
  const color = tones[tone];
  const cardClass = `flex min-h-[76px] items-center gap-2.5 rounded-xl border border-t-[3px] border-slate-200 bg-white px-3 py-2 text-left shadow-xs ${color.border}`;
  const content = (
    <>
      <Icon aria-hidden="true" className={`shrink-0 rounded-lg p-1.5 text-[20px] ${color.icon}`}>
        {icon}
      </Icon>
      <span
        className={`min-w-0 flex-1 text-xl font-extrabold tracking-tight ${tone === "rose" ? "text-rose-700" : "text-slate-900"}`}
      >
        {value} <span className="text-sm font-semibold text-slate-600">{label}</span>
      </span>
    </>
  );

  if (!onClick)
    return (
      <div className={cardClass} title={description}>
        {content}
      </div>
    );
  return (
    <Button
      type="button"
      tone="plain"
      onClick={onClick}
      aria-describedby={descriptionId}
      {...attributes}
      className={`group relative w-full transition hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
    >
      <span
        id={descriptionId}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max max-w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {description}
      </span>
      {content}
    </Button>
  );
}
