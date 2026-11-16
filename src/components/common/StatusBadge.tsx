import React from "react";
import type { TicketPriority, TicketStatus } from "../../types";

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = "bg-surface-container text-on-surface-variant";

  switch (status) {
    case "Open":
      colorStyles = "text-amber-800 border";
      break;
    case "In Progress":
      colorStyles = "text-indigo-800 border";
      break;
    case "Escalated":
      colorStyles = "text-rose-800 border";
      break;
    case "Pending QA":
      colorStyles = "text-purple-800 border";
      break;
    case "Under Review":
      colorStyles = "text-cyan-800 border";
      break;
    case "Resolved":
      colorStyles = "text-orange-800 border";
      break;
    case "Closed":
      colorStyles = "text-emerald-800 border";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${colorStyles}  px-2 py-0.5 text-xs font-semibold`}
    >
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let badgeClasses = "bg-surface-container text-on-surface-variant";

  if (
    priority.includes("P1") ||
    priority.toLowerCase().includes("urgent") ||
    priority.toLowerCase().includes("high")
  ) {
    badgeClasses = "text-red-800 border border-red-200";
  } else if (
    priority.includes("P2") ||
    priority.toLowerCase().includes("normal") ||
    priority.toLowerCase().includes("medium")
  ) {
    badgeClasses = "text-blue-800 border border-blue-200";
  } else if (
    priority.includes("P3") ||
    priority.toLowerCase().includes("low")
  ) {
    badgeClasses = "text-slate-800 border border-slate-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-slate-800 ${badgeClasses}`}
    >
      {priority.slice(2)}
    </span>
  );
};
