import React, { useState, useEffect } from "react";

interface SlaCountdownProps {
  deadline: string;
  dueAt?: string;
  risk: "On Target" | "At Risk" | "Breached";
}

/** Parses a human-friendly deadline string like "4h 30m" into total seconds. */
function parseDeadlineToSeconds(deadline: string): number | null {
  const hMatch = deadline.match(/(\d+)\s*h/i);
  const mMatch = deadline.match(/(\d+)\s*m/i);
  if (!hMatch && !mMatch) return null;
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
  return hours * 3600 + minutes * 60;
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({
  deadline,
  dueAt,
  risk,
}) => {
  const initialSeconds = ticketSecondsUntil(dueAt) ?? parseDeadlineToSeconds(deadline) ?? 0;
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (initialSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);

  const riskStyles =
    risk === "Breached"
      ? "bg-rose-500/20 text-rose-200 border-rose-400/40"
      : risk === "At Risk"
        ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
        : "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";

  const dotStyles =
    risk === "Breached"
      ? "bg-rose-400 animate-pulse"
      : risk === "At Risk"
        ? "bg-amber-400 animate-pulse"
        : "bg-emerald-400";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold ${riskStyles}`}
    >
      <span className={`size-2 rounded-full ${dotStyles}`} />
      <span>{formatCountdown(remaining)}</span>
      <span className="text-[10px] font-medium opacity-70">{risk}</span>
    </div>
  );
};

function ticketSecondsUntil(dueAt?: string): number | null {
  if (!dueAt) return null;
  const timestamp = Date.parse(dueAt);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
}
