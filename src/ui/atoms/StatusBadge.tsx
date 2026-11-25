import React from "react";
import type { TicketPriority, TicketStatus } from "../../types/barrel";

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = "bg-surface-container text-on-surface-variant";

  switch (status) {
    case "Open":
      colorStyles = "border border-sky-300 bg-sky-50 text-sky-900";
      break;
    case "In Progress":
      colorStyles = "border border-indigo-300 bg-indigo-50 text-indigo-900";
      break;
    case "Escalated":
      colorStyles = "border border-rose-300 bg-rose-50 text-rose-900";
      break;
    case "Pending QA":
      colorStyles = "border border-purple-300 bg-purple-50 text-purple-900";
      break;
    case "Under Review":
      colorStyles = "border border-cyan-300 bg-cyan-50 text-cyan-900";
      break;
    case "Resolved":
      colorStyles = "border border-orange-300 bg-orange-50 text-orange-900";
      break;
    case "Closed":
      colorStyles = "border border-emerald-300 bg-emerald-50 text-emerald-900";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full ${colorStyles} px-2 py-1 text-xs font-semibold`}
    >
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
  showCode?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showCode = false }) => {
  let badgeClasses = "bg-surface-container text-on-surface-variant";

  if (
    priority.includes("P1") ||
    priority.toLowerCase().includes("urgent") ||
    priority.toLowerCase().includes("high")
  ) {
    badgeClasses = "bg-red-50 text-red-900";
  } else if (
    priority.includes("P2") ||
    priority.toLowerCase().includes("normal") ||
    priority.toLowerCase().includes("medium")
  ) {
    badgeClasses = "bg-slate-100 text-slate-900";
  } else if (
    priority.includes("P3") ||
    priority.toLowerCase().includes("low")
  ) {
    badgeClasses = "bg-slate-100 text-slate-900";
  } else if (
    priority.includes("P4") ||
    priority.toLowerCase().includes("trivial")
  ) {
    badgeClasses = "bg-sky-50 text-sky-800";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses}`}
    >
      {showCode ? priority : priority.replace(/^P\d\s*/i, "")}
    </span>
  );
};
