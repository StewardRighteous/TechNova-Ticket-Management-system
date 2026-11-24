import React, { useState } from 'react';
import type { Ticket, Employee, TicketStatus } from "../../types/barrel";
import { Heading, ChannelBadge, PriorityBadge, StatusBadge } from "../../ui/barrel";
import { TicketTimeline } from "./TicketTimeline";
import { TicketActionSidebar } from "./TicketActionSidebar";

interface TicketDetailViewProps {
  ticket: Ticket;
  employees: Employee[];
  onStatusChange: (status: TicketStatus) => void;
  onAssigneeChange: (empId: string) => void;
  onAddTimelineNote: (note: string) => void;
  onBackToList?: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket,
  employees,
  onStatusChange,
  onAssigneeChange,
  onAddTimelineNote
}) => {
  const [newNote, setNewNote] = useState('');

  const handlePostNote = () => {
    if (!newNote.trim()) return;
    onAddTimelineNote(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-indigo-700">{ticket.code}</span>
            <ChannelBadge channel={ticket.channel} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {ticket.channelIdentifier} • Logged {ticket.timeAgo}
          </div>
        </div>

        <div className="mt-4">
          <Heading as="h1" variant="plain" className="text-xl font-bold text-slate-900 leading-snug">{ticket.title}</Heading>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {ticket.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Client:</span>
            <span className="font-bold text-slate-800">{ticket.companyName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Service Line:</span>
            <span className="font-semibold text-indigo-600">{ticket.serviceName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Contact:</span>
            <span className="font-medium text-slate-800">{ticket.clientContact}</span>
          </div>
        </div>
      </div>

      {/* Grid: Timeline (Left) & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketTimeline
            timeline={ticket.timeline}
            newNote={newNote}
            setNewNote={setNewNote}
            onAddNote={handlePostNote}
          />
        </div>
        <div>
          <TicketActionSidebar
            ticket={ticket}
            employees={employees}
            onStatusChange={onStatusChange}
            onAssigneeChange={onAssigneeChange}
          />
        </div>
      </div>
    </div>
  );
};
