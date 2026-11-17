import React from "react";
import type { Ticket } from "../../types";
import { StatusBadge, PriorityBadge, ChannelBadge } from "../common";
import { SlaCountdown } from "./SlaCountdown";

interface HeroBannerProps {
  ticket: Ticket;
  onEscalate: () => void;
  onRequestQa: () => void;
  onResolve: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  ticket,
  onEscalate,
  onRequestQa,
  onResolve,
}) => {
  const isTerminal =
    ticket.status === "Resolved" || ticket.status === "Closed";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6  text-white shadow-lg sm:p-8">
      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full bg-[length:24px_24px] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
      </div>
      <div className="flex justify-between items-center">
        {/* Title */}
        <h1 className="relative  text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
          {ticket.title}
        </h1>
        {/* Quick Action row */}
        <div className="relative flex flex-wrap items-center gap-2">
          <QuickActionButton
            icon="trending_up"
            label="Escalate"
            variant="rose"
            disabled={isTerminal || ticket.status === "Escalated"}
            onClick={onEscalate}
          />
          <QuickActionButton
            icon="fact_check"
            label="Request QA Review"
            variant="purple"
            disabled={isTerminal || ticket.status === "Pending QA"}
            onClick={onRequestQa}
          />
          <QuickActionButton
            icon="check_circle"
            label="Mark Resolved"
            variant="emerald"
            disabled={isTerminal}
            onClick={onResolve}
          />
      </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

type Variant = "rose" | "purple" | "emerald";

const variantStyles: Record<
  Variant,
  { base: string; hover: string; disabled: string }
> = {
  rose: {
    base: "bg-rose-500/15 text-rose-200 border-rose-400/30",
    hover: "hover:bg-rose-500/30",
    disabled: "opacity-40 cursor-not-allowed",
  },
  purple: {
    base: "bg-purple-500/15 text-purple-200 border-purple-400/30",
    hover: "hover:bg-purple-500/30",
    disabled: "opacity-40 cursor-not-allowed",
  },
  emerald: {
    base: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    hover: "hover:bg-emerald-500/30",
    disabled: "opacity-40 cursor-not-allowed",
  },
};

const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  variant: Variant;
  disabled?: boolean;
  onClick: () => void;
}> = ({ icon, label, variant, disabled = false, onClick }) => {
  const v = variantStyles[variant];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${v.base} ${disabled ? v.disabled : v.hover}`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
};
