import React from 'react';
import type { TicketPriority, TicketStatus } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = 'bg-surface-container text-on-surface-variant';
  let dotColor = 'bg-gray-400';

  switch (status) {
    case 'Open':
      colorStyles = 'bg-amber-100 text-amber-800 border border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'In Progress':
      colorStyles = 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
    case 'Escalated':
      colorStyles = 'bg-rose-100 text-rose-800 border border-rose-200';
      dotColor = 'bg-rose-600';
      break;
    case 'Pending QA':
      colorStyles = 'bg-purple-100 text-purple-800 border border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case 'Resolved':
    case 'Closed':
      colorStyles = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      dotColor = 'bg-emerald-600';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${colorStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let badgeClasses = 'bg-surface-container text-on-surface-variant';
  let dotColor = 'bg-gray-400';

  if (priority.includes('P1') || priority.toLowerCase().includes('urgent') || priority.toLowerCase().includes('high')) {
    badgeClasses = 'bg-red-100 text-red-800 border border-red-200';
    dotColor = 'bg-red-600';
  } else if (priority.includes('P2') || priority.toLowerCase().includes('normal') || priority.toLowerCase().includes('medium')) {
    badgeClasses = 'bg-blue-100 text-blue-800 border border-blue-200';
    dotColor = 'bg-blue-600';
  } else if (priority.includes('P3') || priority.toLowerCase().includes('low')) {
    badgeClasses = 'bg-slate-100 text-slate-800 border border-slate-200';
    dotColor = 'bg-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {priority}
    </span>
  );
};
