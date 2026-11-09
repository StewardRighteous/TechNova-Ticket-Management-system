import React from "react";
import type { TicketPriority, TicketStatus } from "../../types";

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = "bg-surface-container text-on-surface-variant";
  let dotColor = "bg-gray-400";

  switch (status) {
    case "Open":
      colorStyles = "text-amber-800 border";
      dotColor = "bg-amber-500";
      break;
    case "In Progress":
      colorStyles = "text-indigo-800 border";
      dotColor = "bg-indigo-500";
      break;
    case "Escalated":
      colorStyles = "text-rose-800 border";
      dotColor = "bg-rose-600";
      break;
    case "Pending QA":
      colorStyles = "text-purple-800 border";
      dotColor = "bg-purple-500";
      break;
    case "Under Review":
      colorStyles = "text-cyan-800 border";
      dotColor = "bg-cyan-800";
      break;
    case "Resolved":
      colorStyles = "text-orange-800 border";
      dotColor = "bg-orange-800";
      break;
    case "Closed":
      colorStyles = "text-emerald-800 border";
      dotColor = "bg-emerald-600";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${colorStyles}  px-2 py-0.5 text-xs font-semibold`}
    >
      {/* <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span> */}
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let badgeClasses = "bg-surface-container text-on-surface-variant";
  let dotColor = "bg-gray-400";

  if (
    priority.includes("P1") ||
    priority.toLowerCase().includes("urgent") ||
    priority.toLowerCase().includes("high")
  ) {
    badgeClasses = " text-red-800 border border-red-200";
    dotColor = "bg-red-600";
  } else if (
    priority.includes("P2") ||
    priority.toLowerCase().includes("normal") ||
    priority.toLowerCase().includes("medium")
  ) {
    badgeClasses = " text-blue-800 border border-blue-200";
    dotColor = "bg-blue-600";
  } else if (
    priority.includes("P3") ||
    priority.toLowerCase().includes("low")
  ) {
    badgeClasses = " text-slate-800 border border-slate-200";
    dotColor = "bg-slate-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-slate-800`}
    >
      {/* <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span> */}
      {priority.slice(2)}
    </span>
  );
};
